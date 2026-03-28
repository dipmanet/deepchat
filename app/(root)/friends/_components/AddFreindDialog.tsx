import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

type Props = {};

const addFriendFormSchema = z.object({
	email: z
		.string()
		.min(1, "This field cannot be empty")
		.email("Please enter a valid email address"),
});

const AddFreindDialog = (props: Props) => {
	const form = useForm<z.infer<typeof addFriendFormSchema>>({
		resolver: zodResolver(addFriendFormSchema),
		defaultValues: {
			email: "",
		},
	});
	return <div>AddFreindDialog</div>;
};

export default AddFreindDialog;
