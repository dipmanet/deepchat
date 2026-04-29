"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CallSignalType, CallType, ChatType } from "@/lib/types";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type SimplePeer from "simple-peer";
import { toast } from "sonner";

type PeerSignal = SimplePeer.SignalData;
type PeerRole = "caller" | "receiver" | null;
type PeerInstance = SimplePeer.Instance;

const peerConfig = {
	iceServers: [
		{ urls: "stun:stun.l.google.com:19302" },
		{ urls: "stun:global.stun.twilio.com:3478" },
	],
	// Production calls should include TURN servers for reliable relay fallback.
};

function getSignalKind(signal: PeerSignal) {
	if ("candidate" in signal) return "ice-candidate" as const;
	if (signal.type === "offer") return "offer" as const;
	return "answer" as const;
}

function getReceiverId(chat: ChatType) {
	const friendId = chat.friend?._id;
	if (friendId) return friendId;

	const otherMember = chat.members?.find((member) => member.userId !== chat.createdBy);
	return otherMember?.userId ?? null;
}

function getMediaErrorMessage(error: unknown) {
	if (error instanceof DOMException) {
		if (error.name === "NotAllowedError" || error.name === "SecurityError") {
			return "Camera and microphone permission was blocked. Allow access in your browser settings and try again.";
		}

		if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
			return "No camera or microphone was found for this call.";
		}

		if (error.name === "NotReadableError" || error.name === "TrackStartError") {
			return "Your camera or microphone is already in use by another app.";
		}
	}

	if (error instanceof Error) return error.message;

	return "Could not access camera or microphone.";
}

