"use client";
import MainWrapper from "@/components/shared/layouts/MainWrapper";
import Navbar from "@/components/shared/Navbar";
import SidebarWrapper from "@/components/shared/layouts/SidebarWrapper";
import DetailsWrapper from "@/components/shared/layouts/DetailsWrapper";
import useNavigation from "@/hooks/useNavigation";
import Detailsbar from "@/components/shared/details/Detailsbar";
import Chatbar from "@/components/shared/main/Chatbar";
import CallProvider from "@/components/shared/calls/CallProvider";
// import { usePresence } from "@/hooks/usePresence";

const Layout = () => {
	const { activeSidebar } = useNavigation();
	// usePresence();

	return (
		<CallProvider>
			<div className="h-screen w-full flex flex-col-reverse lg:flex-row">
				<Navbar />
				<div className="h-full w-full flex flex-col lg:flex-row pb-16 lg:pb-0">
					<SidebarWrapper>{activeSidebar?.sidebarComponent}</SidebarWrapper>
					<MainWrapper>
						<Chatbar />
					</MainWrapper>
					<DetailsWrapper>
						<Detailsbar />
					</DetailsWrapper>
				</div>
			</div>
		</CallProvider>
	);
};

export default Layout;
