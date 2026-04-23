"use client";
import MainWrapper from "@/components/shared/layouts/MainWrapper";
import Navbar from "@/components/shared/Navbar";
import SidebarWrapper from "@/components/shared/layouts/SidebarWrapper";
import DetailsWrapper from "@/components/shared/layouts/DetailsWrapper";
import useNavigation from "@/hooks/useNavigation";
import React from "react";
import Detailsbar from "@/components/shared/sidebars/Detailsbar";
import Chatbar from "@/components/shared/sidebars/Chatbar";
// import { usePresence } from "@/hooks/usePresence";

type Props = React.PropsWithChildren<object>;

const Layout = ({ children }: Props) => {
	const { activeSidebar } = useNavigation();
	// usePresence();

	return (
		<div className="h-screen w-full flex flex-col-reverse lg:flex-row">
			<Navbar />
			<div className="h-full w-full flex flex-col lg:flex-row">
				<SidebarWrapper>{activeSidebar?.sidebarComponent}</SidebarWrapper>
				<MainWrapper>
					<Chatbar />
				</MainWrapper>
				<DetailsWrapper>
					<Detailsbar />
				</DetailsWrapper>
			</div>
		</div>
	);
};

export default Layout;
