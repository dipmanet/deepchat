import { ChatType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { BellMinusIcon, UserMinus } from "lucide-react";
import AppAlertDialog from "../alert_dialogs/AppAlertDialog";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useGroupStatus } from "@/hooks/useUserStatus";
import { useMutationState } from "@/hooks/useMutationState";
import { toast } from "sonner";
import AddMemberDialog from "@/components/shared/dialogs/AddMembarDialog";

const GroupDetails = ({ chat }: { chat: ChatType }) => {
	const { status, lastSeenLabel } = useGroupStatus(chat.lastActiveAt);
	const allMembers = useQuery(api.chatMembers.getAll, chat ? { id: chat?._id } : "skip");

	const { mutate: removeMember, pending: pendingRemoveGroup } = useMutationState(
		api.chatMembers.remove,
	);

	const handleRemoveMember = async (id: Id<"users">) => {
		if (chat) {
			await removeMember({ chatId: chat._id, userId: id })
				.then(() => {
					toast.info(`Member removed successfully!`);
				})
				.catch((err) => {
					toast.error(err.message ? err.message : "Failed to remove member");
				});
		}
	};
	const handleBlockMember = (id: Id<"users">) => {};
	return (
		<div className="flex flex-col items-center gap-8">
			<div className="px-5 text-center">
				<h3 className="font-semibold">{chat?.displayName}</h3>
				{/* <p className="text-sm">{chat?.email}</span> */}
			</div>
			{status === "online" ? (
				<div className="text-center text-green-500">Online</div>
			) : (
				<div className="text-center">Active {lastSeenLabel}</div>
			)}

			<div className=" px-2 w-full flex flex-col gap-2">
				{allMembers?.map((member, idx) => (
					<div key={idx} className="w-full flex items-center justify-between">
						<div>{member?.username}</div>
						<div className="flex gap-4 items-center">
							<AppAlertDialog
								onAction={() => handleBlockMember(member._id)}
								renderTitle={<span>Mute {member?.username || "this user"}?</span>}
								renderDescription={
									<span>
										Are you sure to mute{" "}
										<span className="capitalize text-destructive">{member?.username}</span> from
										this group? This user will no longer receive notifications from this group.
										list. You can add them again later.
									</span>
								}>
								<Button size={"icon"} variant={"destructive"}>
									<BellMinusIcon />
								</Button>
							</AppAlertDialog>
							<AppAlertDialog
								onAction={() => handleRemoveMember(member._id)}
								renderTitle={<span>Remove {member?.username || "this user"}?</span>}
								renderDescription={
									<span>
										Are you sure to remove{" "}
										<span className="capitalize text-destructive">{member?.username}</span>
										&nbsp;from this group ? This user will no longer get updates from this group.
										You can add them again later.
									</span>
								}>
								<Button size={"icon"} variant={"destructive"}>
									<UserMinus />
								</Button>
							</AppAlertDialog>
						</div>
					</div>
				))}
				<div className="w-full flex justify-between items-center">
					<div></div>
					{chat && <AddMemberDialog chatId={chat._id} />}
				</div>
			</div>
		</div>
	);
};

export default GroupDetails;
