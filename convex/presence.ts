import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getUserByClerkId } from "./_utils";

const STALE_AFTER_MS = 60_000;

export const getByUser = query({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new ConvexError("Unauthorized");

		const currentUser = await getUserByClerkId({
			ctx,
			clerkId: identity.subject,
		});
		if (!currentUser) throw new ConvexError("User not found");

		const presence = await ctx.db
			.query("presence")
			.withIndex("by_userId", (q) => q.eq("userId", args.userId))
			.unique();

		if (!presence) return null;

		const isStale = Date.now() - presence.lastSeen > STALE_AFTER_MS;

		return {
			...presence,
			status: isStale ? "offline" : "online",
		};
	},
});

export const upsertPresence = mutation({
	args: {
		status: v.union(v.literal("online"), v.literal("offline")),
		lastSeen: v.number(),
	},
	handler: async (ctx, { status, lastSeen }) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new ConvexError("Unauthorized");

		const currentUser = await getUserByClerkId({
			ctx,
			clerkId: identity.subject,
		});
		if (!currentUser) throw new ConvexError("User not found");

		const existing = await ctx.db
			.query("presence")
			.withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
			.unique();

		if (existing) {
			await ctx.db.patch(existing._id, { status, lastSeen });
		} else {
			await ctx.db.insert("presence", { userId: currentUser._id, status, lastSeen });
		}
	},
});
