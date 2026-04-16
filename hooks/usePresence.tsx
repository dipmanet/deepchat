// hooks/usePresence.ts
"use client";

import { api } from "@/convex/_generated/api";
import { useCallback, useEffect, useRef } from "react";
import { useMutationState } from "./useMutationState";

const ACTIVITY_EVENTS = [
	"mousemove",
	"mousedown",
	"keydown",
	"touchstart",
	"scroll",
	"focus",
] as const;

const THROTTLE_MS = 10_000; // update presence at most every 10s on activity
const OFFLINE_TIMEOUT_MS = 60_000; // mark offline after 60s of inactivity
const HEARTBEAT_MS = 30_000; // heartbeat ping every 30s while active

type PresenceStatus = "online" | "offline";

export function usePresence() {
	const { mutate: updatePresence } = useMutationState(api.presence.upsertPresence);

	const lastUpdateRef = useRef<number>(0);
	const offlineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const statusRef = useRef<PresenceStatus>("offline");

	const commitPresence = useCallback(
		async (status: PresenceStatus, now: number) => {
			try {
				await updatePresence({ status, lastSeen: now });
				statusRef.current = status;
				lastUpdateRef.current = now;
			} catch {
				console.warn("Error while getting the user profile");
				// Presence writes are best-effort and should never break UI interactions.
			}
		},
		[updatePresence],
	);

	const setOnline = useCallback(
		async (force = false) => {
			if (document.visibilityState !== "visible") return;

			const now = Date.now();
			const transitionedOnline = statusRef.current !== "online";

			if (!force && !transitionedOnline && now - lastUpdateRef.current < THROTTLE_MS) return;

			await commitPresence("online", now);
		},
		[commitPresence],
	);

	const setOffline = useCallback(
		async (force = false) => {
			if (!force && statusRef.current === "offline") return;
			const now = Date.now();
			await commitPresence("offline", now);
		},
		[commitPresence],
	);

	const resetOfflineTimer = useCallback(() => {
		if (offlineTimerRef.current) clearTimeout(offlineTimerRef.current);
		offlineTimerRef.current = setTimeout(() => {
			void setOffline();
		}, OFFLINE_TIMEOUT_MS);
	}, [setOffline]);

	const handleActivity = useCallback(() => {
		void setOnline();
		resetOfflineTimer();
	}, [resetOfflineTimer, setOnline]);

	const handleVisibilityChange = useCallback(() => {
		if (document.visibilityState === "visible") {
			void setOnline(true);
			resetOfflineTimer();
			return;
		}

		if (offlineTimerRef.current) clearTimeout(offlineTimerRef.current);
		void setOffline(true);
	}, [resetOfflineTimer, setOffline, setOnline]);

	const handlePageExit = useCallback(() => {
		void setOffline(true);
	}, [setOffline]);

	useEffect(() => {
		void setOnline(true);
		resetOfflineTimer();

		heartbeatRef.current = setInterval(() => {
			if (document.visibilityState === "visible") {
				void setOnline();
			}
		}, HEARTBEAT_MS);

		ACTIVITY_EVENTS.forEach((event) => {
			window.addEventListener(event, handleActivity, { passive: true });
		});
		document.addEventListener("visibilitychange", handleVisibilityChange);
		window.addEventListener("beforeunload", handlePageExit);
		window.addEventListener("pagehide", handlePageExit);

		return () => {
			ACTIVITY_EVENTS.forEach((event) => {
				window.removeEventListener(event, handleActivity);
			});
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			window.removeEventListener("beforeunload", handlePageExit);
			window.removeEventListener("pagehide", handlePageExit);

			if (offlineTimerRef.current) clearTimeout(offlineTimerRef.current);
			if (heartbeatRef.current) clearInterval(heartbeatRef.current);
		};
	}, [handleActivity, handlePageExit, handleVisibilityChange, resetOfflineTimer, setOnline]);
}
