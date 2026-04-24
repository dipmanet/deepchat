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
