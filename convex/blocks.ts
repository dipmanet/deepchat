import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getUserByClerkId } from "./_utils";

// ── Get all blocks for the current user ─────────────────────────────────────
export const getAll = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Unauthorized");

        const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });
        if (!currentUser) throw new ConvexError("User not found");

        const blocks = await ctx.db
            .query("blocks")
            .withIndex("by_blockerId", (q) => q.eq("blockerId", currentUser._id))
            .collect();

        const hydratedBlocks = await Promise.all(
            blocks.map(async (block) => {
                if (!block.isGroup && block.blockedUserId) {
                    const blockedUser = await ctx.db.get(block.blockedUserId);
                    return { ...block, blockedUser, blockedChat: null };
                }

                if (block.isGroup && block.blockedChatId) {
                    const blockedChat = await ctx.db.get(block.blockedChatId);
                    return { ...block, blockedUser: null, blockedChat };
                }

                return null;
            }),
        );

        return hydratedBlocks.filter(Boolean);
    },
});

// ── Check if current user has blocked a specific user ───────────────────────
export const isUserBlocked = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Unauthorized");

        const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });
        if (!currentUser) throw new ConvexError("User not found");

        const block = await ctx.db
            .query("blocks")
            .withIndex("by_blocker_blocked_user", (q) =>
                q.eq("blockerId", currentUser._id).eq("blockedUserId", args.userId),
            )
            .unique();

        return !!block;
    },
});

// ── Check if current user has blocked a specific group ──────────────────────
export const isGroupBlocked = query({
    args: { chatId: v.id("chats") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Unauthorized");

        const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });
        if (!currentUser) throw new ConvexError("User not found");

        const block = await ctx.db
            .query("blocks")
            .withIndex("by_blocker_blocked_chat", (q) =>
                q.eq("blockerId", currentUser._id).eq("blockedChatId", args.chatId),
            )
            .unique();

        return !!block;
    },
});

// ── Block a user ─────────────────────────────────────────────────────────────
export const blockUser = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Unauthorized");

        const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });
        if (!currentUser) throw new ConvexError("User not found");

        if (args.userId === currentUser._id) {
            throw new ConvexError("You cannot block yourself");
        }

        const targetUser = await ctx.db.get(args.userId);
        if (!targetUser) throw new ConvexError("User to block not found");

        const existingBlock = await ctx.db
            .query("blocks")
            .withIndex("by_blocker_blocked_user", (q) =>
                q.eq("blockerId", currentUser._id).eq("blockedUserId", args.userId),
            )
            .unique();

        if (existingBlock) throw new ConvexError("User is already blocked");

        // Cancel any pending requests between the two users
        const sentRequest = await ctx.db
            .query("requests")
            .withIndex("by_receiver_sender", (q) =>
                q.eq("receiver", args.userId).eq("sender", currentUser._id),
            )
            .unique();
        if (sentRequest) await ctx.db.delete(sentRequest._id);

        const receivedRequest = await ctx.db
            .query("requests")
            .withIndex("by_receiver_sender", (q) =>
                q.eq("receiver", currentUser._id).eq("sender", args.userId),
            )
            .unique();
        if (receivedRequest) await ctx.db.delete(receivedRequest._id);

        // Remove friendship in both directions if exists
        const friendA = await ctx.db
            .query("friends")
            .withIndex("by_user_friend", (q) =>
                q.eq("userId", currentUser._id).eq("friendId", args.userId),
            )
            .unique();
        if (friendA) await ctx.db.delete(friendA._id);

        const friendB = await ctx.db
            .query("friends")
            .withIndex("by_user_friend", (q) =>
                q.eq("userId", args.userId).eq("friendId", currentUser._id),
            )
            .unique();
        if (friendB) await ctx.db.delete(friendB._id);

        await ctx.db.insert("blocks", {
            blockerId: currentUser._id,
            blockedUserId: args.userId,
            isGroup: false,
            createdAt: Date.now(),
        });
    },
});

// ── Block a group ────────────────────────────────────────────────────────────
export const blockGroup = mutation({
    args: { chatId: v.id("chats") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Unauthorized");

        const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });
        if (!currentUser) throw new ConvexError("User not found");

        const chat = await ctx.db.get(args.chatId);
        if (!chat) throw new ConvexError("Group not found");

        if (!chat.isGroup) {
            throw new ConvexError("Cannot use blockGroup on a DM chat — use blockUser instead");
        }

        const membership = await ctx.db
            .query("chatMembers")
            .withIndex("by_chat_user", (q) =>
                q.eq("chatId", args.chatId).eq("userId", currentUser._id),
            )
            .unique();

        if (!membership) throw new ConvexError("You are not a member of this group");

        const existingBlock = await ctx.db
            .query("blocks")
            .withIndex("by_blocker_blocked_chat", (q) =>
                q.eq("blockerId", currentUser._id).eq("blockedChatId", args.chatId),
            )
            .unique();

        if (existingBlock) throw new ConvexError("Group is already blocked");

        await ctx.db.insert("blocks", {
            blockerId: currentUser._id,
            blockedChatId: args.chatId,
            isGroup: true,
            createdAt: Date.now(),
        });
    },
});

// ── Unblock a user ───────────────────────────────────────────────────────────
export const unblockUser = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Unauthorized");

        const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });
        if (!currentUser) throw new ConvexError("User not found");

        const block = await ctx.db
            .query("blocks")
            .withIndex("by_blocker_blocked_user", (q) =>
                q.eq("blockerId", currentUser._id).eq("blockedUserId", args.userId),
            )
            .unique();

        if (!block) throw new ConvexError("No block found for this user");

        await ctx.db.delete(block._id);
    },
});

// ── Unblock a group ──────────────────────────────────────────────────────────
export const unblockGroup = mutation({
    args: { chatId: v.id("chats") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Unauthorized");

        const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });
        if (!currentUser) throw new ConvexError("User not found");

        const block = await ctx.db
            .query("blocks")
            .withIndex("by_blocker_blocked_chat", (q) =>
                q.eq("blockerId", currentUser._id).eq("blockedChatId", args.chatId),
            )
            .unique();

        if (!block) throw new ConvexError("No block found for this group");

        await ctx.db.delete(block._id);
    },
});