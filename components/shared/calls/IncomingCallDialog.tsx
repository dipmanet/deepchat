"use client";

import AppAvatar from "@/components/shared/cards/AppAvatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { CallType } from "@/lib/types";
import { Phone, PhoneOff, Video } from "lucide-react";

type Props = {
	incomingCall: CallType | null;
	onAccept: () => void;
	onReject: () => void;
};

const IncomingCallDialog = ({ incomingCall, onAccept, onReject }: Props) => {
	const callerName = incomingCall?.caller?.username ?? "Someone";
	const isVideo = incomingCall?.type === "video";

	return (
		<Dialog open={Boolean(incomingCall)}>
			<DialogContent showCloseButton={false}>
				<DialogHeader className="items-center text-center">
					<AppAvatar imageUrl={incomingCall?.caller?.imageUrl} className="!size-16" />
					<DialogTitle>{callerName}</DialogTitle>
					<DialogDescription className="flex items-center justify-center gap-2">
						{isVideo ? <Video className="size-4" /> : <Phone className="size-4" />}
						Incoming {incomingCall?.type} call
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="grid grid-cols-2 sm:grid-cols-2">
					<Button variant="destructive" onClick={onReject}>
						<PhoneOff className="size-4" />
						Decline
					</Button>
					<Button onClick={onAccept}>
						<Phone className="size-4" />
						Accept
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default IncomingCallDialog;
