import AddFriendDialog from "@/components/shared/dialogs/AddFriendDialog";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import FriendRequestItem from "../cards/ReceivedRequestItem";
import SentRequestItem from "../cards/SentRequestItem";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import EmptyState from "../EmptyState";
import { Button } from "@/components/ui/button";
import { Inbox, LoaderCircle, Send, UserPlus } from "lucide-react";

function SidebarState({
	title,
	description,
	icon,
	loading = false,
	action,
}: {
	title: string;
	description: string;
	icon: React.ReactNode;
	loading?: boolean;
	action?: React.ReactNode;
}) {
	return (
		<div className="flex flex-1 items-center justify-center px-5 py-8 text-center">
			<div className="flex max-w-[260px] flex-col items-center">
				<div className="relative mb-3 h-28 w-full overflow-hidden">
					<EmptyState
						className={loading ? "h-full w-full opacity-80 animate-pulse" : "h-full w-full opacity-90"}
					/>
				</div>
				<div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-muted/45 text-muted-foreground">
					{loading ? <LoaderCircle className="size-5 animate-spin" /> : icon}
				</div>
				<p className="text-sm font-semibold">{title}</p>
				<p className="mt-1.5 text-sm leading-6 text-muted-foreground">{description}</p>
				{action ? <div className="mt-4">{action}</div> : null}
			</div>
		</div>
	);
}

const RequestsSidebar = () => {
	const requests = useQuery(api.requests.get);
	const sentRequests = useQuery(api.requests.getSentRequests);

	const [currentTab, setCurrentTab] = React.useState("received");
	const isReceivedTab = currentTab === "received";
	const activeRequests = isReceivedTab ? requests : sentRequests;
	const isFetching = activeRequests === undefined;

	const renderContent = () => {
		if (isFetching) {
			return (
				<SidebarState
					loading
					title="Checking requests"
					description="Loading your friend requests and keeping this list fresh."
					icon={<LoaderCircle className="size-5" />}
				/>
			);
		}

		if (activeRequests.length === 0) {
			return isReceivedTab ? (
				<SidebarState
					title="You are all caught up"
					description="No pending requests right now. New invitations will appear here as soon as they arrive."
					icon={<Inbox className="size-5" />}
				/>
			) : (
				<SidebarState
					title="No sent requests"
					description="Send a request by email and track it here while you wait for a response."
					icon={<Send className="size-5" />}
					action={
						<AddFriendDialog showTooltip={false}>
							<Button size="sm" className="gap-2">
								<UserPlus className="size-4" />
								Add friend
							</Button>
						</AddFriendDialog>
					}
				/>
			);
		}

		if (isReceivedTab) {
			return requests?.map((request) => (
				<FriendRequestItem key={request._id} requestId={request._id} sender={request.sender} />
			));
		}

		return sentRequests?.map((req) => (
			<SentRequestItem key={req._id} requestId={req._id} receiver={req.receiver} />
		));
	};

	return (
		<div className="flex h-full w-full flex-col bg-background">
			<div className="sticky top-0 z-20 w-full border-b bg-background/95 px-4 pb-3 pt-4 backdrop-blur">
				<div className="mb-4 flex items-start justify-between gap-3">
					<div className="min-w-0">
						<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
							Friends
						</p>
						<h1 className="mt-1 text-2xl font-semibold tracking-tight">Requests</h1>
					</div>
					<AddFriendDialog />
				</div>

				<Tabs defaultValue="received" onValueChange={(value) => setCurrentTab(value)}>
					<TabsList variant="line" className="w-full justify-start">
						<TabsTrigger value="received">Received</TabsTrigger>
						<TabsTrigger value="sent">Sent</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			<div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 py-3">{renderContent()}</div>
		</div>
	);
};

export default RequestsSidebar;
