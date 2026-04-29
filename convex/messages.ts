import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getUserByClerkId } from "./_utils";

export const getAll = query({
	args: {
		chatId: v.id("chats"),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new ConvexError("Unauthorized");

		const currentUser = await getUserByClerkId({
			ctx,
			clerkId: identity.subject,
		});
		if (!currentUser) throw new ConvexError("User not found");

		// 1. Check membership
		const membership = await ctx.db
			.query("chatMembers")
			.withIndex("by_chat_user", (q) => q.eq("chatId", args.chatId).eq("userId", currentUser._id))
			.unique();

		if (!membership) {
			throw new ConvexError("Not a member of this chat");
		}

		// 2. Get messages (latest first)
		const messages = await ctx.db
			.query("messages")
			.withIndex("by_chat_createdAt", (q) => q.eq("chatId", args.chatId))
			.order("desc")
			.take(100);

		// 3. Attach sender info (optional but useful)
		const messagesWithSender = await Promise.all(
			messages.map(async (msg) => {
				const sender = await ctx.db.get(msg.senderId);
				return {
					...msg,
					sender,
					self: msg.senderId === currentUser._id,
				};
			}),
		);

		return messagesWithSender;
	},
});

export const create = mutation({
	args: {
		chatId: v.id("chats"),
		content: v.optional(v.string()),
		type: v.union(
			v.literal("text"),
			v.literal("image"),
			v.literal("file"),
			v.literal("video"),
			v.literal("audio"),
		),
		attachmentUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) throw new ConvexError("Unauthorized");

		const currentUser = await getUserByClerkId({
			ctx,
			clerkId: identity.subject,
		});
		if (!currentUser) throw new ConvexError("User not found");

		// 1. Check membership
		const membership = await ctx.db
			.query("chatMembers")
			.withIndex("by_chat_user", (q) => q.eq("chatId", args.chatId).eq("userId", currentUser._id))
			.unique();

		if (!membership) {
			throw new ConvexError("Not a member of this chat");
		}

		// 2. Get chat
		const chat = await ctx.db.get(args.chatId);
		if (!chat) throw new ConvexError("Chat not found");

		// 3. 🚫 Restrict direct chat if not friends
		if (!chat.isGroup) {
			// get all members (should be 2)
			const members = await ctx.db
				.query("chatMembers")
				.withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
				.collect();

			const otherMember = members.find((m) => m.userId !== currentUser._id);

			if (!otherMember) {
				throw new ConvexError("Invalid chat");
			}

			// check friendship
			const friendship = await ctx.db
				.query("friends")
				.withIndex("by_user_friend", (q) =>
					q.eq("userId", currentUser._id).eq("friendId", otherMember.userId),
				)
				.unique();

			if (!friendship) {
				throw new ConvexError("You can only message friends");
			}
		}

		// 4. Prevent empty message
		if (!args.content && !args.attachmentUrl) {
			throw new ConvexError("Message cannot be empty");
		}

		// 5. Insert message
		const messageId = await ctx.db.insert("messages", {
			chatId: args.chatId,
			senderId: currentUser._id,
			content: args.content,
			type: args.type,
			attachmentUrl: args.attachmentUrl,
			createdAt: Date.now(),
			editedAt: undefined,
			deleted: false,
		});

		// 6. Update chat last message
		await ctx.db.patch(args.chatId, {
			lastMessageId: messageId,
			lastActiveAt: Date.now(),
		});

		return messageId;
	},
});

export const saveLookResponse = internalMutation({
	args: {
		chatId: v.id("chats"),
		senderId: v.id("users"),
		content: v.string(),
	},
	handler: async (ctx, args) => {
		const membership = await ctx.db
			.query("chatMembers")
			.withIndex("by_chat_user", (q) => q.eq("chatId", args.chatId).eq("userId", args.senderId))
			.unique();

		if (!membership) {
			throw new ConvexError("Not a member of this chat");
		}

		const messageId = await ctx.db.insert("messages", {
			chatId: args.chatId,
			senderId: args.senderId,
			content: args.content,
			type: "look",
			createdAt: Date.now(),
			editedAt: undefined,
			deleted: false,
		});

		await ctx.db.patch(args.chatId, {
			lastMessageId: messageId,
			lastActiveAt: Date.now(),
		});

		return messageId;
	},
});

