import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { ConvexClientProvider } from "../components/ConvexClientProvider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "DeepChat",
	description: "A real-time chat application built with Next.js, Convex, and Tailwind CSS.",
	icons: [
		{
			rel: "icon",
			url: "/deepchat_logo.svg",
			type: "image/x-icon",
			sizes: "any",
			// The "any" size allows the browser to choose the best size for the device.
		},
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={cn("font-sans", inter.variable)} suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem
					disableTransitionOnChange>
					<TooltipProvider>
						<ConvexClientProvider>
							{children}
							<Toaster richColors />
						</ConvexClientProvider>
					</TooltipProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
