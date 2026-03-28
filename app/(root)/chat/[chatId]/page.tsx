"use client";
import { useParams } from "next/navigation";

const ChatPage = () => {
	const { chatId } = useParams();
	return <div>Chat Page for user: {chatId}</div>;
};

export default ChatPage;
