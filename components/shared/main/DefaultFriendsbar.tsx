import AddFriendDialog from "@/components/shared/dialogs/AddFriendDialog";
import AppAvatar from "@/components/shared/cards/AppAvatar";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { UserType } from "@/lib/types";
import { useQuery } from "convex/react";
import { ArrowRight, Inbox, MessageCircle, Search, UserPlus, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";

type FriendRecord = {
	_id: Id<"friends">;
	createdAt: number;
	chatId?: Id<"chats">;
	friend: UserType;
};

function AddFriendButton({ compact = false }: { compact?: boolean }) {
	return (
		<AddFriendDialog showTooltip={false}>
			<Button className={compact ? "h-9 gap-2" : "h-11 gap-2 px-5"}>
				<UserPlus className="size-4" />
				Add friend
			</Button>
		</AddFriendDialog>
	);
}

function FriendCard({ record }: { record: FriendRecord }) {
	const router = useRouter();
	const canOpenChat = Boolean(record.chatId);

	return (
		<button
			type="button"
			disabled={!canOpenChat}
			onClick={() => record.chatId && router.push(`/chat/${record.chatId}`)}
			className="group flex w-full items-center gap-3 rounded-lg border border-border bg-background px-3.5 py-3 text-left transition-colors hover:border-foreground/20 hover:bg-muted/45 disabled:cursor-default disabled:hover:border-border disabled:hover:bg-background">
			<AppAvatar imageUrl={record.friend.imageUrl} />
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium">{record.friend.username}</p>
				<p className="truncate text-xs text-muted-foreground">{record.friend.email}</p>
			</div>
			{canOpenChat ? (
				<ArrowRight className="size-4 shrink-0 text-muted-foreground/55 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
			) : (
				<MessageCircle className="size-4 shrink-0 text-muted-foreground/45" />
			)}
		</button>
	);
}

function RecentFriends({ friends }: { friends: FriendRecord[] }) {
	const recentFriends = friends.slice(0, 5);

	if (recentFriends.length === 0) {
		return (
			<div className="rounded-lg border border-dashed border-border bg-muted/25 px-4 py-5 text-center">
				<p className="text-sm font-medium">No friends yet</p>
				<p className="mt-1 text-sm text-muted-foreground">
					Send a request and accepted friends will show up here.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between px-0.5">
				<p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
					Recent friends
				</p>
				<span className="text-xs text-muted-foreground">
					{friends.length} {friends.length === 1 ? "friend" : "friends"}
				</span>
			</div>
			<div className="grid gap-2">
				{recentFriends.map((friend) => (
					<FriendCard key={friend._id} record={friend} />
				))}
			</div>
		</div>
	);
}

export function FriendsSelectState({ friends }: { friends: FriendRecord[] }) {
	const requests = useQuery(api.requests.get) ?? [];
	const sentRequests = useQuery(api.requests.getSentRequests) ?? [];

	return (
		<div className="flex flex-col h-full w-full items-center px-4 py-10 sm:px-8 lg:px-12">
			<div className="flex w-full max-w-xl flex-col gap-5">
				<div className="text-center">
					<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted/45">
						<UsersRound className="size-6 text-muted-foreground" strokeWidth={1.8} />
					</div>
					<p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
						Friends
					</p>
					<h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
						Find people and keep conversations close
					</h2>
					<p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
						Review recent friends, open a chat, or invite someone new by email.
					</p>
				</div>

				<div className="grid gap-3 sm:grid-cols-3">
					<div className="rounded-lg border border-border bg-background px-4 py-3">
						<UsersRound className="mb-2 size-4 text-muted-foreground" />
						<p className="text-xl font-semibold">{friends.length}</p>
						<p className="text-xs text-muted-foreground">Connected</p>
					</div>
					<div className="rounded-lg border border-border bg-background px-4 py-3">
						<Inbox className="mb-2 size-4 text-muted-foreground" />
						<p className="text-xl font-semibold">{requests.length}</p>
						<p className="text-xs text-muted-foreground">Waiting for you</p>
					</div>
					<div className="rounded-lg border border-border bg-background px-4 py-3">
						<Search className="mb-2 size-4 text-muted-foreground" />
						<p className="text-xl font-semibold">{sentRequests.length}</p>
						<p className="text-xs text-muted-foreground">Sent requests</p>
					</div>
				</div>

				<RecentFriends friends={friends} />

				<div className="flex flex-col items-stretch justify-between gap-3 rounded-lg border border-border bg-muted/25 p-4 sm:flex-row sm:items-center">
					<div>
						<p className="text-sm font-medium">Know someone who should be here?</p>
						<p className="mt-1 text-sm text-muted-foreground">
							Send a request with their email and start chatting after they accept.
						</p>
					</div>
					<AddFriendButton compact />
				</div>
			</div>
		</div>
	);
}

export function FriendsEmptyState() {
	return (
		<div className="flex min-h-full w-full items-center justify-center px-4 py-10 text-center sm:px-8">
			<div className="flex w-full max-w-md flex-col items-center">
				<div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-muted/45">
					<UserPlus className="size-7 text-muted-foreground" strokeWidth={1.8} />
				</div>
				<p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
					Build your circle
				</p>
				<h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Add your first friend</h2>
				<p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
					Friend requests keep chats private. Invite someone by email, then start a direct
					conversation when they accept.
				</p>
				<div className="mt-6">
					<AddFriendButton />
				</div>
			</div>
		</div>
	);
}
