import { cn } from "@/lib/utils";

export const LeftTail = ({ className }: { className?: string }) => (
	<svg
		width="10"
		height="16"
		viewBox="0 0 10 16"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className={cn("absolute -left-[9px] bottom-0", className)}>
		<path
			d="M10 0 C10 0, 10 12, 10 14 C10 15.1 9.1 16 8 16 L0 16 C0 16, 6 14, 8 10 C9.5 7, 10 0, 10 0 Z"
			fill="currentColor"
		/>
	</svg>
);

export const RightTail = ({ className }: { className?: string }) => (
	<svg
		width="10"
		height="16"
		viewBox="0 0 10 16"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className={cn("absolute -right-[9px] bottom-0", className)}>
		<path
			d="M0 0 C0 0, 0 12, 0 14 C0 15.1 0.9 16 2 16 L10 16 C10 16, 4 14, 2 10 C0.5 7, 0 0, 0 0 Z"
			fill="currentColor"
		/>
	</svg>
);
