"use client";

import ChatSidebar from "@/components/shared/sidebars/ChatSidebar";
import FriendsSidebar from "@/components/shared/sidebars/RequestsSidebar";
import { api } from "@/convex/_generated/api";
import { useChatStore, useShowDetailsStore } from "@/lib/store";
import { useQuery } from "convex/react";
import { MessageSquare, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";

const useNavigation = () => {
	const pathname = usePathname();

	const { setCurrentChat } = useChatStore();
	const { setShowDetails } = useShowDetailsStore();

	const requestCount = useQuery(api.requests.count) ?? 0;

	const paths = React.useMemo(
		() => [
			{
				name: "Chats",
				href: "/chat",
				icon: <MessageSquare />,
				active: pathname.startsWith("/chat"),
				sidebarComponent: <ChatSidebar />,
				count: 0,
			},
			{
				name: "Friends",
				href: "/friends",
				icon: <Users />,
				active: pathname.startsWith("/friends"),
				sidebarComponent: <FriendsSidebar />,
				count: requestCount || 0,
			},
		],
		[pathname, requestCount],
	);

	React.useEffect(() => {
		setCurrentChat(null);
		setShowDetails(false);
	}, [paths]);

	const activeSidebar = paths.find((path) => pathname.startsWith(path.href)) || paths[0];
	const showSidebarMobile = activeSidebar.href === pathname;

	return { paths, activeSidebar, showSidebarMobile };
};

export default useNavigation;
