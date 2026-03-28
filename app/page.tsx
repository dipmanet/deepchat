"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Logo from "@/public/deepchat_logo.svg";
import { AuthLoading } from "convex/react";
import { LucideLoaderPinwheel } from "lucide-react";

export default function Home() {
	const router = useRouter();
	const { isSignedIn } = useAuth();

	useEffect(() => {
		if (isSignedIn) {
			router.push("/chat");
		}
	}, [isSignedIn]);

	return (
		<>
			<header className="flex justify-between items-center p-4 gap-4 h-16">
				<Image src={Logo} alt="logo"></Image>
				<div className="flex gap-5">
					<SignInButton>
						<button className="bg-background text-[#6c47ff] border border-[#6c47ff] rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
							Sign In
						</button>
					</SignInButton>
					<SignUpButton>
						<button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
							Sign Up
						</button>
					</SignUpButton>
				</div>
			</header>
			<AuthLoading>
				<div className="h-screen w-full flex justify-center items-center">
					<LucideLoaderPinwheel className="animate-spin duration-1000 " />
				</div>
			</AuthLoading>
		</>
	);
}
