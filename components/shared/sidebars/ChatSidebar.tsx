import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import ChatItem from "../cards/ChatItem";
import Loader from "../Loader";

const ChatSidebar = () => {
	const chats = useQuery(api.chats.getAll);

	return (
		<div className="w-full h-full flex flex-col gap-8">
			<div className="py-4 px-2 flex items-center justify-beteween">
				<h1 className="text-xl font-bold">Chats</h1>
			</div>

			<div className="w-full flex flex-col">
				{!!chats ? (
					chats?.length > 0 ? (
						chats?.map((chat) => <ChatItem key={chat._id} chat={chat} />)
					) : (
						<div>
							<p>No chat available</p>
						</div>
					)
				) : (
					<Loader />
				)}
			</div>
		</div>
	);
};

export default ChatSidebar;
