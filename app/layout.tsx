import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FathomAnalytics } from "@/components/analytics/fathom-analytics";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Free File Navigator - Find Free Tax Filing Options",
  description: "Find truly free tax filing options. Compare IRS Free File partners and get matched with the best option for your situation.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <FathomAnalytics />
        {children}
      </body>
    </html>
  );
}
