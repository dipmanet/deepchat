import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutationState } from "@/hooks/useMutationState";
import { UserType } from "@/lib/types";
import { User } from "lucide-react";
import { toast } from "sonner";

type Props = {
	requestId: Id<"requests">;
	receiver: UserType;
};

const SentRequestItem = ({ requestId, receiver }: Props) => {
	const { username, email, imageUrl } = receiver || {};

	const { mutate: cancelRequest, pending: pendingCancelRequest } = useMutationState(
		api.requests.cancel,
	);

	const handleCancel = () => {
		cancelRequest({ id: requestId })
			.then(() => {
				toast.success("Friend request cancelled");
			})
			.catch(() => {
				toast.error("Failed to cancel friend request");
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
				<div className="flex flex-col gap-2 items-end">
					<Button
						size={"icon"}
						variant={"destructive"}
						onClick={handleCancel}
						disabled={pendingCancelRequest}>
						<p className="bold">x</p>
					</Button>
				</div>
			</div>
		</Card>
	);
};

export default SentRequestItem;
