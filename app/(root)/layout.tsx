"use client";
import MainWrapper from "@/components/shared/MainWrapper";
import Navbar from "@/components/shared/Navbar";
import SidebarWrapper from "@/components/shared/SidebarWrapper";
import useNavigation from "@/hooks/useNavigation";
import React from "react";

type Props = React.PropsWithChildren<object>;

const Layout = ({ children }: Props) => {
	const { activeSidebar } = useNavigation();
	return (
		<div className="h-full w-full flex">
			<Navbar />
			<div className="h-screen w-full flex flex-col lg:flex-row gap-2 p-1">
				<SidebarWrapper>
					{activeSidebar?.sidebarComponent ?? <div className="p-4">Select a section</div>}
				</SidebarWrapper>
				<MainWrapper>{children}</MainWrapper>
			</div>
		</div>
	);
};

export default Layout;