export const look = action({
	args: {
		chatId: v.id("chats"),
		content: v.string(),
		type: v.literal("text"),
	},
	handler: async (ctx, args): Promise<Id<"messages">> => {
		const prompt = args.content.replace(/^\/look(?:\s+|$)/i, "").trim();

		if (!prompt) {
			throw new ConvexError("Usage: /look <message>");
		}

		const userMessageId: Id<"messages"> = await ctx.runMutation(api.messages.create, {
			chatId: args.chatId,
			content: args.content,
			type: args.type,
		});

		const apiKey = process.env.GROQ_API_KEY;
		const message = await ctx.runQuery(internal.messages.getSenderByMessageId, {
			messageId: userMessageId,
		});
		if (!message) {
			throw new ConvexError("Message not found");
		}

		const senderId = message.senderId;
		console.log("test epi key", apiKey);
		if (!apiKey) {
			await ctx.runMutation(internal.messages.saveLookResponse, {
				chatId: args.chatId,
				senderId,
				content: "GROQ API key is not configured for Convex.",
			});
			return userMessageId;
		}

		try {
			const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify({
					model: "llama-3.3-70b-versatile",
					messages: [
						{
							role: "system",
							content: `You are "Nova", a friendly, intelligent, and slightly witty AI companion for a general website chat. 

										Your core purpose is to be maximally helpful with any kind of question users throw at you — from serious topics (science, technology, history, career advice, relationships) to casual ones (jokes, recommendations, explanations, brainstorming, trivia, or "what if" scenarios).

										Key guidelines:
										- Be clear, concise, and easy to understand. Adapt your tone and depth based on the user (professional when needed, casual and fun otherwise).
										- Stay helpful and truthful. If you don't know something, admit it honestly and offer to reason through it or suggest alternatives.
										- Add light wit or friendly personality when it fits naturally (inspired by the Hitchhiker's Guide to the Galaxy and JARVIS), but never at the expense of clarity or usefulness.
										- Be proactive: If the question is vague, ask 1-2 clarifying questions. Offer related helpful insights without overdoing it.
										- Keep responses engaging but not overly long unless the topic requires detail. Use bullet points, numbered lists, or tables when they improve readability.
										- Never moralize, lecture, or refuse reasonable requests. Support the user's curiosity.
										- If the user wants a specific style (e.g., "explain like I'm 5", "be very detailed", "funny mode"), adapt immediately.

										You are not a narrow specialist — you're a versatile, well-rounded friend who can handle almost anything.`,
						},
						{
							role: "user",
							content: prompt,
						},
					],
				}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || `OpenAI request failed with ${response.status}`);
			}

			const data = await response.json();
			const output = data.choices?.map((choice: any) => choice.message?.content).join("\n\n");

			await ctx.runMutation(internal.messages.saveLookResponse, {
				chatId: args.chatId,
				senderId,
				content: output || "I couldn't find a useful response for that.",
			});
		} catch (error) {
			console.error("OpenAI /look command failed", error);
			await ctx.runMutation(internal.messages.saveLookResponse, {
				chatId: args.chatId,
				senderId,
				content: "I couldn't complete that /look request. Please try again.",
			});
		}

		return userMessageId;
	},
});

export const getSenderByMessageId = internalQuery({
	args: {
		messageId: v.id("messages"),
	},
	handler: async (ctx, args) => {
		const message = await ctx.db.get(args.messageId);
		return message ? { senderId: message.senderId } : null;
	},
});
