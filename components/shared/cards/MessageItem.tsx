import { cn, formatTime } from "@/lib/utils";
import {
	Check,
	CheckCheck,
	Download,
	ExternalLink,
	File,
	FileSpreadsheet,
	FileText,
	Music,
	SmilePlus,
	Sparkles,
	Video,
} from "lucide-react";
import { LeftTail, RightTail } from "@/assets/tails";
import AppAvatar from "./AppAvatar";
import { MessageType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EmojiPicker from "@/components/shared/EmojiPicker";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";
import { REACTION_EMOJI_OPTIONS } from "@/lib/emojis";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function getFileInfo(filename?: string, fileType?: string) {
	const ext = filename?.split(".").pop()?.toLowerCase();

	if (fileType?.startsWith("audio/")) {
		return { icon: Music, color: "bg-violet-600", label: "AUDIO" };
	}

	if (fileType?.startsWith("video/")) {
		return { icon: Video, color: "bg-rose-600", label: "VIDEO" };
	}

	switch (ext) {
		case "pdf":
			return { icon: FileText, color: "bg-red-600", label: "PDF" };
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

function getReadableFileType(fileType?: string, fileName?: string) {
	if (fileType) return fileType;
	const ext = fileName?.split(".").pop()?.toUpperCase();
	return ext ? `${ext} file` : "File";
}

async function downloadAttachment(url: string, fileName: string) {
	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error("Download failed");

		const blob = await response.blob();
		const objectUrl = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = objectUrl;
		link.download = fileName;
		document.body.appendChild(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(objectUrl);
	} catch {
		const link = document.createElement("a");
		link.href = url;
		link.download = fileName;
		link.target = "_blank";
		link.rel = "noreferrer";
		link.click();
	}
}

function getReactionLabel(reaction: string) {
	return REACTION_EMOJI_OPTIONS.find((option) => option.emoji === reaction)?.label ?? "Reaction";
}

const MessageItem = ({ message }: { message: MessageType }) => {
	const { sender, content, type, attachmentUrl, self, fileName, fileType, deleted } = message;
	const toggleReaction = useMutation(api.reactions.toggleReaction);
	const [pendingReaction, setPendingReaction] = useState(false);
	const read = false;
	const attachmentName = fileName || "attachment";
	const fileInfo = getFileInfo(attachmentName, fileType);
	const FileIcon = fileInfo.icon;
	const isPdf = fileType === "application/pdf" || attachmentName.toLowerCase().endsWith(".pdf");
	const isFileMessage = type === "file" || type === "image" || type === "video" || type === "audio";

	const selfBubbleClass = "text-primary";
	const otherBubbleClass = "text-gray-100";
	const canReact = !deleted && type !== "system";

	const handleReaction = async (reaction: string) => {
		if (!canReact || pendingReaction) return;

		setPendingReaction(true);
		try {
			await toggleReaction({
				messageId: message._id,
				reaction,
			});
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Failed to update reaction";
			toast.error(errorMessage);
		} finally {
			setPendingReaction(false);
		}
	};

	const renderReactionControls = () => {
		if (!canReact) return null;

		return (
			<TooltipProvider delayDuration={3000}>
				<div
					className={cn(
						"flex flex-wrap items-center gap-1.5 px-1 pt-1",
						self ? "justify-end" : "",
					)}>
					{message.reactions?.map((reaction) => (
						<Tooltip key={reaction.reaction}>
							<TooltipTrigger asChild>
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={pendingReaction}
									className={cn(
										"h-8 gap-1.5 rounded-full border px-2.5 text-base shadow-none",
										reaction.reactedByMe &&
											"border-primary/40 bg-primary/10 text-primary hover:bg-primary/15",
									)}
									onClick={() => handleReaction(reaction.reaction)}>
									<span>{reaction.reaction}</span>
									<span className="text-xs">{reaction.count}</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent sideOffset={6}>{getReactionLabel(reaction.reaction)}</TooltipContent>
						</Tooltip>
					))}
					<Popover>
						<PopoverTrigger asChild>
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								disabled={pendingReaction}
								className="h-8 w-8 rounded-full text-gray-500"
								aria-label="React to message">
								<SmilePlus className="size-5" />
							</Button>
						</PopoverTrigger>
						<PopoverContent align={self ? "end" : "start"} className="w-72 p-2">
							<EmojiPicker
								options={REACTION_EMOJI_OPTIONS}
								showTooltips
								className="grid-cols-3"
								onSelect={handleReaction}
								disabled={pendingReaction}
							/>
						</PopoverContent>
					</Popover>
				</div>
			</TooltipProvider>
		);
	};

	const renderFileActions = () => {
		if (!attachmentUrl) return null;

		return (
			<div className="flex shrink-0 items-center gap-1">
				{isPdf && (
					<Button
						asChild
						variant="ghost"
						size="icon-xs"
						className={cn(self ? "text-white hover:bg-white/15" : "text-gray-700")}>
						<a href={attachmentUrl} target="_blank" rel="noreferrer" aria-label="Open file">
							<ExternalLink />
						</a>
					</Button>
				)}
				<Button
					type="button"
					variant="ghost"
					size="icon-xs"
					className={cn(self ? "text-white hover:bg-white/15" : "text-gray-700")}
					aria-label="Download file"
					onClick={() => downloadAttachment(attachmentUrl, attachmentName)}>
					<Download />
				</Button>
			</div>
		);
	};

	const renderFileCard = () => (
		<div
			className={cn(
				"relative flex w-full min-w-64 max-w-80 items-center gap-3 rounded-xl px-3 py-2.5",
				self
					? "bg-primary text-white rounded-br-none"
					: "bg-gray-100 text-gray-800 rounded-bl-none",
			)}>
			{self ? <RightTail className={selfBubbleClass} /> : <LeftTail className={otherBubbleClass} />}
			<div
				className={cn(
					"flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white",
					fileInfo.color,
				)}>
				<FileIcon className="size-5" />
			</div>
			<div className="min-w-0 flex-1">
				<p className="truncate text-[13px] font-medium">{attachmentName}</p>
				<p className={cn("truncate text-[11px]", self ? "text-blue-100" : "text-gray-500")}>
					{getReadableFileType(fileType, attachmentName)}
				</p>
			</div>
			{renderFileActions()}
		</div>
	);

	const renderAttachment = () => {
		if (!attachmentUrl || deleted) return null;

		if (type === "image") {
			return (
				<div className="relative max-w-80 flex items-end gap-2">
					<div className="h-fit rounded-md bg-black/45 text-white backdrop-blur">
						{renderFileActions()}
					</div>
					<Image
						src={attachmentUrl}
						alt={attachmentName}
						width={320}
						height={320}
						unoptimized
						className="block max-w-40 max-h-80 w-full object-cover"
					/>
				</div>
			);
		}

		if (type === "video") {
			return (
				<div className="relative max-w-80 overflow-hidden rounded-xl rounded-bl-none bg-black">
					{self ? (
						<RightTail className={selfBubbleClass} />
					) : (
						<LeftTail className={otherBubbleClass} />
					)}
					<video controls preload="metadata" className="block max-h-80 w-full">
						<source src={attachmentUrl} type={fileType} />
					</video>
					<div className="absolute right-2 top-2 rounded-md bg-black/45 text-white backdrop-blur">
						{renderFileActions()}
					</div>
				</div>
			);
		}

		if (type === "audio") {
			return (
				<div
					className={cn(
						"relative w-72 rounded-xl px-3 py-3",
						self
							? "bg-primary text-white rounded-br-none"
							: "bg-gray-100 text-gray-800 rounded-bl-none",
					)}>
					{self ? (
						<RightTail className={selfBubbleClass} />
					) : (
						<LeftTail className={otherBubbleClass} />
					)}
					<div className="mb-2 flex items-center justify-between gap-2">
						<p className="truncate text-[13px] font-medium">{attachmentName}</p>
						{renderFileActions()}
					</div>
					<audio controls preload="metadata" className="w-full">
						<source src={attachmentUrl} type={fileType} />
					</audio>
				</div>
			);
		}

		return renderFileCard();
	};

	if (type === "system") {
		return (
			<div className="flex w-full items-center justify-center gap-0.5 px-1">
				<span className="text-[10px] text-secondary-foreground">
					{formatTime(message._creationTime)}
				</span>
				<p className="whitespace-pre-wrap break-words pr-14 text-[14px] leading-[1.45]">
					{content}
				</p>
			</div>
		);
	}

	if (type === "look") {
		return (
			<div className="flex w-full flex-col items-center px-4 py-1.5">
				<div className="relative rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-amber-950 shadow-sm lg:max-w-[78%]">
					<div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
						<Sparkles className="size-3.5" />
						<span>Look</span>
					</div>
					<p className="whitespace-pre-wrap break-words px-2 pb-1 text-[14px] leading-[1.45]">
						{content}
					</p>
					<div className="w-full flex justify-end">
						<span className="text-[10px] leading-none text-amber-600">
							{formatTime(message._creationTime)}
						</span>
					</div>
				</div>
				{renderReactionControls()}
			</div>
		);
	}

	return (
		<div
			className={cn(
				"flex w-full items-end gap-2.5 px-4 py-0.5",
				self ? "flex-row-reverse" : "flex-row",
			)}>
			<div
				className={cn(
					"flex w-full items-end gap-2.5 px-4 py-0.5",
					self ? "flex-row-reverse" : "flex-row",
				)}>
				<AppAvatar imageUrl={sender?.imageUrl || ""} />

				<div
					className={cn("flex max-w-[75%] flex-col gap-0.5", self ? "items-end" : "items-start")}>
					{!self && sender?.username && (
						<span className="mb-0.5 px-1 text-[11px] font-semibold text-gray-500">
							{sender.username}
						</span>
					)}

					{deleted && (
						<div
							className={cn(
								"relative rounded-xl px-3.5 py-2.5 text-[13px] italic",
								self
									? "bg-primary/80 text-white rounded-br-none"
									: "bg-gray-100 text-gray-500 rounded-bl-none",
							)}>
							{self ? (
								<RightTail className={selfBubbleClass} />
							) : (
								<LeftTail className={otherBubbleClass} />
							)}
							File deleted
						</div>
					)}

					{!deleted && renderAttachment()}

					{!deleted && (type === "text" || content) && (
						<div
							className={cn(
								"relative rounded-xl px-3.5 py-2.5",
								self
									? "bg-primary text-white rounded-br-none"
									: "bg-gray-100 text-gray-800 rounded-bl-none",
							)}>
							{self ? (
								<RightTail className={selfBubbleClass} />
							) : (
								<LeftTail className={otherBubbleClass} />
							)}

							<p className="whitespace-pre-wrap break-words text-[14px] leading-[1.45] px-2 pb-1">
								{content}
							</p>

							<div
								className={cn(
									"flex justify-end items-center gap-0.5",
									self ? "text-blue-100" : "text-gray-400",
								)}>
								<span className="text-[10px] leading-none">
									{formatTime(message._creationTime)}
								</span>
								{self &&
									(read ? (
										<CheckCheck className="h-3.5 w-3.5 text-blue-200" strokeWidth={2.5} />
									) : (
										<Check className="h-3.5 w-3.5 opacity-70" strokeWidth={2.5} />
									))}
							</div>
						</div>
					)}

					{(isFileMessage || deleted) && !content && (
						<div className={cn("flex items-center gap-0.5 px-1", self ? "flex-row-reverse" : "")}>
							<span className="text-[10px] text-gray-400">{formatTime(message._creationTime)}</span>
							{self &&
								(read ? (
									<CheckCheck className="h-3 w-3 text-primary" strokeWidth={2.5} />
								) : (
									<Check className="h-3 w-3 text-gray-400" strokeWidth={2.5} />
								))}
						</div>
					)}
				</div>
				{renderReactionControls()}
			</div>
		</div>
	);
};

export default MessageItem;
