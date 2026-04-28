"use client";

import { buttonVariants } from "@/components/ui/button";
import useNavigation from "@/hooks/useNavigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/deepchat_logo.svg";
import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "../theme/ThemeToggle";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

const Navbar = () => {
	const { paths } = useNavigation();
	return (
		<div className="fixed bottom-0 lg:static lg:bottom-auto h-16 lg:h-screen w-full lg:w-16 bg-background dark:bg-primary-backround z-1000">
			<div className="h-full w-full py-4 border flex lg:flex-col gap-8 justify-between items-center">
				<Image src={Logo} alt="logo" className="hidden lg:flex" />
				<div className="h-full w-full flex lg:flex-col items-center">
					<nav className="h-full w-full lg:overflow-y-auto">
						<ul className="h-full flex lg:flex-col justify-evenly lg:justify-start items-center gap-4">
							{paths.map((path) => (
								<li key={path.href} className="relative">
									<Link href={path.href} className="cursor-pointer">
										<Tooltip>
											<TooltipTrigger>
												<div
													className={cn(
														"border ",
														buttonVariants({
															size: "icon",
															variant: path.active ? "default" : "outline",
														}),
													)}>
													{path.icon}
												</div>
												{path.count ? (
													<Badge className="absolute left-1/2 bottom-1/2 border-secondary-background bg-destructive text-primary-foreground">
														{path.count}
													</Badge>
												) : null}
											</TooltipTrigger>
											<TooltipContent side="right">
												<p>{path.name}</p>
											</TooltipContent>
										</Tooltip>
									</Link>
								</li>
							))}
						</ul>
					</nav>
				</div>
				<div className="pr-[10vw] lg:pr-0 lg:mb-10  flex lg:flex-col gap-[20vw] lg:gap-4 items-center">
					<ThemeToggle />
					<UserButton />
				</div>
			</div>
		</div>
	);
};

export default Navbar;
