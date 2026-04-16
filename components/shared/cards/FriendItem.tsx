import Link from "next/link";
import AppAvatar from "./AppAvatar";
import { UserType } from "@/lib/types";
import { Id } from "@/convex/_generated/dataModel";

const FriendItem = ({ friend, chatId }: { friend: UserType; chatId: Id<"chats"> }) => {
	const { _id, _creationTime, clerkId, username, imageUrl, email } = friend || {};

	return (
		<Link href={`/chat/${chatId}`} className=" first-of-type:border-t border-b ">
			<div className="py-4 px-2 flex flex-row items-center gap-4 truncate">
				<AppAvatar status={"online"} imageUrl={imageUrl!} showOnline />
				<div className="flex flex-col truncate">
					<h4 className="font-semibold truncate">{username!}</h4>
					<p className="text-sm text-muted-foreground truncate">
						{/* {lastMessage?.content || "Start a conversation"} */}
						{/* {lastMessage?.content} */}
					</p>
				</div>
			</div>
		</Link>
	);
};

export default FriendItem;
