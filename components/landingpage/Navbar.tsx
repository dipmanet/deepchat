"use client";
import { SignInButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";

const navLinks = ["Features", "Pricing", "Integrations", "Resources", "Enterprise"];

export default function Navbar() {
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
				<a href="#" className="flex items-center gap-2.5 group">
					<div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-600/30">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
							<path
								d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
								fill="white"
							/>
						</svg>
					</div>
					<span
						className="text-lg font-bold tracking-tight"
						style={{ fontFamily: "Syne, sans-serif" }}>
						DeepChat
					</span>
				</a>

				{/* Desktop Nav Links */}
				<div className="hidden md:flex items-center gap-8">
					{navLinks.map((link) => (
						<a
							key={link}
							href="#"
							onClick={() => setActiveLink(link)}
							className={`nav-link text-sm font-medium transition-colors duration-200 ${
								activeLink === link ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
							}`}>
							{link}
						</a>
					))}
				</div>

				{/* CTA Buttons */}
				<div className="hidden md:flex items-center gap-3">
					<SignInButton>
						<button className="btn-primary bg-background px-4 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200 px-2 cursor-pointer">
							Sign In
						</button>
					</SignInButton>
				</div>

				{/* Mobile Menu Toggle */}
				<button
					className="md:hidden flex flex-col gap-1.5 p-2"
					onClick={() => setMenuOpen(!menuOpen)}
					aria-label="Toggle menu">
					<span
						className={`block h-0.5 w-6 bg-gray-700 rounded transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
					/>
					<span
						className={`block h-0.5 w-6 bg-gray-700 rounded transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
					/>
					<span
						className={`block h-0.5 w-6 bg-gray-700 rounded transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
					/>
				</button>
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
					<div className="flex gap-3 pt-2 border-t border-gray-100">
						<a href="#" className="text-sm font-medium text-gray-600 py-2">
							Sign in
						</a>
						<a href="#" className="btn-primary text-sm px-4 py-2 ml-auto">
							Start Free →
						</a>
					</div>
				</div>
			</div>
		</nav>
	);
}
