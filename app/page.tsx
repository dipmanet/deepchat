"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
// import Image from "next/image";
// import Logo from "@/public/deepchat_logo.svg";
// import { AuthLoading } from "convex/react";
// import { LucideLoaderPinwheel } from "lucide-react";
import HeroSection from "@/components/landingpage/HeroSection";
import PricingSection from "@/components/landingpage/PricingSection";
import ShowcaseSection from "@/components/landingpage/ShowcaseSection";
import TestimonialsSection from "@/components/landingpage/TestimonialsSection";
import FeaturesSection from "@/components/landingpage/FeaturesSection";
import CTAAndFooter from "@/components/landingpage/CTAAndFooter";
import Navbar from "@/components/landingpage/Navbar";
import "./page.css";

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
