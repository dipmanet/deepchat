import { cn, formatTime } from "@/lib/utils";
import Image from "next/image";
import { File, FileSpreadsheet, FileText, Check, CheckCheck } from "lucide-react";
import { LeftTail, RightTail } from "@/assets/tails";
import AppAvatar from "./AppAvatar";
import { MessageType } from "@/lib/types";

function getFileInfo(filename?: string) {
	const ext = filename?.split(".").pop()?.toLowerCase();
	switch (ext) {
		case "ppt":
		case "pptx":
			return { icon: FileText, color: "bg-orange-500", label: "PPT" };
		case "xls":
		case "xlsx":
			return { icon: FileSpreadsheet, color: "bg-green-600", label: "XLS" };
		case "doc":
		case "docx":
			return { icon: FileText, color: "bg-blue-600", label: "DOC" };
		default:
			return { icon: File, color: "bg-gray-500", label: "FILE" };
	}
}

const MessageItem = ({ message }: { message: MessageType }) => {
	const { sender, content, type, attachmentUrl, self } = message;
	const attachmentName = "";
	const attachmentSize = "";
	const read = false;

	const fileInfo = getFileInfo(attachmentName);

	const selfBubbleClass = "text-primary";
	const otherBubbleClass = "text-gray-100";

	return type === "system" ? (
		<div className="w-full flex items-center justify-center gap-0.5 px-1">
			{/* System events */}
			<span className="text-[10px] text-secondary-foreground">
				{formatTime(message._creationTime)}
			</span>
			<p className="text-[14px] leading-[1.45] pr-14 whitespace-pre-wrap break-words">{content}</p>
		</div>
	) : (
		<div
			className={cn(
				"flex gap-2.5 items-end w-full px-4 py-0.5",
				self ? "flex-row-reverse" : "flex-row",
			)}>
			{/* Avatar */}
			<AppAvatar imageUrl={sender?.imageUrl || ""} />

			{/* Bubble column */}
			<div className={cn("flex flex-col gap-0.5 max-w-[65%]", self ? "items-end" : "items-start")}>
				{/* Sender name */}
				{!self && sender?.username && (
					<span className="text-[11px] font-semibold text-gray-500 px-1 mb-0.5">
						{sender.username}
					</span>
				)}

				{/* File attachment */}
				{type === "file" && attachmentUrl && (
					<div
						className={cn(
							"flex items-center gap-3 rounded-2xl px-3 py-2.5 w-full relative",
							self ? "bg-primary" : "bg-gray-100",
						)}>
						{!content && self && <RightTail className={selfBubbleClass} />}
						{!content && !self && <LeftTail className={otherBubbleClass} />}
						<div
							className={cn(
								"w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
								fileInfo.color,
							)}>
							<span className="text-[9px] font-bold text-white leading-none">{fileInfo.label}</span>
						</div>
						<div className="flex flex-col min-w-0">
							<span
								className={cn(
									"text-[13px] font-medium truncate",
									self ? "text-white" : "text-gray-800",
								)}>
								{attachmentName || "attachment"}
							</span>
							{attachmentSize && (
								<span className={cn("text-[11px]", self ? "text-blue-100" : "text-gray-400")}>
									{attachmentSize}
								</span>
							)}
						</div>
					</div>
				)}

				{/* Image attachment */}
				{type === "image" && attachmentUrl && (
					<div className="relative rounded-2xl rounded-bl-none overflow-hidden">
						{self && <RightTail className={selfBubbleClass} />}
						{!self && <LeftTail className={otherBubbleClass} />}
						<Image
							src={attachmentUrl}
							alt="Image attachment"
							width={260}
							height={180}
							className="object-cover block"
						/>
					</div>
				)}

				{/* Text bubble */}
				{(type === "text" || content) && (
					<div
						className={cn(
							"relative px-3.5 py-2.5 rounded-xl",
							self
								? "bg-primary text-white rounded-br-none"
								: "bg-gray-100 text-gray-800 rounded-bl-none",
						)}>
						{/* SVG Tail */}
						{self ? (
							<RightTail className={selfBubbleClass} />
						) : (
							<LeftTail className={otherBubbleClass} />
						)}

						<p className="text-[14px] leading-[1.45] pr-14 whitespace-pre-wrap break-words">
							{content}
						</p>

						{/* Timestamp + read receipt */}
						<div
							className={cn(
								"absolute bottom-2 right-3 flex items-center gap-0.5",
								self ? "text-blue-100" : "text-gray-400",
							)}>
							<span className="text-[10px] leading-none">{formatTime(message._creationTime)}</span>
							{self &&
								(read ? (
									<CheckCheck className="w-3.5 h-3.5 text-blue-200" strokeWidth={2.5} />
								) : (
									<Check className="w-3.5 h-3.5 opacity-70" strokeWidth={2.5} />
								))}
						</div>
					</div>
				)}

				{/* File-only timestamp row */}
				{type === "file" && !content && (
					<div className={cn("flex items-center gap-0.5 px-1", self ? "flex-row-reverse" : "")}>
						<span className="text-[10px] text-gray-400">{formatTime(message._creationTime)}</span>
						{self &&
							(read ? (
								<CheckCheck className="w-3 h-3 text-primary" strokeWidth={2.5} />
							) : (
								<Check className="w-3 h-3 text-gray-400" strokeWidth={2.5} />
							))}
					</div>
				)}
			</div>
		</div>
	);
};

export default MessageItem;
