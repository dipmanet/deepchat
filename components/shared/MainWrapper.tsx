import React from "react";
import useNavigation from "@/hooks/useNavigation";
import { cn } from "@/lib/utils";

type Props = React.PropsWithChildren<object>;

const MainWrapper = ({ children }: Props) => {
	const { showSidebarMobile } = useNavigation();
	return (
		<main className={cn("h-full w-full flex grow", showSidebarMobile ? "hidden lg:flex" : "")}>
			<div className="h-full w-full p-4 border rounded-sm shadow-sm grow flex overflow-x-clip overflowy-auto bg-background dark:bg-secondary-background">
				{children}
			</div>
		</main>
	);
};

export default MainWrapper;
