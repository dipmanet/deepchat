import React from "react";
import useNavigation from "@/hooks/useNavigation";
import { cn } from "@/lib/utils";
import { useShowDetailsStore } from "@/lib/store";

type Props = React.PropsWithChildren<object>;

const DetailsWrapper = ({ children }: Props) => {
	const { showSidebarMobile } = useNavigation();
	const { showDetails } = useShowDetailsStore();

	return (
		<main
			className={cn(
				"h-full transition-all duration-300",
				showSidebarMobile ? "hidden lg:flex" : "",
				showDetails ? "w-full lg:w-[22vw]" : "w-0 overflow-hidden",
			)}>
			<div className="h-full w-full border-r shadow-sm overflow-y-auto bg-backround dark:bg-primary-backround">
				{children}
			</div>
		</main>
	);
};

export default DetailsWrapper;
