import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserByClerkId } from "./_utils";

/**
 * 1. Generate secure upload URL
 */
export const generateUploadUrl = mutation({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new ConvexError("Unauthorized");

		// Only authenticated users can upload
		return await ctx.storage.generateUploadUrl();
	},
});

/**
 * 2. Save file message after upload
 */
export const sendFile = mutation({
	args: {
		chatId: v.id("chats"),
		storageId: v.id("_storage"),
		fileName: v.string(),
		fileType: v.string(),
		type: v.union(v.literal("image"), v.literal("file"), v.literal("video"), v.literal("audio")),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new ConvexError("Unauthorized");

		const user = await getUserByClerkId({
			ctx,
			clerkId: identity.subject,
		});
		if (!user) throw new ConvexError("User not found");

		// 1. Get chat
		const chat = await ctx.db.get(args.chatId);
		if (!chat) throw new ConvexError("Chat not found");

		// 2. Check membership
		const membership = await ctx.db
			.query("chatMembers")
			.withIndex("by_chat_user", (q) => q.eq("chatId", args.chatId).eq("userId", user._id))
			.unique();

		if (!membership) {
			throw new ConvexError("Not a member of this chat");
		}

		// 3. 🔐 Extra security for direct messages
		if (!chat.isGroup) {
			// find other member
			const members = await ctx.db
				.query("chatMembers")
				.withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
				.collect();

			const otherMember = members.find((m) => m.userId !== user._id);

			if (!otherMember) {
				throw new ConvexError("Invalid chat state");
			}

			// check friendship
			const friendship = await ctx.db
				.query("friends")
				.withIndex("by_user_friend", (q) =>
					q.eq("userId", user._id).eq("friendId", otherMember.userId),
				)
				.unique();

			if (!friendship) {
				throw new ConvexError("Cannot send message. You are no longer friends.");
			}
		}

		const attachmentUrl = await ctx.storage.getUrl(args.storageId);

		// 4. Save message
		const messageId = await ctx.db.insert("messages", {
			chatId: args.chatId,
			senderId: user._id,
			type: args.type,
			content: undefined,
			storageId: args.storageId,
			fileName: args.fileName,
			fileType: args.fileType,
			attachmentUrl: attachmentUrl ?? undefined,
			createdAt: Date.now(),
			deleted: false,
		});

		// 5. Update chat activity
		await ctx.db.patch(args.chatId, {
			lastMessageId: messageId,
			lastActiveAt: Date.now(),
		});

		return messageId;
	},
});

/**
 * 3. Get messages with file URLs
 */
export const getMessagesWithFiles = query({
	args: {
		chatId: v.id("chats"),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new ConvexError("Unauthorized");

		const user = await getUserByClerkId({
			ctx,
			clerkId: identity.subject,
		});
		if (!user) throw new ConvexError("User not found");

		const membership = await ctx.db
			.query("chatMembers")
			.withIndex("by_chat_user", (q) => q.eq("chatId", args.chatId).eq("userId", user._id))
			.unique();

		if (!membership) {
			throw new ConvexError("Not a member of this chat");
		}

		const messages = await ctx.db
			.query("messages")
			.withIndex("by_chat_createdAt", (q) => q.eq("chatId", args.chatId))
			.order("desc")
			.collect();

		return Promise.all(
			messages.map(async (msg) => {
				let fileUrl = null;

				if (!msg.deleted && msg.storageId) {
					fileUrl = await ctx.storage.getUrl(msg.storageId);
				}

				return {
					...msg,
					attachmentUrl: msg.deleted ? undefined : msg.attachmentUrl,
					fileUrl,
				};
			}),
		);
	},
});

/**
 * 4. Delete file safely
 */
export const deleteFile = mutation({
	args: {
		messageId: v.id("messages"),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new ConvexError("Unauthorized");

		const message = await ctx.db.get(args.messageId);
		if (!message) throw new ConvexError("Message not found");

		const user = await getUserByClerkId({
			ctx,
			clerkId: identity.subject,
		});
		if (!user) throw new ConvexError("User not found");

		if (message.senderId !== user._id) {
			throw new ConvexError("Only the sender can delete this file");
		}

		// delete storage file
		if (message.storageId) {
			await ctx.storage.delete(message.storageId);
		}

		// mark message deleted
		await ctx.db.patch(message._id, {
			deleted: true,
			content: "File deleted",
			attachmentUrl: undefined,
			storageId: undefined,
		});
	},
});
