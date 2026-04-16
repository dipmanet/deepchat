import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";

export const create = internalMutation({
	args: {
		username: v.string(),
		imageUrl: v.string(),
		clerkId: v.string(),
		email: v.string(),
	},
	handler: async (ctx, args) => {
		const existingUser = await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
			.unique();

		const normalizedArgs = {
			...args,
			email: args.email.trim().toLowerCase(),
		};

		if (existingUser) {
			await ctx.db.patch(existingUser._id, normalizedArgs);
			return existingUser._id;
		}

		return await ctx.db.insert("users", normalizedArgs);
	},
});

export const getClerk = internalQuery({
	args: { clerkId: v.string() },
	handler: async (ctx, args) =>
		ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
			.unique(),
});

export const get = query({
	args: { id: v.id("users") },
	handler: async (ctx, args) => {
		return ctx.db.get(args.id);
	},
});
