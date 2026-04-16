import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

type Props = {
	status?: "online" | "offline";
	imageUrl?: string;
	className?: string;
	showOnline?: boolean;
};

const AppAvatar = ({ imageUrl, status = "offline", showOnline = false, className = "" }: Props) => {
	return (
		<Avatar size={"lg"} className={cn("!size-13", className)}>
			<AvatarImage
				src={imageUrl || undefined}
				alt="profile_pic"
				className="border border-green-100"
			/>
			<AvatarFallback>
				<User />
			</AvatarFallback>
			{showOnline && status === "online" && (
				<AvatarBadge className="!size-[20%] bottom-[5%] right-[5%]">
					<div className={cn("w-full h-full rounded-full bg-green-500")}></div>
				</AvatarBadge>
			)}
		</Avatar>
	);
};

export default AppAvatar;
