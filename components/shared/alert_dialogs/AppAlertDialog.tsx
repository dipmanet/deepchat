import React, { ReactNode } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Props = React.PropsWithChildren<{
	onAction: () => void;
	renderTitle?: ReactNode;
	renderDescription?: ReactNode;
	cancelText?: string;
	actionText?: string;
}>;

const AppAlertDialog = ({
	onAction,
	renderTitle = <p>Are you sure?</p>,
	renderDescription = null,
	cancelText = "Cancel",
	actionText = "Confirm",
	children,
}: Props) => {
	return (
		<AlertDialog>
			<AlertDialogTrigger>{children}</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{renderTitle}</AlertDialogTitle>
					<AlertDialogDescription>{renderDescription}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>{cancelText}</AlertDialogCancel>
					<AlertDialogAction variant={"destructive"} onClick={() => onAction()}>
						{actionText}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default AppAlertDialog;
