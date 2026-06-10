import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "./providers";
import { SiteNav } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { BackgroundPaths } from "@/components/BackgroundPaths";

// Geist for headings and body — the TrustGate brand pairing. GeistMono backs
// the font-mono utility.
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrustGate — Sui",
  description:
    "On-chain behavioral trust scoring and capability-gated trading on Sui testnet.",
  icons: {
    icon: [
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-48.png", type: "image/png", sizes: "48x48" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-60"
          >
            <BackgroundPaths />
          </div>
          <div className="relative z-10">
            <SiteNav />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
