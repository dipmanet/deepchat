import { Button } from "@/components/ui/button";
import { ChatItemType, ChatType } from "@/lib/types";
import { formatTime } from "@/lib/utils";
import { ArrowRight, Clock3, MessageSquare, Plus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import AddChatDialog from "../dialogs/AddChatDialog";

export function EmptyState() {
	return (
		<div className="flex min-h-full w-full flex-col items-center justify-center px-5 py-12 text-center sm:px-10 sm:py-16">
			<div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-muted/45">
				<MessageSquare className="size-7 text-muted-foreground" strokeWidth={1.8} />
			</div>

			<p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
				DeepChat
			</p>
			<h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Start a conversation</h2>
			<p className="mb-7 mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
				Create a group chat or choose a friend from your sidebar. Your most useful conversations
				will stay easy to reach here.
			</p>

			<NewChatButton />
		</div>
	);
}

export function ContinueCard({ chat }: { chat: ChatType }) {
	const router = useRouter();

	return (
		<button
			type="button"
			onClick={() => router.push(`/chat/${chat._id}`)}
			className="group flex w-full items-center gap-3 rounded-lg border border-border bg-background px-4 py-3.5 text-left transition-colors hover:border-foreground/20 hover:bg-muted/45 active:bg-muted sm:px-5 sm:py-4">
			<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
				<MessageSquare className="size-4 text-primary" strokeWidth={1.8} />
			</div>

			<div className="min-w-0 flex-1">
				<p className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
					Continue
				</p>
				<p className="truncate text-sm font-medium leading-snug">{chat?.name ?? "Unknown"}</p>
			</div>

			<ArrowRight className="size-4 shrink-0 text-muted-foreground/55 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
		</button>
	);
}

export function RecentChats({ chats }: { chats: ChatItemType[] }) {
	const router = useRouter();

	return (
		<div className="w-full">
			<p className="mb-2 px-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
				Recent
			</p>
			<div className="overflow-hidden rounded-lg border border-border bg-background">
				{chats.map((chat) => (
					<button
						key={chat._id}
						type="button"
						onClick={() => router.push(`/chat/${chat._id}`)}
						className="group flex w-full items-center gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/45 active:bg-muted sm:px-5 sm:py-3.5">
						<Clock3 className="size-4 shrink-0 text-muted-foreground/55 group-hover:text-muted-foreground" />
						<span className="flex-1 truncate text-sm text-muted-foreground transition-colors group-hover:text-foreground">
							{chat?.name ?? "Unknown"}
						</span>
						<span className="ml-2 shrink-0 text-xs text-muted-foreground/70">
							{formatTime(chat.updatedAt)}
						</span>
					</button>
				))}
			</div>
		</div>
	);
}

export function NewChatButton() {
	return (
		<AddChatDialog showTooltip={false}>
			<Button className="h-11 w-full gap-2 sm:w-auto sm:px-5">
				<Plus className="size-4" />
				New conversation
			</Button>
		</AddChatDialog>
	);
}

export function SelectState({ chats }: { chats: ChatType[] }) {
	const lastChat = chats[0] ?? null;
	const recentChats = chats.slice(1, 6);

	return (
		<div className="flex h-full w-full flex-col items-center px-4 py-10 sm:px-8 sm:py-12 lg:px-12">
			<div className="flex w-full h-full max-w-lg flex-col gap-5">
				<div className="mb-1 text-center">
					<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted/45">
						<Sparkles className="size-6 text-muted-foreground" strokeWidth={1.8} />
					</div>
					<p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
						Conversations
					</p>
					<h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
						Pick up where you left off
					</h2>
					<p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
						Choose a recent chat, or start a fresh conversation with your friends.
					</p>
				</div>

				{lastChat && <ContinueCard chat={lastChat} />}

				{recentChats.length > 0 && <RecentChats chats={recentChats as unknown as ChatItemType[]} />}

				<div className="my-1 flex items-center gap-3">
					<span className="h-px flex-1 bg-border/60" />
					<span className="text-xs text-muted-foreground/50">or</span>
					<span className="h-px flex-1 bg-border/60" />
				</div>

				<NewChatButton />
			</div>
		</div>
	);
}
