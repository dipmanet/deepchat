"use client";
import { useEffect, useRef, useState } from "react";

const stats = [
	{ value: "99.9%", label: "Uptime SLA", icon: "⚡" },
	{ value: "50ms", label: "Avg. Latency", icon: "🚀" },
	{ value: "10M+", label: "Messages/day", icon: "💬" },
	{ value: "150+", label: "Countries", icon: "🌍" },
];

function StatCard({ stat, index }: { stat: (typeof stats)[0]; index: number }) {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) setVisible(true);
			},
			{ threshold: 0.3 },
		);
		if (ref.current) observer.observe(ref.current);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			className={`text-center reveal ${visible ? "revealed" : ""}`}
			style={{ transitionDelay: `${index * 120}ms` }}>
			<div className="text-3xl mb-2">{stat.icon}</div>
			<div className="display-heading text-4xl md:text-5xl text-blue-600 mb-1">{stat.value}</div>
			<div className="text-gray-500 text-sm font-medium">{stat.label}</div>
		</div>
	);
}

export default function ShowcaseSection() {
	const sectionRef = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) setVisible(true);
			},
			{ threshold: 0.1 },
		);
		if (sectionRef.current) observer.observe(sectionRef.current);
		return () => observer.disconnect();
	}, []);

	return (
		<section className="py-24 bg-white overflow-hidden" ref={sectionRef}>
			<div className="max-w-7xl mx-auto px-6">
				{/* Main showcase: left text, right mockup */}
				<div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
					{/* Left */}
					<div className={`reveal-left ${visible ? "revealed" : ""}`}>
						<div className="section-tag mb-6">Instant Team Chats</div>
						<h2 className="display-heading text-4xl md:text-5xl text-gray-900 mb-6 leading-tight">
							All your conversations,
							<br />
							<span className="gradient-text">beautifully organized</span>
						</h2>
						<p className="text-gray-500 text-lg leading-relaxed mb-8">
							Create channels for any topic, direct message teammates, or start a thread to keep
							discussions focused. DeepChat adapts to how your team works, not the other way around.
						</p>

						<ul className="space-y-4 mb-8">
							{[
								"Unlimited message history — never lose context",
								"Smart threading keeps replies organized",
								"Emoji reactions for quick, low-friction responses",
								"Rich text formatting with code blocks & markdown",
							].map((item, i) => (
								<li key={i} className="flex items-start gap-3">
									<div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
										<svg
											width="10"
											height="10"
											viewBox="0 0 24 24"
											fill="none"
											stroke="white"
											strokeWidth="3">
											<path d="M20 6L9 17l-5-5" />
										</svg>
									</div>
									<span className="text-gray-600 text-sm leading-relaxed">{item}</span>
								</li>
							))}
						</ul>

						<a href="#" className="btn-primary inline-flex items-center gap-2">
							Explore All Features →
						</a>
					</div>

					{/* Right: Larger chat UI mockup */}
					<div className={`relative reveal-right ${visible ? "revealed" : ""}`}>
						{/* Decorative dots */}
						<div className="absolute -top-6 -right-6 w-32 h-32 dot-grid rounded-2xl opacity-60" />

						<div className="relative bg-white rounded-2xl shadow-2xl shadow-blue-100/60 border border-gray-100 overflow-hidden hover-lift">
							{/* App header */}
							<div className="bg-blue-700 px-5 py-3 flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="flex gap-1.5">
										<div className="w-3 h-3 rounded-full bg-red-400/80" />
										<div className="w-3 h-3 rounded-full bg-yellow-400/80" />
										<div className="w-3 h-3 rounded-full bg-green-400/80" />
									</div>
									<span className="text-white/70 text-xs ml-2">DeepChat — workspace</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-24 h-6 bg-blue-600/50 rounded-lg" />
								</div>
							</div>

							<div className="flex h-80">
								{/* Sidebar */}
								<div className="w-48 bg-blue-800 p-3 flex flex-col gap-1 flex-shrink-0">
									<p className="text-blue-300 text-xs font-semibold uppercase tracking-wider px-2 mb-2">
										Channels
									</p>
									{["# general", "# design", "# engineering", "# marketing", "# random"].map(
										(ch, i) => (
											<div
												key={i}
												className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${i === 1 ? "bg-blue-600 text-white" : "text-blue-300 hover:bg-blue-700/50 hover:text-white"}`}>
												<span className="text-xs">{ch}</span>
												{i === 0 && (
													<span className="ml-auto w-4 h-4 bg-orange-400 rounded-full text-white text-xs flex items-center justify-center">
														3
													</span>
												)}
											</div>
										),
									)}
									<p className="text-blue-300 text-xs font-semibold uppercase tracking-wider px-2 mt-4 mb-2">
										Direct
									</p>
									{["Sarah K.", "Alex M.", "Mike R."].map((name, i) => (
										<div
											key={i}
											className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-blue-300 hover:bg-blue-700/50 hover:text-white cursor-pointer transition-colors">
											<div
												className={`w-2 h-2 rounded-full ${i === 0 ? "bg-green-400" : "bg-gray-500"}`}
											/>
											<span className="text-xs">{name}</span>
										</div>
									))}
								</div>

								{/* Main chat */}
								<div className="flex-1 flex flex-col bg-white">
									<div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
										<div className="flex items-center gap-2">
											<span className="font-semibold text-gray-900 text-sm"># design</span>
											<span className="text-gray-400 text-xs">|</span>
											<span className="text-gray-400 text-xs">18 members</span>
										</div>
										<div className="flex gap-2">
											{["🔍", "📎", "⚙️"].map((e, i) => (
												<button
													key={i}
													className="text-gray-400 hover:text-gray-600 text-xs p-1 hover:bg-gray-100 rounded transition-colors">
													{e}
												</button>
											))}
										</div>
									</div>

									<div className="flex-1 px-4 py-3 flex flex-col gap-3 overflow-hidden">
										{[
											{
												user: "Sarah K.",
												color: "bg-purple-500",
												text: "New design system is ready for review 🎨",
												reactions: ["👍 5", "🔥 3"],
											},
											{
												user: "Alex M.",
												color: "bg-green-500",
												text: "Just checked it out, looks amazing!",
												reactions: ["❤️ 2"],
											},
											{
												user: "Mike R.",
												color: "bg-orange-500",
												text: "When can we start implementing this?",
												reactions: [],
											},
										].map((msg, i) => (
											<div key={i} className="flex gap-2.5">
												<div
													className={`w-7 h-7 rounded-xl ${msg.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
													{msg.user[0]}
												</div>
												<div className="flex-1">
													<div className="flex items-baseline gap-2 mb-1">
														<span className="text-xs font-semibold text-gray-800">{msg.user}</span>
														<span className="text-xs text-gray-400">Today 10:{40 + i} AM</span>
													</div>
													<p className="text-xs text-gray-700 leading-relaxed">{msg.text}</p>
													{msg.reactions.length > 0 && (
														<div className="flex gap-1 mt-1.5">
															{msg.reactions.map((r, ri) => (
																<span
																	key={ri}
																	className="text-xs bg-blue-50 border border-blue-100 text-blue-600 px-2 py-0.5 rounded-full cursor-pointer hover:bg-blue-100 transition-colors">
																	{r}
																</span>
															))}
														</div>
													)}
												</div>
											</div>
										))}
									</div>

									<div className="px-4 py-3 border-t border-gray-100">
										<div className="bg-gray-50 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-gray-400 border border-gray-200">
											<span className="flex-1">Message #design...</span>
											<span className="text-blue-600 cursor-pointer hover:text-blue-700">📎</span>
											<span className="text-blue-600 cursor-pointer hover:text-blue-700">😊</span>
											<button className="bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 transition-colors">
												Send
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Floating badge */}
						<div className="absolute -bottom-4 -left-4 glass-card px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-3 hover-lift">
							<div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center text-white text-xs">
								AI
							</div>
							<div>
								<p className="text-xs font-semibold text-gray-800">AI Summaries</p>
								<p className="text-xs text-gray-400">Catch up in seconds</p>
							</div>
						</div>
					</div>
				</div>

				{/* Stats row */}
				<div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-10">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
						{stats.map((stat, i) => (
							<StatCard key={i} stat={stat} index={i} />
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