export function useWebRTCCall() {
	const startCallMutation = useMutation(api.calls.startCall);
	const acceptCallMutation = useMutation(api.calls.acceptCall);
	const rejectCallMutation = useMutation(api.calls.rejectCall);
	const endCallMutation = useMutation(api.calls.endCall);
	const sendSignalMutation = useMutation(api.calls.sendSignal);

	const [activeCallId, setActiveCallId] = useState<Id<"calls"> | null>(null);
	const [callRole, setCallRole] = useState<PeerRole>(null);
	const [localStream, setLocalStream] = useState<MediaStream | null>(null);
	const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
	const [isCalling, setIsCalling] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [isCameraOff, setIsCameraOff] = useState(false);

	const peerRef = useRef<PeerInstance | null>(null);
	const localStreamRef = useRef<MediaStream | null>(null);
	const processedSignalsRef = useRef<Set<string>>(new Set());
	const activeCallIdRef = useRef<Id<"calls"> | null>(null);
	const endingRef = useRef(false);

	const incomingCall = useQuery(api.calls.getIncomingCall, {}) as CallType | null | undefined;
	const activeCall = useQuery(
		api.calls.getCall,
		activeCallId ? { callId: activeCallId } : "skip",
	) as CallType | null | undefined;
	const signals = useQuery(
		api.calls.getSignals,
		activeCallId ? { callId: activeCallId } : "skip",
	) as CallSignalType[] | undefined;

	useEffect(() => {
		activeCallIdRef.current = activeCallId;
	}, [activeCallId]);

	const stopLocalStream = useCallback(() => {
		localStreamRef.current?.getTracks().forEach((track) => track.stop());
		localStreamRef.current = null;
		setLocalStream(null);
	}, []);

	const cleanup = useCallback(
		(shouldNotifyServer: boolean) => {
			const callId = activeCallIdRef.current;

			if (shouldNotifyServer && callId && !endingRef.current) {
				endingRef.current = true;
				void endCallMutation({ callId }).catch(() => undefined);
			}

			const peer = peerRef.current;
			peerRef.current = null;
			activeCallIdRef.current = null;
			peer?.destroy?.();
			stopLocalStream();
			setRemoteStream(null);
			setActiveCallId(null);
			setCallRole(null);
			setIsCalling(false);
			setIsMuted(false);
			setIsCameraOff(false);
			processedSignalsRef.current.clear();
			endingRef.current = false;
		},
		[endCallMutation, stopLocalStream],
	);

	const getMediaStream = useCallback(async (type: "audio" | "video") => {
		if (typeof navigator === "undefined") {
			throw new Error("Camera and microphone access is unavailable in this browser.");
		}

		const mediaDevices = navigator.mediaDevices;

		if (!mediaDevices?.getUserMedia) {
			throw new Error(
				window.isSecureContext
					? "Camera and microphone access is unavailable in this browser."
					: "Camera and microphone access requires HTTPS or localhost. Open the app with a secure URL and try again.",
			);
		}

		let stream: MediaStream;

		try {
			// This call is what asks the browser to show the camera/microphone permission prompt.
			stream = await mediaDevices.getUserMedia({
				audio: true,
				video: type === "video",
			});
		} catch (error) {
			throw new Error(getMediaErrorMessage(error));
		}

		localStreamRef.current = stream;
		setLocalStream(stream);
		setIsMuted(false);
		setIsCameraOff(false);

		return stream;
	}, []);

	const createPeer = useCallback(
		async ({
			callId,
			stream,
			initiator,
		}: {
			callId: Id<"calls">;
			stream: MediaStream;
			initiator: boolean;
		}) => {
			const simplePeerModule = await import("simple-peer");
			const Peer = simplePeerModule.default;

			const peer = new Peer({
				initiator,
				trickle: true,
				stream,
				config: peerConfig,
			});

			peer.on("signal", (signal: PeerSignal) => {
				void sendSignalMutation({
					callId,
					kind: getSignalKind(signal),
					payload: JSON.stringify(signal),
				}).catch((error) => {
					const message = error instanceof Error ? error.message : "Failed to send call signal";
					toast.error(message);
				});
			});

			peer.on("stream", (stream: MediaStream) => {
				setRemoteStream(stream);
			});

			peer.on("error", () => {
				toast.error("The call connection failed");
				cleanup(true);
			});

			peer.on("close", () => {
				cleanup(true);
			});

			peerRef.current = peer;
			return peer;
		},
		[cleanup, sendSignalMutation],
	);

	const beginPeerSession = useCallback(
		async ({
			callId,
			type,
			role,
			stream: providedStream,
		}: {
			callId: Id<"calls">;
			type: "audio" | "video";
			role: Exclude<PeerRole, null>;
			stream?: MediaStream;
		}) => {
			const stream = providedStream ?? (await getMediaStream(type));
			setActiveCallId(callId);
			setCallRole(role);
			await createPeer({
				callId,
				stream,
				initiator: role === "caller",
			});
		},
		[createPeer, getMediaStream],
	);

	const startCall = useCallback(
		async (chat: ChatType, type: "audio" | "video") => {
			if (chat.isGroup) {
				toast.error("Group calls are not supported yet");
				return;
			}

			const receiverId = getReceiverId(chat);
			if (!receiverId) {
				toast.error("Could not find a user to call");
				return;
			}

			let callId: Id<"calls"> | null = null;

			try {
				setIsCalling(true);
				callId = await startCallMutation({
					chatId: chat._id,
					receiverId,
					type,
				});
				await beginPeerSession({ callId, type, role: "caller" });
			} catch (error) {
				if (callId) {
					void endCallMutation({ callId }).catch(() => undefined);
				}
				setIsCalling(false);
				const message = error instanceof Error ? error.message : "Could not start call";
				toast.error(message);
				cleanup(false);
			}
		},
		[beginPeerSession, cleanup, endCallMutation, startCallMutation],
	);

	const startAudioCall = useCallback((chat: ChatType) => startCall(chat, "audio"), [startCall]);
	const startVideoCall = useCallback((chat: ChatType) => startCall(chat, "video"), [startCall]);

	const acceptIncomingCall = useCallback(async () => {
		if (!incomingCall) return;

		try {
			const stream = await getMediaStream(incomingCall.type);
			await acceptCallMutation({ callId: incomingCall._id });
			await beginPeerSession({
				callId: incomingCall._id,
				type: incomingCall.type,
				role: "receiver",
				stream,
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : "Could not accept call";
			toast.error(message);
			void rejectCallMutation({ callId: incomingCall._id }).catch(() => undefined);
			cleanup(false);
		}
	}, [acceptCallMutation, beginPeerSession, cleanup, getMediaStream, incomingCall, rejectCallMutation]);

	const rejectIncomingCall = useCallback(async () => {
		if (!incomingCall) return;

		try {
			await rejectCallMutation({ callId: incomingCall._id });
		} catch (error) {
			const message = error instanceof Error ? error.message : "Could not reject call";
			toast.error(message);
		}
	}, [incomingCall, rejectCallMutation]);

	const endCall = useCallback(() => {
		cleanup(true);
	}, [cleanup]);

	const toggleMute = useCallback(() => {
		const audioTracks = localStreamRef.current?.getAudioTracks() ?? [];
		const nextMuted = !isMuted;
		audioTracks.forEach((track) => {
			track.enabled = !nextMuted;
		});
		setIsMuted(nextMuted);
	}, [isMuted]);

	const toggleCamera = useCallback(() => {
		const videoTracks = localStreamRef.current?.getVideoTracks() ?? [];
		const nextCameraOff = !isCameraOff;
		videoTracks.forEach((track) => {
			track.enabled = !nextCameraOff;
		});
		setIsCameraOff(nextCameraOff);
	}, [isCameraOff]);

	useEffect(() => {
		if (!signals || !peerRef.current) return;

		for (const signal of signals) {
			if (processedSignalsRef.current.has(signal._id)) continue;

			processedSignalsRef.current.add(signal._id);
			try {
				peerRef.current.signal(JSON.parse(signal.payload));
			} catch {
				toast.error("Received an invalid call signal");
			}
		}
	}, [signals]);

	useEffect(() => {
		if (!activeCall) return;

		if (["ended", "rejected", "missed"].includes(activeCall.status)) {
			cleanup(false);
		}
	}, [activeCall, cleanup]);

	useEffect(() => {
		return () => cleanup(true);
	}, [cleanup]);

	return {
		localStream,
		remoteStream,
		activeCall: activeCall ?? null,
		callPeer:
			callRole === "caller"
				? (activeCall?.receiver ?? null)
				: callRole === "receiver"
					? (activeCall?.caller ?? null)
					: null,
		incomingCall: incomingCall ?? null,
		isCalling,
		isRinging: Boolean(activeCallId && callRole === "caller" && activeCall?.status === "ringing"),
		isInCall: Boolean(activeCallId && activeCall?.status === "accepted"),
		startAudioCall,
		startVideoCall,
		acceptIncomingCall,
		rejectIncomingCall,
		endCall,
		toggleMute,
		toggleCamera,
		isMuted,
		isCameraOff,
	};
}
