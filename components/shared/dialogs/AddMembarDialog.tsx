"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { UserPlus } from "lucide-react";
import { useMutationState } from "@/hooks/useMutationState";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { MultiSelect } from "@/components/ui/multi-select";
import { useQuery } from "convex/react";
import React from "react";
import { Id } from "@/convex/_generated/dataModel";

const addChatSchema = z.object({
	chatId: z.string(),
	userIds: z.array(z.string()),
});

const AddMemberDialog = ({ chatId }: { chatId: Id<"chats"> }) => {
	const [open, setOpen] = React.useState(false);
	const [searchText, setSearchText] = React.useState("");

	const { mutate: addMember, pending } = useMutationState(api.chatMembers.add);
	const filteredFriends = useQuery(api.friends.getAll, { search: searchText }) || [];

	const options = filteredFriends.map((friend) => ({
		label: friend!.friend.username,
		value: friend!.friend._id,
	}));

	const form = useForm<z.infer<typeof addChatSchema>>({
		resolver: zodResolver(addChatSchema),
		defaultValues: {
			chatId: chatId,
			userIds: [],
		},
	});

	const handleSubmit = async (values: z.infer<typeof addChatSchema>) => {
		await addMember({ chatId: values.chatId, userIds: values.userIds })
			.then((res) => {
				if (res) {
					form.reset();
					setOpen(false);
					toast.success("Member added successfully.");
				}
			})
			.catch((error) => {
				toast.error(error instanceof ConvexError ? error.data : "Error adding member.");
			});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Tooltip>
				<TooltipTrigger>
					<DialogTrigger asChild>
						<div className={buttonVariants({ variant: "outline", size: "icon" })}>
							<UserPlus className="w-6 h-6" />
						</div>
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent>
					<p>Add New Member</p>
				</TooltipContent>
			</Tooltip>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add friends.</DialogTitle>
					<DialogDescription>Select new friends to add to the chat group.</DialogDescription>
				</DialogHeader>
				<form {...form} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
					<FieldGroup>
						<Controller
							name="userIds"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="form-rhf-demo-title">Email</FieldLabel>
									<MultiSelect
										options={options}
										value={field.value}
										onValueChange={field.onChange}
										placeholder="Select members..."
										searchable
										// onSearchChange={setSearchText}
										// onSearchChange={setSearchText}
										// disabled={pending}
										// noOptionsMessage="No friends found"
									/>
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>
					</FieldGroup>
				</form>
				<DialogFooter>
					<Button type="submit" onClick={form.handleSubmit(handleSubmit)}>
						{pending ? "Add..." : "Add"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddMemberDialog;
