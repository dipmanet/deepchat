import React from "react";
import useNavigation from "@/hooks/useNavigation";
import { cn } from "@/lib/utils";

type Props = React.PropsWithChildren<object>;

const SidebarWrapper = ({ children }: Props) => {
	const { showSidebarMobile } = useNavigation();
	return (
		<main className={cn("h-full w-full lg:w-[22vw]", showSidebarMobile ? "" : "hidden lg:flex")}>
			<div className="h-full w-full border-r shadow-sm overflow-y-auto no-scrollbar bg-background dark:bg-primary-background">
				{children}
			</div>
		</main>
	);
};

export default SidebarWrapper;
