"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import Header from "./_components/Header";
import ChatBody from "./_components/Body";
import ChatInput from "./_components/ChatInput";
import { useEffect } from "react";
import { useChatStore } from "@/lib/store";

const ChatPage = () => {
	const params = useParams();
	const rawChatId = params?.chatId;
	const chatId = typeof rawChatId === "string" ? (rawChatId as Id<"chats">) : null;
	const chat = useQuery(api.chats.get, chatId ? { id: chatId } : "skip");

	const { setCurrentChat } = useChatStore();
	console.log("test chat", chat);

	useEffect(() => {
		return setCurrentChat(chat ? chat : null);
	}, [chat, setCurrentChat]);

	return (
		<div className="w-full h-full flex flex-col justify-between">
			<Header />
			{chatId ? <ChatBody chatId={chatId} /> : null}
			{chatId ? <ChatInput chatId={chatId} /> : null}
		</div>
	);
};

export default ChatPage;
