import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import ChatItem from "../cards/ChatItem";
import Loader from "../Loader";
import AddChatDialog from "../dialogs/AddChatDialog";
import { Input } from "@/components/ui/input";
import React from "react";
import { MessageSquarePlusIcon, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatItemType } from "@/lib/types";

const ChatSidebar = () => {
	const [searchText, setSearchText] = React.useState("");
	const chats = useQuery(api.chats.getAll, { search: searchText });
	const trimmedSearch = searchText.trim();
	const chatCount = chats?.length ?? 0;

	const emptyTitle = trimmedSearch ? "No matching chats" : "No conversations yet";
	const emptyDescription = trimmedSearch
		? "Try a different name or clear the search to see all chats."
		: "Start a direct chat or create a group conversation with friends.";

	return (
		<div className="flex h-full w-full flex-col bg-background">
			<div className="sticky top-0 z-20 border-b bg-background/95 px-4 pb-4 pt-4 backdrop-blur">
				<div className="mb-4 flex w-full items-start justify-between gap-3">
					<div className="min-w-0">
						<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
							Messages
						</p>
						<h1 className="mt-1 text-2xl font-semibold tracking-tight">Chats</h1>
					</div>
					<AddChatDialog>
						<Button size="icon" className="shrink-0" aria-label="New conversation">
							<MessageSquarePlusIcon className="size-5" />
						</Button>
					</AddChatDialog>
				</div>

				<div className="relative">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search conversations"
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						className="h-10 pl-9 pr-9"
					/>
					{searchText && (
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							aria-label="Clear search"
							className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
							onClick={() => setSearchText("")}>
							<X className="size-4" />
						</Button>
					)}
				</div>

				<div className="mt-3 flex items-center justify-between px-0.5 text-xs text-muted-foreground">
					<span>{trimmedSearch ? "Search results" : "Recent conversations"}</span>
					<span>
						{chatCount} {chatCount === 1 ? "chat" : "chats"}
					</span>
				</div>
			</div>

			<div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-3">
				{chats ? (
					chats.length > 0 ? (
						<div className="flex flex-col gap-1">
							{chats.map((chat) => (
								<ChatItem key={chat._id} chat={chat as unknown as ChatItemType} />
							))}
						</div>
					) : (
						<div className="flex flex-1 items-center justify-center px-6 text-center">
							<div className="max-w-[240px]">
								<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-muted/45">
									<Search className="size-5 text-muted-foreground" />
								</div>
								<p className="text-sm font-semibold">{emptyTitle}</p>
								<p className="mt-1.5 text-sm leading-6 text-muted-foreground">{emptyDescription}</p>
								{trimmedSearch ? (
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="mt-4"
										onClick={() => setSearchText("")}>
										Clear search
									</Button>
								) : (
									<AddChatDialog showTooltip={false}>
										<Button size="sm" className="mt-4 gap-2">
											<MessageSquarePlusIcon className="size-4" />
											New conversation
										</Button>
									</AddChatDialog>
								)}
							</div>
						</div>
					)
				) : (
					<Loader className="min-h-0 flex-1" />
				)}
			</div>
		</div>
	);
};

export default ChatSidebar;
