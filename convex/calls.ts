import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";
import { requireUser, requireUserQuery } from "./user";

const activeStatuses = ["ringing", "accepted"] as const;

async function requireCallParticipant(ctx: QueryCtx, callId: Id<"calls">) {
	const currentUser = await requireUserQuery(ctx);
	const call = await ctx.db.get(callId);

	if (!call) {
		throw new ConvexError("Call not found");
	}

	if (call.callerId !== currentUser._id && call.receiverId !== currentUser._id) {
		throw new ConvexError("Not a participant in this call");
	}

	return { call, currentUser };
}

async function requireChatMember(ctx: QueryCtx | MutationCtx, chatId: Id<"chats">, userId: Id<"users">) {
	const membership = await ctx.db
		.query("chatMembers")
		.withIndex("by_chat_user", (q) => q.eq("chatId", chatId).eq("userId", userId))
		.unique();

	if (!membership) {
		throw new ConvexError("User is not a member of this chat");
	}

	return membership;
}

function getOtherParticipant(call: { callerId: Id<"users">; receiverId: Id<"users"> }, userId: Id<"users">) {
	return call.callerId === userId ? call.receiverId : call.callerId;
}

export const startCall = mutation({
	args: {
		chatId: v.id("chats"),
		receiverId: v.id("users"),
		type: v.union(v.literal("audio"), v.literal("video")),
	},
	handler: async (ctx, args) => {
		const currentUser = await requireUser(ctx);

		if (currentUser._id === args.receiverId) {
			throw new ConvexError("Cannot call yourself");
		}

		const chat = await ctx.db.get(args.chatId);
		if (!chat) {
			throw new ConvexError("Chat not found");
		}

		if (chat.isGroup) {
			throw new ConvexError("Group calls are not supported yet");
		}

		await requireChatMember(ctx, args.chatId, currentUser._id);
		await requireChatMember(ctx, args.chatId, args.receiverId);

		const currentActiveCalls = await ctx.db
			.query("calls")
			.withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
			.filter((q) =>
				q.or(
					q.eq(q.field("status"), "ringing"),
					q.eq(q.field("status"), "accepted"),
				),
			)
			.collect();

		if (currentActiveCalls.length > 0) {
			throw new ConvexError("There is already an active call in this chat");
		}

		return await ctx.db.insert("calls", {
			chatId: args.chatId,
			callerId: currentUser._id,
			receiverId: args.receiverId,
			type: args.type,
			status: "ringing",
			createdAt: Date.now(),
		});
	},
});

export const getIncomingCall = query({
	args: {},
	handler: async (ctx) => {
		const currentUser = await requireUserQuery(ctx);

		const calls = await ctx.db
			.query("calls")
			.withIndex("by_receiver_status", (q) =>
				q.eq("receiverId", currentUser._id).eq("status", "ringing"),
			)
			.collect();

		const latestCall = calls.sort((a, b) => b.createdAt - a.createdAt)[0];
		if (!latestCall) return null;

		const caller = await ctx.db.get(latestCall.callerId);
		const chat = await ctx.db.get(latestCall.chatId);

		return {
			...latestCall,
			caller,
			chat,
		};
	},
});

export const getCall = query({
	args: {
		callId: v.optional(v.id("calls")),
	},
	handler: async (ctx, args) => {
		if (!args.callId) return null;

		const { call } = await requireCallParticipant(ctx, args.callId);
		const caller = await ctx.db.get(call.callerId);
		const receiver = await ctx.db.get(call.receiverId);
		const chat = await ctx.db.get(call.chatId);

		return {
			...call,
			caller,
			receiver,
			chat,
		};
	},
});

