"use client";
import HeroSection from "@/components/landingpage/HeroSection";
import PricingSection from "@/components/landingpage/PricingSection";
import ShowcaseSection from "@/components/landingpage/ShowcaseSection";
import TestimonialsSection from "@/components/landingpage/TestimonialsSection";
import FeaturesSection from "@/components/landingpage/FeaturesSection";
import CTAAndFooter from "@/components/landingpage/CTAAndFooter";
import Navbar from "@/components/landingpage/Navbar";
import "./page.css";

export default function Home() {
	return (
		<>
			<main className="min-h-screen">
				<Navbar />
				<HeroSection />
				<FeaturesSection />
				<ShowcaseSection />
				<PricingSection />
				<TestimonialsSection />
				<CTAAndFooter />
			</main>
		</>
	);
}
