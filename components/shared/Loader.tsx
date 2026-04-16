import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";

type Props = {
	className?: string;
};

const Loader = ({ className = "" }: Props) => {
	return (
		<div className={cn("h-full w-full min-h-[50vh] flex items-center justify-center", className)}>
			<LoaderCircle className="animate-spin" />
		</div>
	);
};

export default Loader;
