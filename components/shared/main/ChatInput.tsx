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
import { SendHorizontal } from "lucide-react";
import { useAction } from "convex/react";
import { useState } from "react";

const chatMessageSchema = z.object({
	chatId: z.string(),
	content: z.string().min(1, { message: "Message cannot be empty" }),
	type: z.union([
		z.literal("text"),
		z.literal("image"),
		z.literal("file"),
		z.literal("video"),
		z.literal("audio"),
	]),
});

type Props = {
	chatId: Id<"chats">;
};

const ChatInput = ({ chatId }: Props) => {
	const { mutate: sendMessage, pending: pendingSend } = useMutationState(api.messages.create);
	const runLookCommand = useAction(api.messages.look);
	const [pendingLook, setPendingLook] = useState(false);

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
				<FieldGroup>
					<Controller
						name="content"
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<TextareaAutosize
									{...field}
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
				<Button disabled={pendingSend || pendingLook} type="submit" className="">
					<SendHorizontal />
				</Button>
			</form>
		</div>
	);
};

export default ChatInput;
