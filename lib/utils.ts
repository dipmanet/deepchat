import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const formatTime = (timestamp: number | undefined): string => {
	if (!timestamp) return "";

	const date = new Date(timestamp);
	const now = new Date();

	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	// Just now
	if (diffMins < 1) return "Just now";

	// Within the hour → "5 mins ago"
	if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;

	// Within 12 hours → "12 hrs ago"
	if (diffHours < 7) return `${diffHours} min${diffHours > 1 ? "s" : ""} ago`;

	// Same calendar day → "14:35"
	if (
		date.getDate() === now.getDate() &&
		date.getMonth() === now.getMonth() &&
		date.getFullYear() === now.getFullYear()
	) {
		return date.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
	}

	// Yesterday → "Yesterday 14:35"
	if (diffDays === 1) {
		return `Yesterday ${date.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		})}`;
	}

	// Within the same week → "Mon 14:35"
	if (diffDays < 7) {
		return `${date.toLocaleDateString("en-US", { weekday: "short" })} ${date.toLocaleTimeString(
			"en-US",
			{
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			},
		)}`;
	}

	// Within the same month → "Monday 14:35"
	if (diffDays <= 31 && date.getMonth() === now.getMonth()) {
		return `${diffDays} days ago ${date.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		})}`;
	}

	// Within the same year → "Mar 15"
	if (date.getFullYear() === now.getFullYear()) {
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	}

	// Older → "Mar 15, 2023"
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};
