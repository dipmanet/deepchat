"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ChatErrorPage = () => {
	const router = useRouter();

	useEffect(() => {
		router.replace("/friends");
	}, [router]);
	return null;
};

export default ChatErrorPage;
