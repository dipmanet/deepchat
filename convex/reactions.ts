import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getUserByClerkId } from "./_utils";

const ALLOWED_REACTIONS = new Set([
	"\u{1F44D}",
	"\u{2764}\u{FE0F}",
	"\u{1F602}",
	"\u{1F62E}",
	"\u{1F622}",
	"\u{1F525}",
]);

const ensureUserCanAccessMessage = async (
	ctx: MutationCtx | QueryCtx,
	messageId: Id<"messages">,
	clerkId: string,
) => {
	const user = await getUserByClerkId({ ctx, clerkId });
	if (!user) throw new ConvexError("User not found");

	const message = await ctx.db.get(messageId);
	if (!message) throw new ConvexError("Message not found");

	const membership = await ctx.db
		.query("chatMembers")
		.withIndex("by_chat_user", (q) => q.eq("chatId", message.chatId).eq("userId", user._id))
		.unique();

	if (!membership) {
		throw new ConvexError("Not a member of this chat");
	}

	return { user, message };
};

export const toggleReaction = mutation({
	args: {
		messageId: v.id("messages"),
		reaction: v.string(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new ConvexError("Unauthorized");

		const reaction = args.reaction.trim();
		if (!reaction) throw new ConvexError("Reaction cannot be empty");
		if (!ALLOWED_REACTIONS.has(reaction)) {
			throw new ConvexError("Unsupported reaction");
		}

		const { user, message } = await ensureUserCanAccessMessage(ctx, args.messageId, identity.subject);

		if (message.deleted) {
			throw new ConvexError("Cannot react to a deleted message");
		}

		if (message.type === "system") {
			throw new ConvexError("Cannot react to system messages");
		}

		const existingReaction = await ctx.db
			.query("reactions")
			.withIndex("by_message_user", (q) =>
				q.eq("messageId", args.messageId).eq("userId", user._id),
			)
			.unique();

		if (existingReaction?.reaction === reaction) {
			await ctx.db.delete(existingReaction._id);
			return { action: "removed" };
		}

		if (existingReaction) {
			await ctx.db.patch(existingReaction._id, { reaction });
			return { action: "updated" };
		}

		await ctx.db.insert("reactions", {
			messageId: args.messageId,
			userId: user._id,
			reaction,
		});

		return { action: "added" };
	},
});

export const getForMessage = query({
	args: {
		messageId: v.id("messages"),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new ConvexError("Unauthorized");

		const { user, message } = await ensureUserCanAccessMessage(ctx, args.messageId, identity.subject);

		if (message.deleted || message.type === "system") {
			return [];
		}

		const reactions = await ctx.db
			.query("reactions")
			.withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
			.collect();

		const grouped = new Map<string, { reaction: string; count: number; reactedByMe: boolean }>();

		for (const reaction of reactions) {
			const current = grouped.get(reaction.reaction) ?? {
				reaction: reaction.reaction,
				count: 0,
				reactedByMe: false,
			};

			current.count += 1;
			current.reactedByMe = current.reactedByMe || reaction.userId === user._id;
			grouped.set(reaction.reaction, current);
		}

		return Array.from(grouped.values());
	},
});
