import { UserIdentity } from "convex/server";
import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";

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

/* -------------------------------------------------------------------------- */
/* 👤 GET USER BY ID                                                          */
/* -------------------------------------------------------------------------- */

export const get = query({
	args: { id: v.id("users") },
	handler: async (ctx, args) => {
		const user = await ctx.db.get(args.id);
		if (!user) throw new ConvexError("User not found in the database");
		return user;
	},
});

/* -------------------------------------------------------------------------- */
/* 🔐 GET USER BY CLERK ID (INTERNAL)                                         */
/* -------------------------------------------------------------------------- */

export const getClerk = internalQuery({
	args: { clerkId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("users")
			.withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
			.unique();
	},
});

/* -------------------------------------------------------------------------- */
/* 🔥 PLAIN HELPER: USE IN QUERIES (READ-ONLY)                                */
/* -------------------------------------------------------------------------- */

// Plain helper for queries — throws if missing, client will trigger fix
export const requireUserQuery = async (ctx: any): Promise<any> => {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) throw new ConvexError("Unauthorized");

	const user = await ctx.db
		.query("users")
		.withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
		.unique();

	if (!user) throw new ConvexError("USER_NOT_FOUND"); // ⬅️ special error code

	return user;
};

// Plain helper for mutations — self-healing, creates user if missing
export const requireUser = async (
	ctx: any,
	overrides?: { clerkId: string; username?: string; imageUrl?: string; email?: string },
): Promise<any> => {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) throw new ConvexError("Unauthorized");
	if (overrides && identity.subject !== overrides.clerkId) {
		throw new ConvexError("clerkId in overrides must match authenticated user");
	}

	let user = await ctx.db
		.query("users")
		.withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
		.unique();

	const email =
		(overrides?.email?.toLowerCase().trim() || identity.email?.toLowerCase().trim()) ?? "";

	const fallbackUsername =
		overrides?.username ||
		identity.name ||
		identity.preferredUsername ||
		(email ? email.split("@")[0] : "User");

	const imageUrl = overrides?.imageUrl || identity.pictureUrl || "";

	if (!user) {
		const id = await ctx.db.insert("users", {
			username: fallbackUsername,
			imageUrl,
			clerkId: identity.subject,
			email,
		});
		return await ctx.db.get(id);
	}

	const updates: any = {};

	if (overrides?.username && overrides.username !== user.username) {
		updates.username = overrides.username;
	}

	if (overrides?.imageUrl && overrides.imageUrl !== user.imageUrl) {
		updates.imageUrl = overrides.imageUrl;
	}

	if (Object.keys(updates).length > 0) {
		await ctx.db.patch(user._id, updates);
		user = { ...user, ...updates };
	}

	return user;
};

// ✅ NEW: public mutation to self-heal from client
export const ensureUser = mutation({
	args: {
		clerkId: v.string(),
		username: v.optional(v.string()),
		imageUrl: v.optional(v.string()),
		email: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		return await requireUser(ctx, args); // runs in mutation context, can insert
	},
});

/* -------------------------------------------------------------------------- */
/* ✏️ UPDATE USER PROFILE                                                     */
/* -------------------------------------------------------------------------- */

export const updateProfile = mutation({
	args: {
		username: v.optional(v.string()),
		storageId: v.optional(v.id("_storage")),
	},
	handler: async (ctx, args) => {
		const user = await requireUser(ctx); // ✅ mutation helper

		const updates: any = {};

		if (args.username) updates.username = args.username;

		if (args.storageId) {
			const imageUrl = await ctx.storage.getUrl(args.storageId);
			updates.imageUrl = imageUrl;
		}

		await ctx.db.patch(user._id, updates);
		return { success: true };
	},
});
