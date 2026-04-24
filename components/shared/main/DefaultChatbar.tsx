import { ChatItemType, ChatType } from "@/lib/types";
import { formatTime } from "@/lib/utils";
import { MessageSquare, Plus, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import AddChatDialog from "../dialogs/AddChatDialog";

// ─── EmptyState ────────────────────────────────────────────────────────────
export function EmptyState() {
	return (
		<div className="w-full flex flex-col items-center justify-center h-full text-center px-5 py-12 sm:px-10 sm:py-16">
			{/* Icon */}
			<div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-muted flex items-center justify-center mb-5 sm:mb-6">
				<MessageSquare size={22} className="text-muted-foreground" strokeWidth={1.5} />
			</div>

			<p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground mb-2">
				No conversations yet
			</p>
			<h2 className="font-serif italic text-2xl sm:text-3xl font-normal mb-2 tracking-tight leading-snug">
				Start your first chat
			</h2>
			<p className="text-sm text-muted-foreground mb-8 max-w-[260px] sm:max-w-xs leading-relaxed">
				Your conversations will appear here once you get started.
			</p>

			<NewChatButton />
		</div>
	);
}

// ─── ContinueCard ──────────────────────────────────────────────────────────

export function ContinueCard({ chat }: { chat: ChatType }) {
	const router = useRouter();
	return (
		<button
			onClick={() => router.push(`/chat/${chat._id}`)}
			className="
        w-full flex items-center gap-3 sm:gap-4
        px-4 py-3.5 sm:px-5 sm:py-4
        rounded-xl border border-border bg-background
        hover:border-foreground/25 hover:bg-muted/40
        active:scale-[0.99] active:bg-muted
        transition-all text-left touch-manipulation
        group
      ">
			{/* Avatar */}
			<div
				className="
        w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0
        bg-blue-100 dark:bg-blue-950
        flex items-center justify-center
      ">
				<MessageSquare size={14} className="text-blue-600 dark:text-blue-400" strokeWidth={1.8} />
			</div>

			{/* Text */}
			<div className="flex-1 min-w-0">
				<p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-0.5">
					Continue last chat
				</p>
				<p className="text-sm font-medium truncate leading-snug">{chat?.name ?? "Unknown"}</p>
			</div>

			{/* Meta */}
			<div className="flex items-center gap-1.5 shrink-0">
				<span className="text-xs text-muted-foreground hidden sm:block"></span>
				<ArrowRight
					size={14}
					className="text-muted-foreground/50 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all"
				/>
			</div>
		</button>
	);
}

// ─── RecentChats ───────────────────────────────────────────────────────────

export function RecentChats({ chats }: { chats: ChatItemType[] }) {
	const router = useRouter();
	return (
		<div className="w-full">
			<p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-1 px-0.5">
				Recent
			</p>
			<div className="rounded-xl border border-border overflow-hidden divide-y divide-border/60">
				{chats.map((chat) => (
					<button
						key={chat._id}
						onClick={() => router.push(`/chat/${chat._id}`)}
						className="w-full flex items-center gap-3
							px-4 py-3 sm:px-5 sm:py-3.5
							bg-background hover:bg-muted/50 active:bg-muted
							transition-colors text-left group touch-manipulation
							">
						<span className="w-1.5 h-1.5 rounded-full bg-border shrink-0 group-hover:bg-muted-foreground transition-colors" />
						<span className="flex-1 text-sm text-muted-foreground group-hover:text-foreground truncate transition-colors leading-snug">
							{chat?.name ?? "Unknown"}
						</span>
						<span className="text-xs text-muted-foreground/70 shrink-0 ml-2">
							{formatTime(chat.updatedAt)}
						</span>
					</button>
				))}
			</div>
		</div>
	);
}

// ─── NewChatButton ─────────────────────────────────────────────────────────

export function NewChatButton() {
	const router = useRouter();
	return (
		<AddChatDialog showTooltip={false}>
			<div
				onClick={() => router.push("/chat/new")}
				className="
        w-full flex items-center justify-center gap-2
        sm:w-auto sm:px-5
        px-4 py-3 sm:py-2.5
        rounded-xl border border-border bg-background
        hover:bg-muted hover:border-foreground/25
        active:scale-[0.98]
        transition-all text-sm font-medium touch-manipulation
        ">
				<Plus size={14} />
				New conversation
			</div>
		</AddChatDialog>
	);
}

// ─── SelectState ───────────────────────────────────────────────────────────

export function SelectState({ chats }: { chats: ChatType[] }) {
	const lastChat = chats[0] ?? null;
	const recentChats = chats.slice(1, 6);

	return (
		<div
			className="
      w-full h-full overflow-y-auto
      flex flex-col items-center justify-center
      px-4 py-10
      sm:px-8 sm:py-12
      lg:px-12
    ">
			{/* Content card — constrained width on large screens */}
			<div className="w-full max-w-sm sm:max-w-lg flex flex-col gap-4 sm:gap-5">
				{/* Heading */}
				<div className="text-center mb-1">
					<p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-muted-foreground mb-2">
						Conversations
					</p>
					<h2 className="font-serif italic text-2xl sm:text-3xl font-normal tracking-tight leading-snug">
						Select a conversation
					</h2>
					<p className="text-sm text-muted-foreground mt-1.5">Or pick up where you left off</p>
				</div>

				{/* Continue card */}
				{lastChat && <ContinueCard chat={lastChat} />}

				{/* Recent list */}
				{recentChats.length > 0 && <RecentChats chats={recentChats} />}

				{/* Divider */}
				<div className="flex items-center gap-3 my-1">
					<span className="flex-1 h-px bg-border/60" />
					<span className="text-xs text-muted-foreground/50">or</span>
					<span className="flex-1 h-px bg-border/60" />
				</div>

				{/* New chat */}
				<NewChatButton />
			</div>
		</div>
	);
}
