import React from "react";
import useNavigation from "@/hooks/useNavigation";
import { cn } from "@/lib/utils";

type Props = React.PropsWithChildren<object>;

const SidebarWrapper = ({ children }: Props) => {
	const { showSidebarMobile } = useNavigation();
	return (
		<main className={cn("h-full w-full lg:w-[25%]", showSidebarMobile ? "" : "hidden lg:flex")}>
			<div className="h-full w-full p-1 border rounded-sm shadow-sm overflow-y-auto overflow-x-clip bg-backround dark:bg-primary-backround">
				{children}
			</div>
		</main>
	);
};

export default SidebarWrapper;
