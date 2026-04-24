import MessageItem from "@/components/shared/cards/MessageItem";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useEffect } from "react";

type Props = {
	chatId: Id<"chats">;
};

const ChatBody = ({ chatId }: Props) => {
	const messages = useQuery(api.messages.getAll, { chatId });

	useEffect(() => {
		const chatBody = document.getElementById("chat-body");
		if (chatBody) {
			chatBody.scrollTo({
				top: chatBody.scrollHeight,
				behavior: "smooth",
			});
		}
	}, [messages]);

	return (
		<div id="chat-body" className="w-full flex flex-col grow overflow-auto no-scrollbar">
			<div className="w-full flex flex-col-reverse gap-2 flex-1 p-4">
				{messages?.map((message) => (
					<MessageItem key={message._id} message={message} />
				))}
			</div>
		</div>
	);
};

export default ChatBody;
