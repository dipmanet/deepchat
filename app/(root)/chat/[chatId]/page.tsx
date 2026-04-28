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

const ChatPage = () => {
	const params = useParams();
	const rawChatId = params?.chatId;
	const chatId = typeof rawChatId === "string" ? (rawChatId as Id<"chats">) : null;
	const chat = useQuery(api.chats.get, chatId ? { id: chatId } : "skip");

	const { setCurrentChat } = useChatStore();
	console.log("test chat", chat);

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		setCurrentChat(chat as any);
	}, [chat]);

	return (
		<div className="w-full h-full flex flex-col justify-between">
			{chat ? <Header currentChat={chat as unknown as ChatType} /> : null}
			{chatId ? <ChatBody chatId={chatId} /> : null}
			{chatId ? <ChatInput chatId={chatId} /> : null}
		</div>
	);
};

export default ChatPage;
