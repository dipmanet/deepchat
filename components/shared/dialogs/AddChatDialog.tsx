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
import { MessageSquarePlusIcon } from "lucide-react";
import { useMutationState } from "@/hooks/useMutationState";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { MultiSelect } from "@/components/ui/multi-select";
import { useQuery } from "convex/react";
import React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

const addChatSchema = z.object({
	emails: z.array(z.email("Please enter a valid email address")),
	name: z.string().optional(),
});

const AddChatDialog = () => {
	const routers = useRouter();

	const [open, setOpen] = React.useState(false);
	const [searchText, setSearchText] = React.useState("");
	const { mutate: createChat, pending } = useMutationState(api.chats.create);
	const filteredFriends = useQuery(api.friends.getAll, { search: searchText }) || [];

	const options = filteredFriends.map((friend) => ({
		label: friend!.friend.username,
		value: friend!.friend.email,
	}));

	const form = useForm<z.infer<typeof addChatSchema>>({
		resolver: zodResolver(addChatSchema),
		defaultValues: {
			emails: [],
		},
	});

	const handleSubmit = async (values: z.infer<typeof addChatSchema>) => {
		await createChat({ emails: values.emails, name: values.name })
			.then((res) => {
				if (res) {
					form.reset();
					setOpen(false);
					routers.push(`/chat/${res}`); // navigate to the new chat
				}
			})
			.catch((error) => {
				toast.error(error instanceof ConvexError ? error.data : "Error creating friend request.");
			});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Tooltip>
				<TooltipTrigger>
					<DialogTrigger asChild>
						<div className={buttonVariants({ variant: "outline", size: "icon" })}>
							<MessageSquarePlusIcon className="w-6 h-6" />
						</div>
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent>
					<p>Add Chat</p>
				</TooltipContent>
			</Tooltip>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add a chat group.</DialogTitle>
					<DialogDescription>Click to create a new chat group.</DialogDescription>
				</DialogHeader>
				<form {...form} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
					<FieldGroup>
						<Controller
							name="name"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="form-rhf-demo-title">Chat Name</FieldLabel>
									<Input
										value={field.value}
										onChange={field.onChange}
										placeholder="Enter chat name (optional)"
									/>
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>
						<Controller
							name="emails"
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
						{pending ? "Sending..." : "Send"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddChatDialog;
