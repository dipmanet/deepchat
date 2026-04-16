import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutationState } from "@/hooks/useMutationState";
import { Check, User } from "lucide-react";
import { toast } from "sonner";

type Props = {
	requestId: Id<"requests">;
	sender: {
		_id: Id<"users">;
		_creationTime: number;
		username: string;
		email: string;
		imageUrl: string;
		clerkId: string;
	} | null;
};

const FriendRequestItem = ({ requestId, sender }: Props) => {
	const { username, email, imageUrl } = sender || {};

	const { mutate: denyRequest, pending: pendingDeny } = useMutationState(api.requests.deny);
	const { mutate: acceptRequest, pending: pendingAccept } = useMutationState(api.requests.accept);

	const handleAccept = () => {
		acceptRequest({ id: requestId })
			.then(() => {
				toast.success("Friend request accepted");
			})
			.catch(() => {
				toast.error("Failed to accept friend request");
			});
	};
	const handleDeny = () => {
		denyRequest({ id: requestId })
			.then(() => {
				toast.success("Friend request denied");
			})
			.catch(() => {
				toast.error("Failed to deny friend request");
			});
	};
	return (
		<Card className="bg-background">
			<div className="flex items-center gap-4 px-2">
				<Avatar>
					<AvatarImage src={imageUrl} />
					<AvatarFallback>
						<User />
					</AvatarFallback>
				</Avatar>
				<div className="flex-1 truncate">
					<p className="font-semibold">{username}</p>
					<p className="text-sm text-muted-foreground">{email}</p>
				</div>
				<div className="flex gap-2">
					<Button size={"icon"} onClick={handleAccept} disabled={pendingAccept || pendingDeny}>
						<Check />
					</Button>
					<Button
						size={"icon"}
						variant={"destructive"}
						onClick={handleDeny}
						disabled={pendingAccept || pendingDeny}>
						<p className="bold">x</p>
					</Button>
				</div>
			</div>
		</Card>
	);
};

export default FriendRequestItem;
