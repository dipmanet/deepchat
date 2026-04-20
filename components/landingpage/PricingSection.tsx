"use client";
import { useEffect, useRef, useState } from "react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    priceNote: "forever",
    desc: "Perfect for small teams getting started",
    color: "gray",
    features: ["10 members", "10k message history", "5 integrations", "Basic file sharing", "Community support"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$8",
    priceNote: "per user/month",
    desc: "For growing teams who need more power",
    color: "blue",
    features: ["Unlimited members", "Unlimited history", "200+ integrations", "10GB storage/user", "Priority support", "Custom channels", "Video calls"],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    priceNote: "contact us",
    desc: "For large organizations with advanced needs",
    color: "dark",
    features: ["Everything in Pro", "SSO & SAML", "Compliance exports", "Custom retention", "Dedicated support", "SLA guarantee", "On-premise option"],
    cta: "Contact Sales",
    popular: false,
  },
];

function PlanCard({ plan, index }: { plan: typeof plans[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const isBlue = plan.color === "blue";
  const isDark = plan.color === "dark";

  return (
    <div
      ref={ref}
      className={`reveal relative rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2 ${visible ? "revealed" : ""} ${
        isBlue
          ? "bg-blue-600 text-white shadow-2xl shadow-blue-300/40 scale-105"
          : isDark
          ? "bg-gray-900 text-white"
          : "bg-white border border-gray-100 text-gray-900 shadow-lg shadow-gray-100/60"
      }`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
          ✨ Most Popular
        </div>
      )}

      <div className="mb-6">
        <h3 className={`display-heading text-xl mb-1 ${isBlue || isDark ? "text-white" : "text-gray-900"}`}>
          {plan.name}
        </h3>
        <p className={`text-sm mb-4 ${isBlue ? "text-blue-100" : isDark ? "text-gray-400" : "text-gray-500"}`}>
          {plan.desc}
        </p>
        <div className="flex items-end gap-1">
          <span className={`display-heading text-4xl ${isBlue || isDark ? "text-white" : "text-gray-900"}`}>
            {plan.price}
          </span>
          {plan.priceNote && (
            <span className={`text-sm pb-1 ${isBlue ? "text-blue-200" : isDark ? "text-gray-400" : "text-gray-400"}`}>
              {plan.priceNote}
            </span>
          )}
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              isBlue ? "bg-white/20" : isDark ? "bg-gray-700" : "bg-blue-50"
            }`}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isBlue || isDark ? "white" : "#2563eb"} strokeWidth="3">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <span className={`text-sm ${isBlue ? "text-blue-50" : isDark ? "text-gray-300" : "text-gray-600"}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <a
        href="#"
        className={`w-full text-center block py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 ${
          isBlue
            ? "bg-white text-blue-600 hover:bg-blue-50 hover:shadow-lg"
            : isDark
            ? "bg-blue-600 text-white hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30"
            : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-300/40"
        }`}
      >
        {plan.cta} →
      </a>
    </div>
  );
}

export default function PricingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [annual, setAnnual] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="pricing" className="py-24 bg-gray-50" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className={`text-center mb-16 reveal ${visible ? "revealed" : ""}`}>
          <div className="section-tag mb-4">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/></svg>
            Simple pricing
          </div>
          <h2 className="display-heading text-4xl md:text-5xl text-gray-900 mb-4">
            Perfect solution for
            <br />
            <span className="gradient-text">small businesses</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            No hidden fees, no surprises. Start free and scale as you grow.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 bg-white rounded-xl p-1.5 border border-gray-200 shadow-sm">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${!annual ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${annual ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Annual
              <span className={`text-xs px-1.5 py-0.5 rounded-full transition-all duration-200 ${annual ? "bg-white/20 text-white" : "bg-green-100 text-green-600"}`}>
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <PlanCard key={i} plan={plan} index={i} />
          ))}
        </div>

        {/* Trust section below */}
        <div className={`mt-16 text-center reveal ${visible ? "revealed" : ""}`} style={{ transitionDelay: "400ms" }}>
          <p className="text-gray-400 text-sm mb-6">Trusted by 10,000+ businesses worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-40">
            {["Acme Corp", "TechCo", "Buildify", "Streamline", "Nexus", "Crafted"].map((brand, i) => (
              <div key={i} className="text-gray-700 font-bold text-lg tracking-tight" style={{ fontFamily: "Syne, sans-serif" }}>
                {brand}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
