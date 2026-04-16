import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { getUserByClerkId } from "./_utils";

export const getAll = query({
	args: { id: v.id("chats") },
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