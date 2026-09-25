import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Search, Phone, ShoppingBag, BookOpen } from "lucide-react";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-font-geist-mono",
});

export const metadata: Metadata = {
  title: "Siddique Organics | Pure & Premium Organic Food",
  description:
    "Dedicating an ecosystem to delivering safe, authenticated & reliable agro-food straight to your household.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[#F9F8F3]`}
      >
        {/* GLOBAL HEADER WITH NATURAL COMPLEMENTARY BG */}
        <header className="sticky top-0 z-50 w-full bg-[#F9F8F3] border-b border-[#0E3A24]/10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl h-16 sm:h-20 items-center justify-between gap-6 sm:gap-10">
            {/* 1. Left Viewport: Absolute Protected Mix-Blend Logo */}
            <div className="flex-shrink-0 flex items-center justify-start h-16 sm:h-20 w-[140px] sm:w-[175px] overflow-hidden">
              <Link
                href="/"
                className="flex items-center group relative w-full h-full scale-[1.7] sm:scale-[2.0] translate-x-[20px] sm:translate-x-[32px] translate-y-[-2px] mix-blend-multiply"
              >
                <Image
                  src="/siddique-organics.jpg"
                  alt="Siddique Organics"
                  width={120}
                  height={120}
                  className="object-contain object-left transition-transform group-hover:scale-105"
                  priority
                />
              </Link>
            </div>

            {/* 2. Middle Viewport: Maximized High-Width Premium Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl relative">
              <input
                type="text"
                placeholder="Search pure honey, ghee, nuts or seeds..."
                className="w-full h-11 pl-5 pr-12 rounded-full border border-[#0E3A24]/20 bg-white text-sm text-[#0E3A24] placeholder-[#0E3A24]/40 focus:outline-none focus:border-[#3B7A42] focus:ring-1 focus:ring-[#3B7A42] shadow-sm transition-all"
              />
              <button className="absolute right-4 top-3 text-[#0E3A24]/60 hover:text-[#0E3A24] transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* 3. Right Viewport: Fully Functional Fixed BG Utility Action Controllers */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              {/* Call Support CTA with Hardcoded Hex Fallbacks for Guaranteed Display */}
              <a
                href="tel:01774112721"
                className="flex items-center gap-1.5 px-4 h-10 rounded-full bg-[#0E3A24] text-white text-xs sm:text-sm font-semibold hover:bg-[#3B7A42] shadow-md transition-all duration-200"
              >
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                <span className="hidden sm:inline">01774-112721</span>
              </a>

              {/* Track Order CTA Mapping */}
              <Link
                href="/track"
                className="flex items-center justify-center gap-1 p-2 rounded-full text-[#0E3A24] hover:bg-[#0E3A24]/5 transition-colors group relative"
                title="Track Active Order"
              >
                <ShoppingBag className="w-5 h-5 sm:w-6 h-6 text-[#0E3A24]" />
                <span className="hidden lg:inline text-xs font-semibold ml-0.5">
                  Track
                </span>
              </Link>

              {/* Blog Navigation CTA Mapping */}
              <Link
                href="/blog"
                className="flex items-center justify-center gap-1 p-2 rounded-full text-[#0E3A24] hover:bg-[#0E3A24]/5 transition-colors group"
                title="Read Organic Blogs"
              >
                <BookOpen className="w-5 h-5 sm:w-6 h-6 text-[#0E3A24]" />
                <span className="hidden lg:inline text-xs font-semibold ml-0.5">
                  Blog
                </span>
              </Link>
            </div>
          </div>

          {/* Mobile Bottom Search Bar Overlay Context */}
          <div className="md:hidden pb-3 pt-1 relative w-full">
            <input
              type="text"
              placeholder="Search pure organic foods..."
              className="w-full h-10 pl-4 pr-10 rounded-full border border-[#0E3A24]/10 bg-white text-sm text-[#0E3A24] focus:outline-none focus:border-[#3B7A42] transition-all"
            />
            <Search className="absolute right-4 top-4 w-4 h-4 text-[#0E3A24]/50" />
          </div>
        </header>

        {/* MAXIMUM ALLOCATION ROUTING LAYER VIEW */}
        <main className="mx-auto max-w-7xl min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
