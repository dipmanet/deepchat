import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getUserByClerkId } from "./_utils";

export const getAll = query({
	args: {
		chatId: v.id("chats"),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new ConvexError("Unauthorized");

		const currentUser = await getUserByClerkId({
			ctx,
			clerkId: identity.subject,
		});
		if (!currentUser) throw new ConvexError("User not found");

		// 1. Check membership
		const membership = await ctx.db
			.query("chatMembers")
			.withIndex("by_chat_user", (q) => q.eq("chatId", args.chatId).eq("userId", currentUser._id))
			.unique();

		if (!membership) {
			throw new ConvexError("Not a member of this chat");
		}

		// 2. Get messages (latest first)
		const messages = await ctx.db
			.query("messages")
			.withIndex("by_chat_createdAt", (q) => q.eq("chatId", args.chatId))
			.order("desc")
			.take(100);

		// 3. Attach sender info (optional but useful)
		const messagesWithSender = await Promise.all(
			messages.map(async (msg) => {
				const sender = await ctx.db.get(msg.senderId);
				return {
					...msg,
					sender,
					self: msg.senderId === currentUser._id,
				};
			}),
		);

		return messagesWithSender;
	},
});

export const create = mutation({
	args: {
		chatId: v.id("chats"),
		content: v.optional(v.string()),
		type: v.union(
			v.literal("text"),
			v.literal("image"),
			v.literal("file"),
			v.literal("video"),
			v.literal("audio"),
		),
		attachmentUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new ConvexError("Unauthorized");

		const currentUser = await getUserByClerkId({
			ctx,
			clerkId: identity.subject,
		});
		if (!currentUser) throw new ConvexError("User not found");

		// 1. Check membership
		const membership = await ctx.db
			.query("chatMembers")
			.withIndex("by_chat_user", (q) => q.eq("chatId", args.chatId).eq("userId", currentUser._id))
			.unique();

		if (!membership) {
			throw new ConvexError("Not a member of this chat");
		}

		// 2. Get chat
		const chat = await ctx.db.get(args.chatId);
		if (!chat) throw new ConvexError("Chat not found");

		// 3. 🚫 Restrict direct chat if not friends
		if (!chat.isGroup) {
			// get all members (should be 2)
			const members = await ctx.db
				.query("chatMembers")
				.withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
				.collect();

			const otherMember = members.find((m) => m.userId !== currentUser._id);

			if (!otherMember) {
				throw new ConvexError("Invalid chat");
			}

			// check friendship
			const friendship = await ctx.db
				.query("friends")
				.withIndex("by_user_friend", (q) =>
					q.eq("userId", currentUser._id).eq("friendId", otherMember.userId),
				)
				.unique();

			if (!friendship) {
				throw new ConvexError("You can only message friends");
			}
		}

		// 4. Prevent empty message
		if (!args.content && !args.attachmentUrl) {
			throw new ConvexError("Message cannot be empty");
		}

		// 5. Insert message
		const messageId = await ctx.db.insert("messages", {
			chatId: args.chatId,
			senderId: currentUser._id,
			content: args.content,
			type: args.type,
			attachmentUrl: args.attachmentUrl,
			createdAt: Date.now(),
			editedAt: undefined,
			deleted: false,
		});

		// 6. Update chat last message
		await ctx.db.patch(args.chatId, {
			lastMessageId: messageId,
			lastActiveAt: Date.now(),
		});

		return messageId;
	},
});
