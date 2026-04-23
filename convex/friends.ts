import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getUserByClerkId } from "./_utils";

export const getAll = query({
	args: { search: v.optional(v.string()) },
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new ConvexError("Unauthorized");

		const currentUser = await getUserByClerkId({
			ctx,
			clerkId: identity.subject,
		});
		if (!currentUser) throw new ConvexError("User not found");

		const friendships = await ctx.db
			.query("friends")
			.withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
			.collect();

		const friends = await Promise.all(
			friendships.map(async (friendship) => {
				const friend = await ctx.db.get(friendship.friendId);
				if (!friend) {
					return null;
				}

				return {
					...friendship,
					friend,
				};
			}),
		);

		// 3. Clean nulls
		let result = friends.filter(Boolean);

		// 4. Apply search
		const search = args.search?.toLowerCase().trim();
		if (search) {
			result = result.filter((friend) =>
				(friend!.friend.username || "").toLowerCase().includes(search),
			);
		}

		// 5. Sort
		return result.sort((a: any, b: any) => b.createdAt - a.createdAt);
	},
});

export const unfriend = mutation({
	args: {
		friendId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new ConvexError("Unauthorized");

		const currentUser = await getUserByClerkId({
			ctx,
			clerkId: identity.subject,
		});
		if (!currentUser) throw new ConvexError("User not found");

		const friendships = await ctx.db
			.query("friends")
			.withIndex("by_user_friend", (q) =>
				q.eq("userId", currentUser._id).eq("friendId", args.friendId),
			)
			.collect();

		const reverseFriendships = await ctx.db
			.query("friends")
			.withIndex("by_user_friend", (q) =>
				q.eq("userId", args.friendId).eq("friendId", currentUser._id),
			)
			.collect();

		console.log("test unfriend friends", friendships, reverseFriendships);

		for (const f of friendships) {
			await ctx.db.delete(f._id);
		}

		for (const rf of reverseFriendships) {
			await ctx.db.delete(rf._id);
		}
	},
});

export const removeGroupMember = mutation({
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
			content: "A member was removed",
			type: "text",
			createdAt: Date.now(),
			editedAt: undefined,
			deleted: false,
		});
	},
});
