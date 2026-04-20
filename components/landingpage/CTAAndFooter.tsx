"use client";
import { useEffect, useRef, useState } from "react";

const footerLinks = {
	Product: ["Features", "Pricing", "Integrations", "Changelog", "Roadmap"],
	Company: ["About", "Blog", "Careers", "Press", "Brand"],
	Resources: ["Documentation", "Help Center", "API Reference", "Community", "Status"],
	Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR", "Security"],
};

function CTASection() {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) setVisible(true);
			},
			{ threshold: 0.2 },
		);
		if (ref.current) observer.observe(ref.current);
		return () => observer.disconnect();
	}, []);

	return (
		<section className="py-24 px-6 bg-gray-50" ref={ref}>
			<div className="max-w-4xl mx-auto">
				<div
					className={`relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-3xl p-12 md:p-16 text-center overflow-hidden reveal ${visible ? "revealed" : ""}`}>
					{/* Background effects */}
					<div className="absolute inset-0 pointer-events-none overflow-hidden">
						<div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-400/20 blob animate-float-slow" />
						<div
							className="absolute -bottom-10 -left-10 w-48 h-48 bg-orange-400/15 blob animate-float"
							style={{ animationDelay: "2s" }}
						/>
						<div className="absolute inset-0 dot-grid opacity-10" />
					</div>

					<div className="relative z-10">
						<div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
							<span className="text-orange-400">🚀</span>
							<span className="text-white/80 text-xs font-medium tracking-widest uppercase">
								Get started today
							</span>
						</div>

						<h2 className="display-heading text-4xl md:text-5xl text-white mb-4 leading-tight">
							Ready to have your
							<br />
							<span className="text-orange-400">best chat ever?</span>
						</h2>
						<p className="text-blue-100 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
							Join 10,000+ teams already using DeepChat. Set up in minutes, free forever for small
							teams.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<a
								href="#"
								className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 group">
								Start Free — No Credit Card
								<span className="group-hover:translate-x-1 transition-transform duration-200">
									→
								</span>
							</a>
							<a
								href="#"
								className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-sm hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
								Schedule a Demo
							</a>
						</div>

						{/* Mini trust indicators */}
						<div className="flex flex-wrap justify-center gap-6 mt-10 text-blue-200 text-sm">
							{[
								"✓ Free plan forever",
								"✓ No credit card needed",
								"✓ Set up in 2 minutes",
								"✓ Cancel anytime",
							].map((item, i) => (
								<span key={i}>{item}</span>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function Footer() {
	return (
		<footer className="bg-gray-900 text-white pt-16 pb-8">
			<div className="max-w-7xl mx-auto px-6">
				{/* Top: logo + links */}
				<div className="grid md:grid-cols-5 gap-10 mb-12">
					{/* Brand */}
					<div className="md:col-span-1">
						<div className="flex items-center gap-2.5 mb-4 group">
							<div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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
						</div>
						<p className="text-gray-400 text-sm leading-relaxed mb-5">
							The modern team communication platform built for clarity, speed, and collaboration.
						</p>
						<div className="flex gap-3">
							{["twitter", "linkedin", "github", "youtube"].map((social) => (
								<a
									key={social}
									href="#"
									className="w-8 h-8 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
									aria-label={social}>
									<span className="text-xs text-gray-400 hover:text-white capitalize">
										{social[0].toUpperCase()}
									</span>
								</a>
							))}
						</div>
					</div>

					{/* Links */}
					{Object.entries(footerLinks).map(([category, links]) => (
						<div key={category}>
							<h4 className="text-sm font-semibold text-white mb-4 tracking-wide">{category}</h4>
							<ul className="space-y-2.5">
								{links.map((link) => (
									<li key={link}>
										<a
											href="#"
											className="text-sm text-gray-400 hover:text-white transition-colors duration-200 nav-link inline-block">
											{link}
										</a>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				{/* Bottom bar */}
				<div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
					<p className="text-gray-500 text-sm">© 2025 DeepChat, Inc. All rights reserved.</p>
					<div className="flex items-center gap-2 text-gray-500 text-sm">
						<div className="w-2 h-2 rounded-full bg-green-400 dot-pulse" />
						All systems operational
					</div>
				</div>
			</div>
		</footer>
	);
}

export default function CTAAndFooter() {
	return (
		<>
			<CTASection />
			<Footer />
		</>
	);
}
