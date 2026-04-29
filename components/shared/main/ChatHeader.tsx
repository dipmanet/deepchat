import AppAvatar from "@/components/shared/cards/AppAvatar";
import { useCall } from "@/components/shared/calls/CallProvider";
import { Button } from "@/components/ui/button";
import { useGroupStatus, useUserStatus } from "@/hooks/useUserStatus";
import { useShowDetailsStore } from "@/lib/store";
import { ChatType } from "@/lib/types";
import { ChevronLeft, ChevronRight, PhoneIcon, VideoIcon } from "lucide-react";
import { toast } from "sonner";

const ChatHeader = ({ currentChat }: { currentChat: ChatType }) => {
	const { showDetails, setShowDetails } = useShowDetailsStore();
	const { startAudioCall, startVideoCall, isCalling, isInCall } = useCall();

	const { status: userStatus } = useUserStatus(currentChat?.friend?._id || null);
	const { status: groupStatus } = useGroupStatus(currentChat?.lastActiveAt);
	const status = currentChat?.isGroup ? groupStatus : userStatus;
	const callsDisabled = isCalling || isInCall;

	const handleAudioCall = () => {
		if (currentChat.isGroup) {
			toast.error("Group calls are not supported yet");
			return;
		}

		void startAudioCall(currentChat);
	};

	const handleVideoCall = () => {
		if (currentChat.isGroup) {
			toast.error("Group calls are not supported yet");
			return;
		}

		void startVideoCall(currentChat);
	};

	return (
		<div className="w-full flex items-center justify-between border-b shadow-sm p-4">
			<div className="flex gap-4 items-center">
				<AppAvatar
					imageUrl={currentChat?.displayImage || ""}
					status={status}
					showOnline
					className="!size-15"
				/>
				<h3 className="font-semibold">{currentChat?.displayName}</h3>
			</div>
			<div className="flex gap-4 items-center">
				<Button
					onClick={handleAudioCall}
					variant="ghost"
					size="icon"
					disabled={callsDisabled}
					aria-label="Start audio call">
					<PhoneIcon />
				</Button>
				<Button
					onClick={handleVideoCall}
					variant="ghost"
					size="icon"
					disabled={callsDisabled}
					aria-label="Start video call">
					<VideoIcon />
				</Button>
				<Button
					onClick={() => setShowDetails(!showDetails)}
					variant={showDetails ? "default" : "outline"}
					size="icon">
					{showDetails ? <ChevronRight /> : <ChevronLeft />}
				</Button>
			</div>
		</div>
	);
};

export default ChatHeader;
