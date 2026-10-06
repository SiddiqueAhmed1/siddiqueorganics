import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Phone, ShoppingBag } from "lucide-react";
import "./globals.css";
import ShopOnly from "@/components/ShopOnly";
import Footer from "@/components/Footer";
import FloatingCart from "@/components/FloatingCart";
import CartDrawer from "@/components/CartDrawer";
import MobileBottomNav from "@/components/MobileBottomNav";
import HeaderCartButton from "@/components/HeaderCartButton";
import SearchBar from "@/components/SearchBar";
import { CartDrawerProvider } from "@/components/CartDrawerContext";
import { Open_Sans, Hind_Siliguri } from "next/font/google";

// 1. Configure the premium typography profiles at the top layout scope
const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  variable: "--font-hind",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Siddique Organics",
  description: "ভালো খান, সুস্থ থাকুন",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${openSans.variable} ${hindSiliguri.variable} antialiased min-h-screen bg-[#FBF9F5] font-sans`}
      >
        <CartDrawerProvider>
          {/* GLOBAL HEADER WITH NATURAL COMPLEMENTARY BG */}
          <ShopOnly>
            <header
              id="site-header"
              className="sticky top-0 z-50 w-full bg-[#FBF9F5]/90 backdrop-blur-md border-b border-[#0E3A24]/10 px-4 sm:px-6 lg:px-8"
            >
              <div className="mx-auto flex max-w-[1420px] h-16 sm:h-20 items-center justify-between gap-2 sm:gap-10">
                {/* 1. Left Viewport: Absolute Protected Mix-Blend Logo */}
                <div className="flex-shrink-0 flex items-center justify-start h-16 sm:h-20 w-[140px] min-[400px]:w-[140px] sm:w-[175px]">
                  <Link
                    href="/"
                    className="flex items-center group relative w-full h-full mix-blend-multiply"
                  >
                    <Image
                      src="/photos/siddique-organics-logo.png"
                      alt="Siddique Organics"
                      width={150}
                      height={120}
                      className="h-auto w-[140px] min-[400px]:w-[140px] sm:w-[150px] object-contain object-left"
                      priority
                    />
                  </Link>
                </div>

                {/* 2. Middle Viewport: Maximized High-Width Premium Search Bar */}
                <SearchBar
                  className="hidden md:block flex-1 max-w-xl"
                  placeholder="Search pure honey, ghee, nuts or seeds..."
                  inputClassName="w-full h-11 pl-5 pr-12 rounded-full border border-[#0E3A24]/20 bg-white text-sm text-[#0E3A24] placeholder-[#0E3A24]/40 focus:outline-none focus:border-[#3B7A42] focus:ring-1 focus:ring-[#3B7A42] shadow-sm transition-all"
                />

                {/* 3. Right Viewport: Fully Functional Fixed BG Utility Action Controllers */}
                <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0 lg:  mr-4">
                  {/* Call Support CTA with Hardcoded Hex Fallbacks */}
                  <a
                    href="tel:01774112721"
                    className="hidden md:flex items-center gap-1.5 px-2.5 sm:px-4 h-9 sm:h-10 rounded-full bg-[#0E3A24] text-white text-[11px] sm:text-sm font-semibold whitespace-nowrap hover:bg-[#3B7A42] shadow-md transition-all duration-200"
                  >
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    <span>01774-112721</span>
                  </a>

                  {/* Track Order CTA Mapping */}
                  <Link
                    href="/track"
                    className="hidden md:flex items-center justify-center gap-1 p-2 rounded-full text-[#0E3A24] hover:bg-[#0E3A24]/5 transition-colors group relative"
                    title="Track Active Order"
                  >
                    <ShoppingBag className="w-5 h-5 sm:w-6 text-[#0E3A24]" />
                    <span className="hidden lg:inline text-xs font-semibold ml-0.5">
                      Track
                    </span>
                  </Link>

                  {/* Live, functional cart button — opens the cart drawer */}
                  <HeaderCartButton />
                </div>
              </div>

              {/* Mobile Bottom Search Bar Overlay Context (Strictly bounded and safe) */}
              <div
                id="mobile-search"
                className="md:hidden mx-auto max-w-[1420px] pb-3 pt-1 w-full px-1"
              >
                <SearchBar
                  placeholder="Search pure organic foods..."
                  inputClassName="w-full h-11 pl-4 pr-10 rounded-2xl border border-transparent bg-white text-sm text-[#0E3A24] shadow-[0_2px_12px_rgba(14,58,36,0.08)] focus:outline-none focus:border-[#3B7A42] transition-all"
                />
              </div>
            </header>
          </ShopOnly>

          {/* MAXIMUM ALLOCATION ROUTING LAYER VIEW */}
          <main className="mx-auto max-w-[1500px] min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 pt-4 pb-28 md:py-6">
            {children}
          </main>

          <ShopOnly>
            <Footer />
            <FloatingCart />
            <MobileBottomNav />
            <CartDrawer />
          </ShopOnly>
        </CartDrawerProvider>
      </body>
    </html>
  );
}
