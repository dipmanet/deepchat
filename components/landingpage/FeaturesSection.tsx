"use client";
import { useEffect, useRef, useState } from "react";

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    color: "blue",
    title: "Instant Team Chats",
    description:
      "Real-time messaging with lightning-fast delivery. Organize conversations by channels, direct messages, or threads so nothing gets lost.",
    stat: "< 50ms",
    statLabel: "Message latency",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 9.67a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.54 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    color: "purple",
    title: "HD Video Calls",
    description:
      "Crystal-clear video meetings with screen sharing, virtual backgrounds, and noise cancellation for distraction-free calls.",
    stat: "1080p",
    statLabel: "HD video quality",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>
      </svg>
    ),
    color: "green",
    title: "File Sharing",
    description:
      "Share files, images, and documents instantly. Preview files right in the chat without switching apps or downloading first.",
    stat: "10GB",
    statLabel: "Per user storage",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
      </svg>
    ),
    color: "orange",
    title: "App Integrations",
    description:
      "Connect with 200+ tools including Slack, Notion, GitHub, Jira, and more. Your entire workflow in one place.",
    stat: "200+",
    statLabel: "App integrations",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    color: "red",
    title: "Enterprise Security",
    description:
      "End-to-end encryption, SSO, 2FA, and compliance tools. GDPR, HIPAA, and SOC 2 Type II certified.",
    stat: "256-bit",
    statLabel: "AES encryption",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    color: "teal",
    title: "Smart Search",
    description:
      "Find any message, file, or link instantly with our AI-powered universal search. Filter by date, person, or channel.",
    stat: "0.1s",
    statLabel: "Search response",
  },
];

const colorMap: Record<string, { bg: string; text: string; light: string; border: string }> = {
  blue: { bg: "bg-blue-600", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-100" },
  purple: { bg: "bg-purple-600", text: "text-purple-600", light: "bg-purple-50", border: "border-purple-100" },
  green: { bg: "bg-green-600", text: "text-green-600", light: "bg-green-50", border: "border-green-100" },
  orange: { bg: "bg-orange-500", text: "text-orange-500", light: "bg-orange-50", border: "border-orange-100" },
  red: { bg: "bg-red-500", text: "text-red-500", light: "bg-red-50", border: "border-red-100" },
  teal: { bg: "bg-teal-600", text: "text-teal-600", light: "bg-teal-50", border: "border-teal-100" },
};

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const colors = colorMap[feature.color];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`reveal group ${visible ? "revealed" : ""} bg-white rounded-2xl p-6 border border-gray-100 cursor-pointer transition-all duration-400 hover:border-transparent hover:shadow-2xl hover:shadow-blue-100/60 hover:-translate-y-2`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Icon */}
      <div className={`w-12 h-12 ${colors.light} ${colors.text} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 border ${colors.border}`}>
        {feature.icon}
      </div>

      <h3 className="display-heading text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors duration-300">
        {feature.title}
      </h3>
      <p className="text-gray-500 text-sm leading-relaxed mb-5">{feature.description}</p>

      {/* Stat chip */}
      <div className={`inline-flex items-center gap-2 ${colors.light} ${colors.text} px-3 py-1.5 rounded-lg border ${colors.border}`}>
        <span className="font-bold text-sm">{feature.stat}</span>
        <span className="text-xs opacity-70">{feature.statLabel}</span>
      </div>

      {/* Bottom accent line */}
      <div className={`mt-5 h-0.5 ${colors.bg} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
    </div>
  );
}

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="py-24 bg-gray-50" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className={`text-center mb-16 reveal ${visible ? "revealed" : ""}`}>
          <div className="section-tag mb-4">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Everything you need
          </div>
          <h2 className="display-heading text-4xl md:text-5xl text-gray-900 mb-4">
            Powerful features for
            <br />
            <span className="gradient-text">modern teams</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Everything your team needs to communicate, collaborate, and get work done — without the noise.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
