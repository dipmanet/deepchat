"use client";

import ChatSidebar from "@/components/shared/ChatSidebar";
import FriendsSidebar from "@/components/shared/FriendsSidebar";
import { MessageSquare, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";

const useNavigation = () => {
	const pathname = usePathname();

	const paths = useMemo(
		() => [
			{
				name: "Conversations",
				href: "/chat",
				icon: <MessageSquare />,
				active: pathname.startsWith("/chat"),
				sidebarComponent: <ChatSidebar />,
			},
			{
				name: "Friends",
				href: "/friends",
				icon: <Users />,
				active: pathname.startsWith("/friends"),
				sidebarComponent: <FriendsSidebar />,
			},
		],
		[pathname],
	);

	const activeSidebar = paths.find((path) => pathname.startsWith(path.href)) || paths[0];
	const showSidebarMobile = activeSidebar.href === pathname;

	return { paths, activeSidebar, showSidebarMobile };
};

export default useNavigation;
