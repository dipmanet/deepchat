"use client";
import { useEffect, useRef, useState } from "react";

const testimonials = [
	{
		name: "Sarah Johnson",
		role: "Head of Design",
		company: "Pixel Studio",
		avatar: "SJ",
		color: "bg-purple-500",
		quote:
			"DeepChat completely transformed how our design team collaborates. The threaded conversations keep feedback organized, and the integrations with our design tools are seamless.",
		stars: 5,
		tag: "Design Teams",
	},
	{
		name: "Marcus Chen",
		role: "CTO",
		company: "LaunchPad",
		avatar: "MC",
		color: "bg-blue-500",
		quote:
			"We switched from Slack and immediately noticed the difference. The UI is cleaner, search is faster, and the pricing actually makes sense for our 60-person team.",
		stars: 5,
		tag: "Engineering",
	},
	{
		name: "Priya Patel",
		role: "VP of Operations",
		company: "GrowthCo",
		avatar: "PP",
		color: "bg-green-500",
		quote:
			"As an ops leader, I love that DeepChat gives me visibility across all teams without being intrusive. The analytics dashboard is genuinely useful.",
		stars: 5,
		tag: "Operations",
	},
	{
		name: "James Okafor",
		role: "Founder",
		company: "Buildify",
		avatar: "JO",
		color: "bg-orange-500",
		quote:
			"Started using it with a 3-person team, now we're 45 people and it scales perfectly. The free tier gave us enough to get hooked before we needed to upgrade.",
		stars: 5,
		tag: "Startups",
	},
	{
		name: "Emma Walsh",
		role: "HR Director",
		company: "PeopleFirst",
		avatar: "EW",
		color: "bg-pink-500",
		quote:
			"Onboarding new employees is so much smoother now. We can set up dedicated channels per team, share resources, and they're up to speed within hours.",
		stars: 5,
		tag: "HR Teams",
	},
	{
		name: "David Torres",
		role: "Product Manager",
		company: "ShipFast",
		avatar: "DT",
		color: "bg-teal-500",
		quote:
			"The ability to integrate with Jira, GitHub, and Figma in one place means my team stops context-switching. It's the command center for everything we ship.",
		stars: 5,
		tag: "Product",
	},
];

function TestimonialCard({
	t,
	index,
	visible,
}: {
	t: (typeof testimonials)[0];
	index: number;
	visible: boolean;
}) {
	return (
		<div
			className={`reveal bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-50 hover:-translate-y-1 transition-all duration-400 ${visible ? "revealed" : ""}`}
			style={{ transitionDelay: `${index * 80}ms` }}>
			{/* Stars */}
			<div className="flex gap-1 mb-4">
				{[...Array(t.stars)].map((_, i) => (
					<svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24">
						<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
					</svg>
				))}
			</div>

			{/* Quote */}
			<p className="text-gray-600 text-sm leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>

			{/* Footer */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div
						className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
						{t.avatar}
					</div>
					<div>
						<p className="text-gray-900 text-sm font-semibold">{t.name}</p>
						<p className="text-gray-400 text-xs">
							{t.role} · {t.company}
						</p>
					</div>
				</div>
				<span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full font-medium">
					{t.tag}
				</span>
			</div>
		</div>
	);
}

export default function TestimonialsSection() {
	const sectionRef = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) setVisible(true);
			},
			{ threshold: 0.05 },
		);
		if (sectionRef.current) observer.observe(sectionRef.current);
		return () => observer.disconnect();
	}, []);

	return (
		<section className="py-24 bg-white" ref={sectionRef}>
			<div className="max-w-7xl mx-auto px-6">
				{/* Header */}
				<div className={`text-center mb-16 reveal ${visible ? "revealed" : ""}`}>
					<div className="section-tag mb-4">
						<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
							<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
							<circle cx="9" cy="7" r="4" />
							<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
							<path d="M16 3.13a4 4 0 0 1 0 7.75" />
						</svg>
						Loved by teams
					</div>
					<h2 className="display-heading text-4xl md:text-5xl text-gray-900 mb-4">
						Don&apos;t just take our word
						<br />
						<span className="gradient-text">for it</span>
					</h2>
					<p className="text-gray-500 text-lg max-w-xl mx-auto">
						Over 10,000 teams trust DeepChat to keep their communication clear and their work
						moving.
					</p>
				</div>

				{/* Testimonials Grid */}
				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{testimonials.map((t, i) => (
						<TestimonialCard key={i} t={t} index={i} visible={visible} />
					))}
				</div>

				{/* Average rating */}
				<div
					className={`mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 reveal ${visible ? "revealed" : ""}`}
					style={{ transitionDelay: "500ms" }}>
					<div className="flex items-center gap-3">
						<div className="flex gap-1">
							{[...Array(5)].map((_, i) => (
								<svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#FBBF24">
									<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
								</svg>
							))}
						</div>
						<span className="display-heading text-3xl text-gray-900">4.9</span>
						<span className="text-gray-400 text-sm">/ 5.0</span>
					</div>
					<div className="hidden sm:block w-px h-10 bg-gray-200" />
					<div className="text-center sm:text-left">
						<p className="font-semibold text-gray-900 text-sm">Based on 2,400+ reviews</p>
						<p className="text-gray-400 text-xs">from G2, Capterra, and ProductHunt</p>
					</div>
				</div>
			</div>
		</section>
	);
}
