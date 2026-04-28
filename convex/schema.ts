import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	users: defineTable({
		username: v.string(),
		imageUrl: v.string(),
		clerkId: v.string(),
		email: v.string(),
	})
		.index("by_email", ["email"])
		.index("by_clerkId", ["clerkId"]),

	// Friend requests
	requests: defineTable({
		sender: v.id("users"),
		receiver: v.id("users"),
		// status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected")),
	})
		.index("by_sender", ["sender"])
		.index("by_receiver", ["receiver"])
		.index("by_receiver_sender", ["receiver", "sender"]),

	// ✅ Friends (clean + UI focused)
	friends: defineTable({
		userId: v.id("users"),
		friendId: v.id("users"),
		createdAt: v.number(),

		// optional shortcut for direct chat
		chatId: v.optional(v.id("chats")),
	})
		.index("by_userId", ["userId"])
		.index("by_friendId", ["friendId"])
		.index("by_user_friend", ["userId", "friendId"]),

	// Chats
	chats: defineTable({
		name: v.optional(v.string()),
		isGroup: v.boolean(),
		createdBy: v.id("users"),
		lastMessageId: v.optional(v.id("messages")),
		lastActiveAt: v.optional(v.number()),
	}).index("by_createdBy", ["createdBy"]),

	// Chat Members (core system)
	chatMembers: defineTable({
		chatId: v.id("chats"),
		userId: v.id("users"),
		role: v.union(v.literal("admin"), v.literal("member")),
		joinedAt: v.number(),
		lastSeenMessageId: v.optional(v.id("messages")),
	})
		.index("by_chatId", ["chatId"])
		.index("by_userId", ["userId"])
		.index("by_chat_user", ["chatId", "userId"]),

	// Messages
	messages: defineTable({
		chatId: v.id("chats"),
		senderId: v.id("users"),
		content: v.optional(v.string()),
		type: v.union(
			v.literal("text"),
			v.literal("image"),
			v.literal("file"),
			v.literal("video"),
			v.literal("audio"),
			v.literal("system"),
		),
		storageId: v.optional(v.id("_storage")),
		fileName: v.optional(v.string()),
		fileType: v.optional(v.string()),
		attachmentUrl: v.optional(v.string()),
		createdAt: v.number(),
		editedAt: v.optional(v.number()),
		deleted: v.boolean(),
	})
		.index("by_chatId", ["chatId"])
		.index("by_chat_createdAt", ["chatId", "createdAt"]),

	// Reactions
	reactions: defineTable({
		messageId: v.id("messages"),
		userId: v.id("users"),
		reaction: v.string(),
	})
		.index("by_messageId", ["messageId"])
		.index("by_message_user", ["messageId", "userId"]),

	// Typing indicator (optional)
	typing: defineTable({
		chatId: v.id("chats"),
		userId: v.id("users"),
		isTyping: v.boolean(),
		updatedAt: v.number(),
	}).index("by_chatId", ["chatId"]),

	// Presence (optional)
	presence: defineTable({
		userId: v.id("users"),
		status: v.union(v.literal("online"), v.literal("offline")),
		lastSeen: v.number(),
	}).index("by_userId", ["userId"]),
});
