import React from "react";
import useNavigation from "@/hooks/useNavigation";
import { cn } from "@/lib/utils";
import { useShowDetailsStore } from "@/lib/store";

type Props = React.PropsWithChildren<object>;

const MainWrapper = ({ children }: Props) => {
	const { showSidebarMobile } = useNavigation();
	const { showDetails } = useShowDetailsStore();
	return (
		<main
			className={cn(
				"h-full flex grow transition-transform",
				showSidebarMobile || showDetails ? "hidden lg:flex" : "",
			)}>
			<div className="h-[calc(100vh-var(--spacing)*16)] lg:h-screen w-full border-r shadow-sm flex-1 grow flex overflow-x-clip overflow-y-auto bg-background dark:bg-secondary-background">
				{children}
			</div>
		</main>
	);
};

export default MainWrapper;
