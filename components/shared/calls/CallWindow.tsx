"use client";

import AppAvatar from "@/components/shared/cards/AppAvatar";
import { Button } from "@/components/ui/button";
import { CallType, UserType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { useEffect, useRef } from "react";

type Props = {
	activeCall: CallType | null;
	callPeer: UserType | null;
	localStream: MediaStream | null;
	remoteStream: MediaStream | null;
	isMuted: boolean;
	isCameraOff: boolean;
	isRinging: boolean;
	isInCall: boolean;
	onToggleMute: () => void;
	onToggleCamera: () => void;
	onEnd: () => void;
};

function StreamVideo({
	stream,
	muted = false,
	className,
}: {
	stream: MediaStream | null;
	muted?: boolean;
	className?: string;
}) {
	const videoRef = useRef<HTMLVideoElement | null>(null);

	useEffect(() => {
		if (videoRef.current) {
			videoRef.current.srcObject = stream;
		}
	}, [stream]);

	return (
		<video
			ref={videoRef}
			autoPlay
			playsInline
			muted={muted}
			className={cn("h-full w-full object-cover", className)}
		/>
	);
}

const CallWindow = ({
	activeCall,
	callPeer,
	localStream,
	remoteStream,
	isMuted,
	isCameraOff,
	isRinging,
	isInCall,
	onToggleMute,
	onToggleCamera,
	onEnd,
}: Props) => {
	if (!activeCall) return null;

	const isVideo = activeCall.type === "video";
	const title = callPeer?.username ?? "Call";

	return (
		<div className="fixed inset-x-3 bottom-20 z-50 mx-auto w-[min(100%-1.5rem,760px)] overflow-hidden rounded-lg border bg-background shadow-2xl lg:bottom-6">
			<div className="flex items-center justify-between border-b px-4 py-3">
				<div className="min-w-0">
					<p className="truncate text-sm font-semibold">{title}</p>
					<p className="text-xs capitalize text-muted-foreground">
						{isRinging ? "Ringing" : isInCall ? "Connected" : activeCall.status} {activeCall.type} call
					</p>
				</div>
				<Button variant="destructive" size="icon" onClick={onEnd} aria-label="End call">
					<PhoneOff className="size-4" />
				</Button>
			</div>

			<div className="relative h-[52vh] min-h-72 bg-zinc-950 text-white">
				{isVideo && remoteStream ? (
					<StreamVideo stream={remoteStream} />
				) : (
					<div className="flex h-full flex-col items-center justify-center gap-4">
						<AppAvatar imageUrl={callPeer?.imageUrl} className="!size-24" />
						<div className="text-center">
							<p className="font-medium">{title}</p>
							<p className="text-sm text-white/60">
								{remoteStream ? "Audio connected" : isRinging ? "Waiting for answer" : "Connecting"}
							</p>
						</div>
					</div>
				)}

				{isVideo && (
					<div className="absolute bottom-4 right-4 h-28 w-20 overflow-hidden rounded-md border border-white/20 bg-zinc-900 shadow-lg sm:h-36 sm:w-28">
						{localStream && !isCameraOff ? (
							<StreamVideo stream={localStream} muted />
						) : (
							<div className="flex h-full items-center justify-center">
								<VideoOff className="size-5 text-white/70" />
							</div>
						)}
					</div>
				)}
			</div>

			<div className="flex items-center justify-center gap-3 border-t bg-muted/40 px-4 py-3">
				<Button
					variant={isMuted ? "destructive" : "outline"}
					size="icon"
					onClick={onToggleMute}
					aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}>
					{isMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
				</Button>
				{isVideo && (
					<Button
						variant={isCameraOff ? "destructive" : "outline"}
						size="icon"
						onClick={onToggleCamera}
						aria-label={isCameraOff ? "Turn camera on" : "Turn camera off"}>
						{isCameraOff ? <VideoOff className="size-4" /> : <Video className="size-4" />}
					</Button>
				)}
				<Button variant="destructive" onClick={onEnd}>
					<PhoneOff className="size-4" />
					End
				</Button>
			</div>
		</div>
	);
};

export default CallWindow;