export const acceptCall = mutation({
	args: {
		callId: v.id("calls"),
	},
	handler: async (ctx, args) => {
		const currentUser = await requireUser(ctx);
		const call = await ctx.db.get(args.callId);

		if (!call) throw new ConvexError("Call not found");
		if (call.receiverId !== currentUser._id) {
			throw new ConvexError("Only the receiver can accept this call");
		}
		if (call.status === "accepted") {
			return;
		}
		if (call.status !== "ringing") {
			throw new ConvexError("This call is no longer ringing");
		}

		await ctx.db.patch(args.callId, {
			status: "accepted",
			answeredAt: Date.now(),
		});
	},
});

export const rejectCall = mutation({
	args: {
		callId: v.id("calls"),
	},
	handler: async (ctx, args) => {
		const currentUser = await requireUser(ctx);
		const call = await ctx.db.get(args.callId);

		if (!call) throw new ConvexError("Call not found");
		if (call.receiverId !== currentUser._id) {
			throw new ConvexError("Only the receiver can reject this call");
		}
		if (call.status !== "ringing") {
			throw new ConvexError("This call is no longer ringing");
		}

		await ctx.db.patch(args.callId, {
			status: "rejected",
			endedAt: Date.now(),
		});
	},
});

export const endCall = mutation({
	args: {
		callId: v.id("calls"),
	},
	handler: async (ctx, args) => {
		const currentUser = await requireUser(ctx);
		const call = await ctx.db.get(args.callId);

		if (!call) throw new ConvexError("Call not found");
		if (call.callerId !== currentUser._id && call.receiverId !== currentUser._id) {
			throw new ConvexError("Not a participant in this call");
		}

		if (!activeStatuses.includes(call.status as (typeof activeStatuses)[number])) {
			return;
		}

		await ctx.db.patch(args.callId, {
			status: "ended",
			endedAt: Date.now(),
		});
	},
});

export const sendSignal = mutation({
	args: {
		callId: v.id("calls"),
		kind: v.union(v.literal("offer"), v.literal("answer"), v.literal("ice-candidate")),
		payload: v.string(),
	},
	handler: async (ctx, args) => {
		const currentUser = await requireUser(ctx);
		const call = await ctx.db.get(args.callId);

		if (!call) throw new ConvexError("Call not found");
		if (call.callerId !== currentUser._id && call.receiverId !== currentUser._id) {
			throw new ConvexError("Not a participant in this call");
		}
		if (!activeStatuses.includes(call.status as (typeof activeStatuses)[number])) {
			throw new ConvexError("Cannot send a signal for an inactive call");
		}

		const receiverId = getOtherParticipant(call, currentUser._id);

		await ctx.db.insert("callSignals", {
			callId: args.callId,
			senderId: currentUser._id,
			receiverId,
			kind: args.kind,
			payload: args.payload,
			createdAt: Date.now(),
		});
	},
});

export const getSignals = query({
	args: {
		callId: v.optional(v.id("calls")),
	},
	handler: async (ctx, args) => {
		if (!args.callId) return [];

		const { call, currentUser } = await requireCallParticipant(ctx, args.callId);
		const signals = await ctx.db
			.query("callSignals")
			.withIndex("by_call_receiver", (q) =>
				q.eq("callId", args.callId as Id<"calls">).eq("receiverId", currentUser._id),
			)
			.collect();

		if (call.callerId !== currentUser._id && call.receiverId !== currentUser._id) {
			throw new ConvexError("Not a participant in this call");
		}

		return signals.sort((a, b) => a.createdAt - b.createdAt);
	},
});

export const markMissedCalls = mutation({
	args: {},
	handler: async (ctx) => {
		const currentUser = await requireUser(ctx);
		const cutoff = Date.now() - 60_000;
		const ringingCalls = await ctx.db
			.query("calls")
			.withIndex("by_receiver_status", (q) =>
				q.eq("receiverId", currentUser._id).eq("status", "ringing"),
			)
			.collect();

		await Promise.all(
			ringingCalls
				.filter((call) => call.createdAt < cutoff)
				.map((call) =>
					ctx.db.patch(call._id, {
						status: "missed",
						endedAt: Date.now(),
					}),
				),
		);
	},
});
