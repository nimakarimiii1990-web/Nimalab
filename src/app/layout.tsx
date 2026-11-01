import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { PwaRegister } from "@/components/nima/pwa-register";

export const metadata: Metadata = {
  title: "Nima | Laboratory Companion",
  description:
    "Nima — complete laboratory reference and quality toolkit: all lab tests, formulas with calculators, quality control, result integrity, 2024+ articles, news and events. Runs on web, desktop and Android.",
  keywords: ["Nima", "laboratory", "lab tests", "clinical chemistry", "quality control", "Westgard", "reference intervals"],
  authors: [{ name: "Nima Lab App" }],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b5cad",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground min-h-screen flex flex-col">
        {children}
        <Toaster />
        <PwaRegister />
      </body>
    </html>
  );
}
