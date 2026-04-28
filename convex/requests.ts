import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { requireUserQuery } from "./user";

export const get = query({
	args: {},
	handler: async (ctx) => {
		const currentUser = await requireUserQuery(ctx);

		const requests = await ctx.db
			.query("requests")
			.withIndex("by_receiver", (q) => q.eq("receiver", currentUser._id))
			.collect();

		const requestsWithSenderInfo = await Promise.all(
			requests.map(async (request) => {
				// FIX: ctx.db.get() takes only the document ID — table is inferred from the ID type
				const sender = await ctx.db.get(request.sender);
				if (!sender) {
					throw new ConvexError("Request sender could not be found");
				}
				return {
					...request,
					sender,
				};
			}),
		);
		return requestsWithSenderInfo;
	},
});

export const getSentRequests = query({
	args: {},
	handler: async (ctx) => {
		const currentUser = await requireUserQuery(ctx);

		const sentRequests = await ctx.db
			.query("requests")
			.withIndex("by_sender", (q) => q.eq("sender", currentUser._id))
			.collect();

		const requestsWithReceiverInfo = await Promise.all(
			sentRequests.map(async (request) => {
				// get user details of receivers
				const receiver = await ctx.db.get(request.receiver);
				if (!receiver) {
					throw new ConvexError("Request receiver could not be found");
				}
				return {
					...request,
					receiver,
				};
			}),
		);
		return requestsWithReceiverInfo;
	},
});

export const count = query({
	args: {},
	handler: async (ctx) => {
		const currentUser = await requireUserQuery(ctx);
		const requests = await ctx.db
			.query("requests")
			.withIndex("by_receiver", (q) => q.eq("receiver", currentUser._id))
			.collect();

		return requests?.length;
	},
});

export const create = mutation({
	args: {
		email: v.string(),
	},
	handler: async (ctx, args) => {
		const currentUser = await requireUserQuery(ctx);
		const normalizedEmail = args.email.trim().toLowerCase();

		if (normalizedEmail === currentUser.email.trim().toLowerCase()) {
			throw new ConvexError("Can't send a request to yourself");
		}

		const receiver = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", normalizedEmail))
			.unique();

		if (!receiver) {
			throw new ConvexError("User(receiver) not found");
		}

		const existingFriendship = await ctx.db
			.query("friends")
			.withIndex("by_user_friend", (q) =>
				q.eq("userId", currentUser._id).eq("friendId", receiver._id),
			)
			.unique();

		if (existingFriendship) {
			throw new ConvexError("You are already friends");
		}

		const requestAlreadySent = await ctx.db
			.query("requests")
			.withIndex("by_receiver_sender", (q) =>
				q.eq("receiver", receiver._id).eq("sender", currentUser._id),
			)
			.unique();

		if (requestAlreadySent) {
			throw new ConvexError("Request already sent");
		}

		const requestAlreadyReceived = await ctx.db
			.query("requests")
			.withIndex("by_receiver_sender", (q) =>
				q.eq("receiver", currentUser._id).eq("sender", receiver._id),
			)
			.unique();

		if (requestAlreadyReceived) {
			throw new ConvexError(
				"This user has already sent you a friend request. Check your pending requests.",
			);
		}

		const request = await ctx.db.insert("requests", {
			sender: currentUser._id,
			receiver: receiver._id,
		});

		return request;
	},
});

export const accept = mutation({
	args: {
		id: v.id("requests"),
	},
	handler: async (ctx, args) => {
		const currentUser = await requireUserQuery(ctx);

		const request = await ctx.db.get(args.id);
		if (!request || request.receiver !== currentUser._id) {
			throw new ConvexError("Request not found");
		}

		const senderId = request.sender;
		const receiverId = request.receiver;

		// ── Guard: already friends right now ────────────────────────────────
		const alreadyFriendA = await ctx.db
			.query("friends")
			.withIndex("by_user_friend", (q) => q.eq("userId", receiverId).eq("friendId", senderId))
			.first();

		const alreadyFriendB = await ctx.db
			.query("friends")
			.withIndex("by_user_friend", (q) => q.eq("userId", senderId).eq("friendId", receiverId))
			.first();

		if (alreadyFriendA || alreadyFriendB) {
			throw new ConvexError("Already friends");
		}

		// ── Check for a pre-existing DM chat from a previous friendship ─────
		// We query chatMembers to find a shared non-group chat between the two users,
		// even if the friend records were deleted when they unfriended each other.
		const senderMemberships = await ctx.db
			.query("chatMembers")
			.withIndex("by_userId", (q) => q.eq("userId", senderId))
			.collect();

		const receiverMemberships = await ctx.db
			.query("chatMembers")
			.withIndex("by_userId", (q) => q.eq("userId", receiverId))
			.collect();

		const senderChatIds = new Set(senderMemberships.map((m) => m.chatId));

		const sharedMembership = receiverMemberships.find((m) => senderChatIds.has(m.chatId));

		let existingChatId: Id<"chats"> | null = null;

		if (sharedMembership) {
			const sharedChat = await ctx.db.get(sharedMembership.chatId);
			// Only reuse if it's a DM (non-group) chat
			if (sharedChat && !sharedChat.isGroup) {
				existingChatId = sharedMembership.chatId;
			}
		}

		// ── Create a new chat only if no previous DM exists ─────────────────
		const chatId =
			existingChatId ??
			(await ctx.db.insert("chats", {
				isGroup: false,
				createdBy: receiverId,
			}));

		// Add chat members only if the chat was freshly created
		if (!existingChatId) {
			await ctx.db.insert("chatMembers", {
				chatId,
				userId: senderId,
				role: "member",
				joinedAt: Date.now(),
			});
			await ctx.db.insert("chatMembers", {
				chatId,
				userId: receiverId,
				role: "member",
				joinedAt: Date.now(),
			});
		}

		// ── Recreate friendship records in both directions ───────────────────
		await ctx.db.insert("friends", {
			userId: receiverId,
			friendId: senderId,
			createdAt: Date.now(),
			chatId,
		});

		await ctx.db.insert("friends", {
			userId: senderId,
			friendId: receiverId,
			createdAt: Date.now(),
			chatId,
		});

		await ctx.db.delete(request._id);
	},
});

export const deny = mutation({
	args: {
		id: v.id("requests"),
	},
	handler: async (ctx, args) => {
		const currentUser = await requireUserQuery(ctx);

		const request = await ctx.db.get(args.id);
		if (!request) {
			throw new ConvexError("Request not found");
		}

		// Only the receiver can deny a request
		if (request.receiver !== currentUser._id) {
			throw new ConvexError("Unauthorized: Only the receiver can deny a request");
		}

		await ctx.db.delete(request._id);
	},
});

export const cancel = mutation({
	args: {
		id: v.id("requests"),
	},
	handler: async (ctx, args) => {
		const currentUser = await requireUserQuery(ctx);

		const request = await ctx.db.get(args.id);
		if (!request) {
			throw new ConvexError("Request not found");
		}

		// Only the sender can cancel their own request
		if (request.sender !== currentUser._id) {
			throw new ConvexError("Unauthorized: Only the sender can cancel a request");
		}

		await ctx.db.delete(request._id);
	},
});
