"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import Header from "@/components/shared/ChatHeader";
import ChatBody from "@/components/shared/ChatBody";
import ChatInput from "@/components/shared/ChatInput";
import { useEffect } from "react";
import { useChatStore } from "@/lib/store";

const ChatPage = () => {
	const params = useParams();
	const rawChatId = params?.chatId;
	const chatId = typeof rawChatId === "string" ? (rawChatId as Id<"chats">) : null;
	const chat = useQuery(api.chats.get, chatId ? { id: chatId } : "skip");

	const { currentChat, setCurrentChat } = useChatStore();
	console.log("test chat", chat);

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		setCurrentChat(chat as any);
	}, [chat]);

	return (
		<div className="w-full h-full flex flex-col justify-between">
			{currentChat ? (
				<>
					<Header />
					{chatId ? <ChatBody chatId={chatId} /> : null}
					{chatId ? <ChatInput chatId={chatId} /> : null}
				</>
			) : null}
		</div>
	);
};

export default ChatPage;
