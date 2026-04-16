"use client";

import { ChatType } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { BellMinusIcon, LucideShieldClose, UserMinus, UserPlusIcon } from "lucide-react";
import AppAlertDialog from "../alert_dialogs/AppAlertDialog";
import { useUserStatus } from "@/hooks/useUserStatus";
import { api } from "@/convex/_generated/api";
import { useMutationState } from "@/hooks/useMutationState";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { useRouter } from "next/navigation";

const FriendDetails = ({ chat }: { chat: ChatType }) => {
	const { friend, isFriend } = chat || {};
	const router = useRouter();

	const { status, lastSeenLabel } = useUserStatus(friend?._id || null);
	const { mutate: unfriend, pending } = useMutationState(api.friends.unfriend);
	const { mutate: requestFriend, pending: pendingRequestFriend } = useMutationState(
		api.requests.create,
	);
	const { mutate: removeGroup, pending: pendingRemoveGroup } = useMutationState(api.chats.remove);

	const handleRequestFriend = async () => {
		if (friend && !isFriend) {
			await requestFriend({ email: friend?.email })
				.then(() => {
					toast.success(`${friend?.username} added to your friend's list!`);
				})
				.catch((error) => {
					toast.error(
						error instanceof ConvexError
							? error.data
							: `Error while sending friend request to ${friend?.username}`,
					);
				});
		}
	};
	const handleUnfriend = async () => {
		if (friend && isFriend) {
			await unfriend({ friendId: friend?._id })
				.then(() => {
					toast.success(`${friend.username} removed from your friend's list!`);
				})
				.catch((error) => {
					toast.error(
						error instanceof ConvexError
							? error.data
							: `Error while unfriending ${friend?.username}`,
					);
				});
		}
	};
	const handleBlockFriend = async () => {};
	const handleRemoveGroup = async () => {
		if (chat) {
			await removeGroup({ id: chat._id })
				.then(() => toast.warning(`Group ${chat.displayName} Deleted Successfully !`))
				.catch((error) => {
					toast.error(
						error instanceof ConvexError
							? error.data
							: `Error while unfriending ${friend?.username}`,
					);
				})
				.finally(() => {
					router.push("/chat");
				});
		}
	};

	return (
		<div className="flex flex-col items-center gap-8">
			<div className="text-center">
				<h3 className="font-semibold">{friend?.username}</h3>
				<p className="text-sm">{friend?.email}</p>
			</div>
			{status === "online" && <div className="text-center">Active {lastSeenLabel} </div>}

			<div className="flex gap-4 justify-center">
				{isFriend ? (
					<>
						<AppAlertDialog
							onAction={handleBlockFriend}
							renderTitle={<p>Unfriend {friend?.username || "this user"}?</p>}
							renderDescription={
								<p>
									Are you sure to block{" "}
									<span className="capitalize text-destructive">{friend?.username}</span>? You
									won&apos;t receive calls or messages from{" "}
									<span className="capitalize text-destructive">{friend?.username}</span> on
									DeepChat.
								</p>
							}>
							<div
								className={buttonVariants({
									size: "icon",
									variant: "destructive",
								})}
								onClick={handleBlockFriend}>
								<BellMinusIcon />
							</div>
						</AppAlertDialog>
						<AppAlertDialog
							onAction={handleUnfriend}
							renderTitle={<p>Unfriend {friend?.username || "this user"}?</p>}
							renderDescription={
								<p>
									Are you sure to unfriend{" "}
									<span className="capitalize text-destructive">{friend?.username}</span>
								</p>
							}>
							<div
								className={buttonVariants({
									size: "icon",
									variant: "destructive",
								})}>
								<UserMinus />
							</div>
						</AppAlertDialog>
					</>
				) : (
					<>
						<AppAlertDialog
							onAction={handleRequestFriend}
							renderTitle={<p>Send a friend request?</p>}
							renderDescription={
								<p>
									Are you sure to send friend sequest to{" "}
									<span className="capitalize text-destructive">{chat.displayName}</span>?
								</p>
							}>
							<div
								className={buttonVariants({
									size: "icon",
									variant: "outline",
								})}>
								<UserPlusIcon />
							</div>
						</AppAlertDialog>
						<AppAlertDialog
							onAction={handleRemoveGroup}
							renderTitle={<p>Delete Group?</p>}
							renderDescription={
								<>
									Are you sure to delete all history data from your group
									<span className="capitalize text-destructive">{chat.displayName}</span>{" "}
									permanently?
								</>
							}>
							<div
								className={buttonVariants({
									size: "icon",
									variant: "outline",
								})}>
								<LucideShieldClose />
							</div>
						</AppAlertDialog>
					</>
				)}
			</div>
		</div>
	);
};

export default FriendDetails;
