import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserByClerkId } from "./_utils";
import { requireUserQuery } from "./user";

export const getAll = query({
	args: { id: v.id("chats") },
	handler: async (ctx, args) => {
		const currentUser = await requireUserQuery(ctx);

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

		// Fetch member details
		const arrayMembers = await Promise.all(
			members.map(async (themember) => {
				const member = await ctx.db.get(themember.userId);
				if (!member) {
					throw new ConvexError("Member not found");
				}
				return member;
			}),
		);

		// Return
		return arrayMembers;
	},
});

export const remove = mutation({
	args: {
		chatId: v.id("chats"),
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new ConvexError("Unauthorized");

		const currentUser = await getUserByClerkId({
			ctx,
			clerkId: identity.subject,
		});
		if (!currentUser) throw new ConvexError("User not found");

		// 1. Ensure chat exists
		const chat = await ctx.db.get(args.chatId);
		if (!chat || !chat.isGroup) {
			throw new ConvexError("Group chat not found");
		}

		// 2. Check current user is admin
		const currentMembership = await ctx.db
			.query("chatMembers")
			.withIndex("by_chat_user", (q) => q.eq("chatId", args.chatId).eq("userId", currentUser._id))
			.unique();

		if (!currentMembership || currentMembership.role !== "admin") {
			throw new ConvexError("Only admins can remove members");
		}

		// 3. Prevent removing yourself (optional)
		if (args.userId === currentUser._id) {
			throw new ConvexError("Use leave group instead");
		}

		// 4. Find target member
		const targetMembership = await ctx.db
			.query("chatMembers")
			.withIndex("by_chat_user", (q) => q.eq("chatId", args.chatId).eq("userId", args.userId))
			.unique();

		if (!targetMembership) {
			throw new ConvexError("User is not a member");
		}

		// 5. Remove member
		await ctx.db.delete(targetMembership._id);

		// 6. OPTIONAL: system message
		await ctx.db.insert("messages", {
			chatId: args.chatId,
			senderId: currentUser._id,
			content: "A member was removed from the group.",
			type: "system",
			createdAt: Date.now(),
			editedAt: undefined,
			deleted: false,
		});
	},
});

export const add = mutation({
	args: {
		chatId: v.id("chats"),
		userIds: v.array(v.id("users")),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new ConvexError("Unauthorized");

		const currentUser = await getUserByClerkId({
			ctx,
			clerkId: identity.subject,
		});
		if (!currentUser) throw new ConvexError("User not found");

		// 1. Ensure chat exists + is group
		const chat = await ctx.db.get(args.chatId);
		if (!chat || !chat.isGroup) {
			throw new ConvexError("Group chat not found");
		}

		// 2. Check current user is admin
		const currentMembership = await ctx.db
			.query("chatMembers")
			.withIndex("by_chat_user", (q) => q.eq("chatId", args.chatId).eq("userId", currentUser._id))
			.unique();

		if (!currentMembership || currentMembership.role !== "admin") {
			throw new ConvexError("Only admins can add members");
		}

		// 3. Get existing members (to prevent duplicates)
		const existingMembers = await ctx.db
			.query("chatMembers")
			.withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
			.collect();

		const existingUserIds = new Set(existingMembers.map((m) => m.userId));

		// 4. Filter valid new users
		const usersToAdd = args.userIds.filter((userId) => !existingUserIds.has(userId));

		if (usersToAdd.length === 0) {
			throw new ConvexError("All users are already in the group");
		}

		// 5. Validate users exist
		const validUsers = await Promise.all(usersToAdd.map((userId) => ctx.db.get(userId)));

		if (validUsers.some((u) => !u)) {
			throw new ConvexError("Some users not found");
		}

		// 6. Add members
		await Promise.all(
			usersToAdd.map((userId) =>
				ctx.db.insert("chatMembers", {
					chatId: args.chatId,
					userId,
					role: "member",
					joinedAt: Date.now(),
				}),
			),
		);

		// 7. OPTIONAL: system message
		await ctx.db.insert("messages", {
			chatId: args.chatId,
			senderId: currentUser._id,
			content: `${usersToAdd.length} new member${usersToAdd.length > 1 ? "s" : ""} added to the group.`,
			type: "system",
			createdAt: Date.now(),
			editedAt: undefined,
			deleted: false,
		});
	},
});
