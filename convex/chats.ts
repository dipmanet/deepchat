"use client";

import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserByClerkId } from "./_utils";

export const getAll = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new ConvexError("Unauthorized");
		}
		const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });
		if (!currentUser) {
			throw new ConvexError("User not found");
		}

		// 1. Get all memberships
		const memberships = await ctx.db
			.query("chatMembers")
			.withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
			.collect();

		// 2. Fetch chats
		const chats = await Promise.all(
			memberships.map(async (membership) => {
				const chat = await ctx.db.get(membership.chatId);
				if (!chat) {
					throw new ConvexError("Chat not found");
				}

				// 3. Get last message
				const lastMessage = chat.lastMessageId ? await ctx.db.get(chat.lastMessageId) : null;

				// 4. Get members
				const members = await ctx.db
					.query("chatMembers")
					.withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
					.collect();

				// 5. Resolve display (important)
				let displayName = chat.name;
				let displayImage = null;
				let friendId = null;

				if (!chat.isGroup) {
					// Direct message → get other user
					const otherMember = members.find((m) => m.userId !== currentUser._id);

					if (otherMember) {
						const otherUser = await ctx.db.get(otherMember.userId);
						displayName = otherUser?.username || "Unknown";
						displayImage = otherUser?.imageUrl || null;
						friendId = otherMember?.userId;
					}
				}

				return {
					_id: chat._id,
					name: displayName,
					image: displayImage,
					isGroup: chat.isGroup,
					friendId,
					lastMessage,
					updatedAt: lastMessage?.createdAt || 0,
				};
			}),
		);

		// 6. Clean + sort (latest first)
		return chats.filter(Boolean).sort((a, b) => b!.updatedAt - a!.updatedAt);
	},
});

export const get = query({
	args: {
		id: v.id("chats"),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new ConvexError("Unauthorized");
		}
		const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });
		if (!currentUser) {
			throw new ConvexError("User not found");
		}

		// Get chat
		const chat = await ctx.db.get(args.id);
		if (!chat) {
			throw new ConvexError("Chat not found");
		}

		// Check membership
		const membership = await ctx.db
			.query("chatMembers")
			.withIndex("by_chat_user", (q) => q.eq("chatId", chat._id).eq("userId", currentUser._id))
			.unique();

		if (!membership) {
			throw new ConvexError("Not a member of this chat");
		}

		// Get members
		const members = await ctx.db
			.query("chatMembers")
			.withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
			.collect();

		// Resolve display name & image
		let displayName = chat.name;
		let displayImage = null;
		let friend = null;
		let isFriend = null;

		if (!chat.isGroup) {
			const otherMember = members.find((m) => m.userId !== currentUser._id);
			if (otherMember) {
				const otherUser = await ctx.db.get(otherMember.userId);
				const isAFriend = await ctx.db
					.query("friends")
					.withIndex("by_user_friend", (q) =>
						q.eq("userId", currentUser._id).eq("friendId", otherMember.userId),
					)
					.unique();
				displayName = otherUser?.username || "Unknown";
				displayImage = otherUser?.imageUrl || null;
				friend = otherUser;
				isFriend = isAFriend;
			}
		}

		// 6. Return structured response
		return {
			...chat,
			displayName,
			members,
			displayImage,
			friend,
			isFriend,
		};
	},
});

export const remove = mutation({
	args: {
		id: v.id("chats"),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new ConvexError("Unauthorized");
		}

		const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });
		if (!currentUser) {
			throw new ConvexError("User not found");
		}

		// Get chat
		const chat = await ctx.db.get(args.id);
		if (!chat) {
			throw new ConvexError("Chat not found");
		}

		// Verify current user is a member of this chat
		const membership = await ctx.db
			.query("chatMembers")
			.withIndex("by_chat_user", (q) => q.eq("chatId", chat._id).eq("userId", currentUser._id))
			.unique();

		if (!membership) {
			throw new ConvexError("Not a member of this chat");
		}

		// Find all members in this chat group
		const allMembers = await ctx.db
			.query("chatMembers")
			.withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
			.collect();

		if (!chat.isGroup) {
			// ── Direct message chat ──────────────────────────────────────────
			// Find the other member in the group
			const otherMember = allMembers.find((m) => m.userId !== currentUser._id);

			if (otherMember) {
				// Check if the other person is still in the current user's friends list
				const friendship = await ctx.db
					.query("friends")
					.withIndex("by_user_friend", (q) =>
						q.eq("userId", currentUser._id).eq("friendId", otherMember.userId),
					)
					.unique();

				if (friendship) {
					throw new ConvexError(
						"Cannot remove this chat while the other user is still your friend. Remove them as a friend first.",
					);
				}
			}
		} else {
			// ── Group chat ───────────────────────────────────────────────────
			// Check if the current user is still an active member of the group
			const activeMembership = await ctx.db
				.query("chatMembers")
				.withIndex("by_chat_user", (q) => q.eq("chatId", chat._id).eq("userId", currentUser._id))
				.unique();

			if (activeMembership) {
				throw new ConvexError(
					"Cannot remove this group chat while you are still a member. Leave the group first.",
				);
			}
		}

		// ── Safe to delete ───────────────────────────────────────────────────
		// Delete all chat members
		await Promise.all(allMembers.map((m) => ctx.db.delete(m._id)));

		// Delete all messages in the chat
		const messages = await ctx.db
			.query("messages")
			.withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
			.collect();

		await Promise.all(messages.map((m) => ctx.db.delete(m._id)));

		// Delete the chat itself
		await ctx.db.delete(chat._id);
	},
});
