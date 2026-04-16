import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMemo } from "react";

type UserStatus = "online" | "offline";

interface UserStatusResult {
	status: UserStatus;
	lastSeen: number | null;
	lastSeenLabel: string; // e.g. "2 minutes ago"
}

export const getLastActiveLabel = (lastSeen: number | null): string => {
	if (!lastSeen) return "";

	const diff = Date.now() - lastSeen;
	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (seconds < 60) return "Just now";
	if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
	if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	return `${days} day${days === 1 ? "" : "s"} ago`;
};

export const useUserStatus = (userId: Id<"users"> | null): UserStatusResult => {
	const presence = useQuery(api.presence.getByUser, userId ? { userId } : "skip");

	return {
		status: (presence?.status || "offline") as "online" | "offline",
		lastSeen: presence?.lastSeen || null,
		lastSeenLabel: presence?.lastSeen ? getLastActiveLabel(presence.lastSeen) : "",
	};
};
export const useGroupStatus = (lastSeen: number | null = null) => {
	const isOnline: boolean = useMemo(() => {
		if (!lastSeen) return false;
		const diff = new Date().getTime() - new Date(lastSeen).getTime();
		if (diff < 5 * 60 * 1000) return true;
		return false;
	}, [lastSeen]);

	return {
		status: (isOnline ? "online" : "offline") as "online" | "offline",
		lastSeenLabel: getLastActiveLabel(lastSeen),
	};
};
