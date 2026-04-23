import AddFriendDialog from "@/components/shared/dialogs/AddFriendDialog";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import FriendRequestItem from "../cards/ReceivedRequestItem";
import Loader from "../Loader";
import SentRequestItem from "../cards/SentRequestItem";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

const RequestsSidebar = () => {
	const requests = useQuery(api.requests.get) ?? [];
	const sentRequests = useQuery(api.requests.getSentRequests) ?? [];

	const [currentTab, setCurrentTab] = React.useState("received");

	return (
		<div className="w-full h-full p-4 flex flex-col gap-8">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold">Requests</h1>
				<AddFriendDialog />
			</div>

			<Tabs defaultValue="received" onValueChange={(value) => setCurrentTab(value)}>
				<TabsList variant="line">
					<TabsTrigger value="received">Received</TabsTrigger>
					<TabsTrigger value="sent">Sent</TabsTrigger>
				</TabsList>
			</Tabs>

			<div className="w-full flex flex-col gap-2">
				{currentTab === "received" ? (
					requests ? (
						requests?.length > 0 ? (
							requests?.map((request) => (
								<FriendRequestItem
									key={request._id}
									requestId={request._id}
									sender={request.sender}
								/>
							))
						) : null
					) : (
						<Loader />
					)
				) : null}
				{currentTab === "sent" ? (
					sentRequests ? (
						sentRequests?.length > 0 ? (
							sentRequests?.map((req) => (
								<SentRequestItem key={req._id} requestId={req._id} receiver={req.receiver} />
							))
						) : null
					) : (
						<Loader />
					)
				) : null}
			</div>
		</div>
	);
};

export default RequestsSidebar;
