"use client";

import { useWebRTCCall } from "@/hooks/useWebRTCCall";
import { createContext, PropsWithChildren, useContext } from "react";
import CallWindow from "./CallWindow";
import IncomingCallDialog from "./IncomingCallDialog";

type CallContextValue = ReturnType<typeof useWebRTCCall>;

const CallContext = createContext<CallContextValue | null>(null);

export function useCall() {
	const context = useContext(CallContext);
	if (!context) {
		throw new Error("useCall must be used inside CallProvider");
	}

	return context;
}

const CallProvider = ({ children }: PropsWithChildren) => {
	const call = useWebRTCCall();

	return (
		<CallContext.Provider value={call}>
			{children}
			<IncomingCallDialog
				incomingCall={call.incomingCall}
				onAccept={call.acceptIncomingCall}
				onReject={call.rejectIncomingCall}
			/>
			<CallWindow
				activeCall={call.activeCall}
				callPeer={call.callPeer}
				localStream={call.localStream}
				remoteStream={call.remoteStream}
				isMuted={call.isMuted}
				isCameraOff={call.isCameraOff}
				isRinging={call.isRinging}
				isInCall={call.isInCall}
				onToggleMute={call.toggleMute}
				onToggleCamera={call.toggleCamera}
				onEnd={call.endCall}
			/>
		</CallContext.Provider>
	);
};

export default CallProvider;
