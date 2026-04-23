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
import { Input } from "@/components/ui/input";
import { UserPlus } from "lucide-react";
import { useMutationState } from "@/hooks/useMutationState";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

const addFriendFormSchema = z.object({
	email: z.email("Please enter a valid email address"),
});

const AddFriendDialog = () => {
	const { mutate: createFriendRequst, pending } = useMutationState(api.requests.create);

	const form = useForm<z.infer<typeof addFriendFormSchema>>({
		resolver: zodResolver(addFriendFormSchema),
		defaultValues: {
			email: "",
		},
	});

	const handleSubmit = async (values: z.infer<typeof addFriendFormSchema>) => {
		console.log("test submitting");
		await createFriendRequst({ email: values.email })
			.then(() => {
				form.reset();
				toast.success("Friend request sent successfully!");
			})
			.catch((error) => {
				toast.error(error instanceof ConvexError ? error.data : "Error creating friend request.");
			});
	};

	return (
		<Dialog>
			<Tooltip>
				<TooltipTrigger>
					<DialogTrigger asChild>
						<div className={buttonVariants({ variant: "outline", size: "icon" })}>
							<UserPlus />
						</div>
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent>
					<p>Add Friend</p>
				</TooltipContent>
			</Tooltip>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Send a Friend Request.</DialogTitle>
					<DialogDescription>
						Click to send a friend request to connect with them.
					</DialogDescription>
				</DialogHeader>
				<form {...form} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
					<FieldGroup>
						<Controller
							name="email"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="form-rhf-demo-title">Email</FieldLabel>
									<Input
										{...field}
										aria-invalid={fieldState.invalid}
										placeholder="Enter your friend's email"
										autoComplete="off"
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

export default AddFriendDialog;
