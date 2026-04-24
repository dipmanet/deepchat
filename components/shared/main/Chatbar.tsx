"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import Header from "@/components/shared/main/ChatHeader";
import ChatBody from "@/components/shared/main/ChatBody";
import ChatInput from "@/components/shared/main/ChatInput";
import { useEffect } from "react";
import { useChatStore } from "@/lib/store";
import { ChatType } from "@/lib/types";
import { EmptyState, SelectState } from "./DefaultChatbar";


// ─── Main page ─────────────────────────────────────────────────────────────

const ChatPage = () => {
	const params = useParams();
	const rawChatId = params?.chatId;
	const chatId = typeof rawChatId === "string" ? (rawChatId as Id<"chats">) : null;

	const chat = useQuery(api.chats.get, chatId ? { id: chatId } : "skip");
	const chats = useQuery(api.chats.getAll, {}) ?? [];

	const { setCurrentChat } = useChatStore();

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		setCurrentChat(chat as any);
	}, [chat]);

	if (!chatId) {
		return chats.length === 0 ? <EmptyState /> : <SelectState chats={chats} />;
	}

	return (
		<div className="w-full h-full flex flex-col justify-between">
			{chat && <Header currentChat={chat as unknown as ChatType} />}
			<ChatBody chatId={chatId} />
			<ChatInput chatId={chatId} />
		</div>
	);
};

export default ChatPage;
