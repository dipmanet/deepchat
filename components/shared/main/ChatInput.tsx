import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutationState } from "@/hooks/useMutationState";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { Loader2, Paperclip, SendHorizontal, Smile } from "lucide-react";
import { useAction, useMutation } from "convex/react";
import { useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EmojiPicker from "@/components/shared/EmojiPicker";

const chatMessageSchema = z.object({
	chatId: z.string(),
	content: z.string().trim().min(1, { message: "Message cannot be empty" }),
	type: z.union([
		z.literal("text"),
		z.literal("image"),
		z.literal("file"),
		z.literal("video"),
		z.literal("audio"),
	]),
});

const MAX_FILE_SIZE = 25 * 1024 * 1024;

type FileMessageType = "image" | "video" | "audio" | "file";

type Props = {
	chatId: Id<"chats">;
};

const ChatInput = ({ chatId }: Props) => {
	const { mutate: sendMessage, pending: pendingSend } = useMutationState(api.messages.create);
	const generateUploadUrl = useMutation(api.files.generateUploadUrl);
	const sendFile = useMutation(api.files.sendFile);
	const runLookCommand = useAction(api.messages.look);
	const [pendingLook, setPendingLook] = useState(false);
	const [pendingFile, setPendingFile] = useState(false);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

	const form = useForm<z.infer<typeof chatMessageSchema>>({
		resolver: zodResolver(chatMessageSchema),
		defaultValues: {
			chatId,
			content: "",
			type: "text",
		},
	});

	const handleSubmit = async (data: z.infer<typeof chatMessageSchema>) => {
		const isLookCommand = /^\/look(?:\s+|$)/i.test(data.content.trim());
		const submitMessage = isLookCommand
			? async () => {
					setPendingLook(true);
					try {
						await runLookCommand({
							chatId: data.chatId as Id<"chats">,
							content: data.content,
							type: "text",
						});
					} finally {
						setPendingLook(false);
					}
				}
			: () => sendMessage({ ...data });

		await submitMessage()
			.then(() => {
				form.reset();
			})
			.catch((err) => {
				toast.error(err.message ? err.message : "Failed to send message");
			});
	};

	const getMessageType = (file: File): FileMessageType => {
		if (file.type.startsWith("image/")) return "image";
		if (file.type.startsWith("video/")) return "video";
		if (file.type.startsWith("audio/")) return "audio";
		return "file";
	};

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";

		if (!file) return;

		if (file.size > MAX_FILE_SIZE) {
			toast.error("File is too large. Please choose a file under 25 MB.");
			return;
		}

		setPendingFile(true);

		try {
			const uploadUrl = await generateUploadUrl({});
			const uploadResponse = await fetch(uploadUrl, {
				method: "POST",
				headers: {
					"Content-Type": file.type || "application/octet-stream",
				},
				body: file,
			});

			if (!uploadResponse.ok) {
				throw new Error("Upload failed");
			}

			const { storageId } = (await uploadResponse.json()) as { storageId: Id<"_storage"> };

			await sendFile({
				chatId,
				storageId,
				fileName: file.name,
				fileType: file.type || "application/octet-stream",
				type: getMessageType(file),
			});

			toast.success("File sent");
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to send file";
			toast.error(message);
		} finally {
			setPendingFile(false);
		}
	};

	const handleEmojiSelect = (emoji: string) => {
		const textarea = textareaRef.current;
		const currentValue = form.getValues("content") ?? "";
		const start = textarea?.selectionStart ?? currentValue.length;
		const end = textarea?.selectionEnd ?? currentValue.length;
		const nextValue = `${currentValue.slice(0, start)}${emoji}${currentValue.slice(end)}`;
		const nextCursor = start + emoji.length;

		form.setValue("content", nextValue, {
			shouldDirty: true,
			shouldTouch: true,
			shouldValidate: true,
		});

		window.setTimeout(() => {
			textareaRef.current?.focus();
			textareaRef.current?.setSelectionRange(nextCursor, nextCursor);
		}, 0);
	};

	const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		const { value, selectionStart } = event.target;
		if (selectionStart !== null) {
			form.setValue("content", value);
		}
		return null;
	};

	return (
		<div className="w-full flex items-center justify-between border-b shadow-sm p-4">
			<form
				{...form}
				onSubmit={form.handleSubmit(handleSubmit)}
				className="w-full flex items-center gap-4">
				<input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
				<Button
					type="button"
					variant="ghost"
					size="icon"
					disabled={pendingFile || pendingSend || pendingLook}
					aria-label="Attach file"
					onClick={() => fileInputRef.current?.click()}>
					{pendingFile ? <Loader2 className="animate-spin" /> : <Paperclip />}
				</Button>
				<FieldGroup>
					<Controller
						name="content"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<TextareaAutosize
									{...field}
									ref={(node) => {
										field.ref(node);
										textareaRef.current = node;
									}}
									rows={1}
									maxRows={3}
									placeholder="Write a message ..."
									className="w-full resize-none border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
									onKeyDown={async (e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											await form.handleSubmit(handleSubmit)();
										}
									}}
									onChange={handleInputChange}
								/>
								{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
							</Field>
						)}
					/>
				</FieldGroup>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							disabled={pendingFile || pendingSend || pendingLook}
							aria-label="Add emoji">
							<Smile />
						</Button>
					</PopoverTrigger>
					<PopoverContent align="end" className="w-64 p-2">
						<EmojiPicker onSelect={handleEmojiSelect} disabled={pendingFile || pendingSend || pendingLook} />
					</PopoverContent>
				</Popover>
				<Button disabled={pendingSend || pendingLook || pendingFile} type="submit" className="">
					{pendingSend || pendingLook ? <Loader2 className="animate-spin" /> : <SendHorizontal />}
				</Button>
			</form>
		</div>
	);
};

export default ChatInput;
