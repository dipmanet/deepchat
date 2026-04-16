import { ChatType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { BellMinusIcon, UserMinus } from "lucide-react";
import AppAlertDialog from "../alert_dialogs/AppAlertDialog";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useGroupStatus } from "@/hooks/useUserStatus";

const GroupDetails = ({ chat }: { chat: ChatType }) => {
	const { status, lastSeenLabel } = useGroupStatus(chat.lastActiveAt);
	const allMembers = useQuery(api.chatMembers.getAll, { id: chat?._id });

	const handleRemoveMember = (id: Id<"users">) => {};
	const handleBlockMember = (id: Id<"users">) => {};
	return (
		<div className="flex flex-col items-center gap-8">
			<div className="text-center">
				<h3 className="font-semibold">{chat?.displayName}</h3>
				{/* <p className="text-sm">{chat?.email}</p> */}
			</div>
			{status === "online" && <div className="text-center">Active {lastSeenLabel}</div>}

			{allMembers?.map((member, idx) => (
				<div key={idx} className="w-full flex items-center justify-between">
					<div>{member?.username}</div>
					<div className="flex gap-4 items-center"></div>

					<AppAlertDialog
						onAction={() => handleRemoveMember(member._id)}
						renderTitle={<p>Remove {member?.username || "this user"}?</p>}
						renderDescription={
							<p>
								Are you sure to remove{" "}
								<span className="capitalize text-destructive">{member?.username}</span> from this
								group? This user will no longer appear in this group&apos;s member&apos;s list. You
								can add them again later.
							</p>
						}>
						<Button size={"icon"} variant={"destructive"}>
							<BellMinusIcon />
						</Button>
					</AppAlertDialog>
					<AppAlertDialog
						onAction={() => handleBlockMember(member._id)}
						renderTitle={<p>Block {member?.username || "this user"}?</p>}
						renderDescription={
							<p>
								Are you sure to block{" "}
								<span className="capitalize text-destructive">
									{member?.username} from this group
								</span>
								? This user will no longer get updates from this group. You can add them again
								later.
							</p>
						}>
						<Button size={"icon"} variant={"destructive"}>
							<UserMinus />
						</Button>
					</AppAlertDialog>
				</div>
			))}
		</div>
	);
};

export default GroupDetails;
