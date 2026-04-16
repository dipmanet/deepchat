"use client";
import AddFriendDialog from "@/components/shared/dialogs/AddFriendDialog";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import FriendRequestItem from "../cards/ReceivedRequestItem";
import Loader from "../Loader";
import FriendItem from "../cards/FriendItem";
import SentRequestItem from "../cards/SentRequestItem";

const FriendsSidebar = () => {
	const requests = useQuery(api.requests.get) ?? [];
	const friends = useQuery(api.friends.getAll) ?? [];

	const sentRequests = useQuery(api.requests.getSentRequests) ?? [];

	return (
		<div className="w-full h-full p-4 flex flex-col gap-8">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold">Friends</h1>
				<AddFriendDialog />
			</div>

			<div className="w-full flex flex-col gap-2">
				{sentRequests.map((req, idx) => (
					<SentRequestItem key={idx} requestId={req._id} receiver={req.receiver} />
				))}
				{requests ? (
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
				)}
				{friends ? (
					friends?.length > 0 ? (
						friends?.map((request) =>
							request?.chatId ? (
								<FriendItem key={request._id} friend={request?.friend} chatId={request.chatId} />
							) : null,
						)
					) : (
						<div>
							<p>You have no friend yet.</p>
						</div>
					)
				) : (
					<Loader />
				)}
			</div>
		</div>
	);
};

export default FriendsSidebar;
