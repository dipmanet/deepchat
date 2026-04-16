"use Clent";
import { useChatStore, useShowDetailsStore } from "@/lib/store";
import AppAvatar from "../cards/AppAvatar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FriendDetails from "../details/FriendDetails";
import GroupDetails from "../details/GroupDetails";
import { useGroupStatus, useUserStatus } from "@/hooks/useUserStatus";

const Detailsbar = () => {
	const { currentChat } = useChatStore();
	const { showDetails, setShowDetails } = useShowDetailsStore();

	const { status: groupStatus } = useGroupStatus(currentChat?.lastActiveAt);
	const { status: userStatus } = useUserStatus(currentChat?.friend?._id || null);
	const status = currentChat?.isGroup ? groupStatus : userStatus;

	return (
		<div className="w-full h-full flex flex-col bg-background">
			<Button
				className="lg:hidden mx-5 mt-5"
				onClick={() => setShowDetails(!showDetails)}
				variant={showDetails ? "default" : "outline"}
				size="icon">
				{showDetails ? <ChevronLeft /> : <ChevronRight />}
			</Button>
			<div className="pt-[10vh] pb-5 flex flex-col items-center">
				<AppAvatar
					imageUrl={currentChat?.displayImage || undefined}
					status={status}
					showOnline
					className="!size-40"
				/>
			</div>
			{currentChat?.isGroup ? (
				<GroupDetails chat={currentChat} />
			) : (
				currentChat && <FriendDetails chat={currentChat} />
			)}
		</div>
	);
};
export default Detailsbar;
