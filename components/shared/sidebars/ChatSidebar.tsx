import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import ChatItem from "../cards/ChatItem";
import Loader from "../Loader";
import AddChatDialog from "../dialogs/AddChatDialog";
import { Input } from "@/components/ui/input";
import React from "react";
import { MessageSquarePlusIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const ChatSidebar = () => {
	const [searchText, setSearchText] = React.useState("");
	const chats = useQuery(api.chats.getAll, { search: searchText });

	return (
		<div className="w-full h-full flex flex-col gap-8">
			<div>
				<div className="py-4 px-2 w-full flex items-center justify-between">
					<h1 className="text-xl font-bold">Chats</h1>
					<AddChatDialog>
						<div className={buttonVariants({ variant: "outline", size: "icon" })}>
							<MessageSquarePlusIcon className="w-6 h-6" />
						</div>
					</AddChatDialog>
				</div>
				<div className="px-2">
					<Input
						placeholder="Search DeepChat..."
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
					/>
				</div>
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
