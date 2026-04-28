"use client";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { ChevronRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Logo from "@/assets/Logo";

const navLinks = ["Features", "Pricing", "Integrations", "Resources", "Enterprise"];

export default function Navbar() {
	const routers = useRouter();
	const [scrolled, setScrolled] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [activeLink, setActiveLink] = useState("");

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 20);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<nav
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
				scrolled
					? "bg-white/95 backdrop-blur-md shadow-sm shadow-blue-100/50 py-3"
					: "bg-transparent py-5"
			}`}>
			<div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
				{/* Logo */}
				<a
					href="#"
					className={`flex items-center gap-2.5 group ${scrolled ? "text-primary" : "text-white"}`}>
					<div className="w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
						<Logo />
					</div>
					<span className=" text-lg font-bold tracking-tight font-syne">DeepChat</span>
				</a>

				{/* Desktop Nav Links */}
				<div className="hidden md:flex items-center gap-8">
					{navLinks.map((link) => (
						<a
							key={link}
							href="#"
							onClick={() => setActiveLink(link)}
							className={`nav-link text-sm font-medium transition-colors duration-200 ${
								activeLink === link
									? scrolled
										? "text-primary"
										: "text-background"
									: scrolled
										? "text-gray-300 hover:text-primary"
										: "text-gray-300 hover:text-background"
							}`}>
							{link}
						</a>
					))}
				</div>

				{/* CTA Buttons */}
				<div className="flex items-center gap-3">
					{/* Mobile Menu Toggle */}
					<button
						className="md:hidden flex flex-col gap-1.5 p-2"
						onClick={() => setMenuOpen(!menuOpen)}
						aria-label="Toggle menu">
						<span
							className={`block h-0.5 w-6 bg-gray-200 rounded transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
						/>
						<span
							className={`block h-0.5 w-6 bg-gray-200 rounded transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
						/>
						<span
							className={`block h-0.5 w-6 bg-gray-200 rounded transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
						/>
					</button>
					<Show when={"signed-out"}>
						<SignInButton>
							<button className="btn-primary bg-background px-4 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200 cursor-pointer">
								Sign In
							</button>
						</SignInButton>
					</Show>
					<Show when={"signed-in"}>
						<UserButton />
						<Button variant="secondary" onClick={() => routers.push("/chat")}>
							<p>Chat</p>
							<ChevronRightIcon className="ml-2" />
						</Button>
					</Show>
				</div>
			</div>

			{/* Mobile Menu */}
			<div
				className={`md:hidden overflow-hidden transition-all duration-500 ${
					menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
				}`}>
				<div className="bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
					{navLinks.map((link) => (
						<a
							key={link}
							href="#"
							className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors py-1">
							{link}
						</a>
					))}
				</div>
			</div>
		</nav>
	);
}
