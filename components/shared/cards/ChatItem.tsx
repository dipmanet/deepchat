import Link from "next/link";
import AppAvatar from "./AppAvatar";
import { ChatItemType } from "@/lib/types";
import { useGroupStatus, useUserStatus } from "@/hooks/useUserStatus";

const ChatItem = ({ chat }: { chat: ChatItemType }) => {
	const { _id: id, name, image, lastMessage, isGroup, friendId, updatedAt } = chat || {};

	const { status: groupStatus } = useGroupStatus(updatedAt);
	const { status: userStatus } = useUserStatus(friendId);

	const status = isGroup ? groupStatus : userStatus;

	return (
		<Link href={`/chat/${id}`} className=" first-of-type:border-t border-b ">
			<div className="py-4 px-2 flex flex-row items-center gap-4 truncate">
				<AppAvatar status={status} imageUrl={image!} showOnline />
				<div className="flex flex-col truncate">
					<h4 className="font-semibold truncate">{name}</h4>
					<p className="text-sm text-muted-foreground truncate">
						{lastMessage?.content || "Start a conversation"}
					</p>
				</div>
			</div>
		</Link>
	);
};

export default ChatItem;
