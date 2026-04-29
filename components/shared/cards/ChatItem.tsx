import Link from "next/link";
import AppAvatar from "./AppAvatar";
import { ChatItemType } from "@/lib/types";
import { useGroupStatus, useUserStatus } from "@/hooks/useUserStatus";
import { cn, formatTime } from "@/lib/utils";
import { File, ImageIcon, Music, UsersRound, Video } from "lucide-react";
import { usePathname } from "next/navigation";

function getLastMessagePreview(chat: ChatItemType) {
	const message = chat.lastMessage;

	if (!message) return "Start a conversation";
	if (message.deleted) return "Message deleted";
	if (message.content) return message.content;

	switch (message.type) {
		case "image":
			return "Photo";
		case "video":
			return "Video";
		case "audio":
			return "Audio";
		case "file":
			return message.fileName || "File";
		default:
			return "New message";
	}
}

function MessageTypeIcon({ chat }: { chat: ChatItemType }) {
	const type = chat.lastMessage?.type;

	if (chat.isGroup && !chat.lastMessage) return <UsersRound className="size-3.5" />;
	if (type === "image") return <ImageIcon className="size-3.5" />;
	if (type === "video") return <Video className="size-3.5" />;
	if (type === "audio") return <Music className="size-3.5" />;
	if (type === "file") return <File className="size-3.5" />;

	return null;
}

const ChatItem = ({ chat }: { chat: ChatItemType }) => {
	const { _id: id, name, image, isGroup, friendId, updatedAt } = chat || {};
	const pathname = usePathname();
	const active = pathname === `/chat/${id}`;

	const { status: groupStatus } = useGroupStatus(updatedAt);
	const { status: userStatus } = useUserStatus(friendId);

	const status = isGroup ? groupStatus : userStatus;
	const preview = getLastMessagePreview(chat);

	return (
		<Link
			href={`/chat/${id}`}
			aria-current={active ? "page" : undefined}
			className={cn(
				"group mx-2 flex rounded-lg px-2.5 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				active ? "bg-primary/10 text-primary" : "hover:bg-muted/65",
			)}>
			<div className="flex min-w-0 flex-1 items-center gap-3">
				<AppAvatar
					status={status}
					imageUrl={image!}
					showOnline
					className={cn("!size-11 shrink-0", active && "ring-2 ring-primary/25")}
				/>
				<div className="min-w-0 flex-1">
					<div className="mb-0.5 flex items-center gap-2">
						<h4 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
							{name || "Untitled chat"}
						</h4>
						<span
							className={cn(
								"shrink-0 text-[11px]",
								active ? "text-primary/70" : "text-muted-foreground/70",
							)}>
							{formatTime(updatedAt)}
						</span>
					</div>
					<div
						className={cn(
							"flex min-w-0 items-center gap-1.5 text-xs",
							active ? "text-primary/75" : "text-muted-foreground",
						)}>
						<MessageTypeIcon chat={chat} />
						<p className="truncate">{preview}</p>
					</div>
				</div>
			</div>
		</Link>
	);
};

export default ChatItem;
