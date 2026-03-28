"use client";

import { buttonVariants } from "@/components/ui/button";
import useNavigation from "@/hooks/useNavigation";
import { Tooltip } from "@base-ui/react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/deepchat_logo.svg";
import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "../theme/ThemeToggle";

const Navbar = () => {
	const { paths } = useNavigation();
	return (
		<div className="fixed bottom-0 lg:static lg:bottom-auto lg:p-1 h-16 lg:h-screen w-full lg:w-16 bg-background dark:bg-primary-backround ">
			<div className="h-full w-full px-2 py-4 border rounded-sm shadow-sm flex lg:flex-col gap-8 justify-between items-center">
				<Image src={Logo} alt="logo" className="hidden lg:flex" />
				<div className="h-full w-full flex lg:flex-col items-center">
					<nav className="h-full w-full lg:overflow-y-auto">
						<ul className="h-full flex lg:flex-col justify-evenly lg:justify-start items-center gap-4">
							<Tooltip.Provider>
								{paths.map((path) => (
									<li key={path.href} className="relative">
										<Link href={path.href}>
											<Tooltip.Root>
												<Tooltip.Trigger>
													<div
														className={buttonVariants({
															size: "icon",
															variant: path.active ? "default" : "outline",
														})}>
														{path.icon}
													</div>
												</Tooltip.Trigger>
												<Tooltip.Portal>
													<Tooltip.Positioner>
														<Tooltip.Popup>
															<p>{path.name}</p>
														</Tooltip.Popup>
													</Tooltip.Positioner>
												</Tooltip.Portal>
											</Tooltip.Root>
										</Link>
									</li>
								))}
							</Tooltip.Provider>
						</ul>
					</nav>
				</div>
				<div className="lg:mb-10 flex lg:flex-col gap-4">
					<ThemeToggle />
					<UserButton />
				</div>
			</div>
		</div>
	);
};

export default Navbar;
