import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full  pt-12 pb-8 mt-16 px-4 sm:px-6 lg:px-8 border-t-4 border-[#3B7A42]">
      <div className="mx-auto max-w-[1500px]">
        {/* Core Informational Matrix Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
          {/* Brand Signature Column */}
          <div className="space-y-4">
            <Image
              width={200}
              height={200}
              className="mix-blend-multiply"
              src="/photos/header-logo.jpg"
              alt="footer logo"
            />

            <p className="text-xs sm:text-sm leading-relaxed max-w-xs mx-auto md:mx-0 text-white/70 font-medium">
              Delivering unadulterated, farm-fresh organic food metrics straight
              across all domestic divisions inside Bangladesh. Live a healthy
              life with pure food.
            </p>
          </div>

          {/* Operational Corporate Policies Mapping */}
          <div className="space-y-3">
            <h4 className="font-bold  text-xs sm:text-sm tracking-wider uppercase text-[#3B7A42]">
              Quick Policies
            </h4>
            <ul className="text-xs sm:text-sm font-semibold space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white hover:underline transition-all"
                >
                  Terms of Operations
                </Link>
              </li>
              <li>
                <Link
                  href="/refunds"
                  className="hover:text-white hover:underline transition-all"
                >
                  Return & Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Secure Contact Communication Channels */}
          <div className="space-y-3">
            <h4 className="font-bold  text-xs sm:text-sm tracking-wider uppercase text-[#3B7A42]">
              Contact Channels
            </h4>
            <div className="space-y-1.5 text-xs sm:text-sm font-medium">
              <p className="text-white/70">
                Email: support@siddiqueorganics.com
              </p>
              <p className="font-extrabold  text-sm sm:text-base tracking-wide">
                Hotline:{" "}
                <a href="tel:+8801700000000" className="hover:underline ">
                  +880 1700-000000
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Global Structural Copyright Strip */}
        <div className="w-full text-center border-t border-white/10 mt-10 pt-6 text-[11px] sm:text-xs text-white/40 font-medium tracking-wide">
          © {new Date().getFullYear()} Siddique Organics Ltd. All corporate
          rights reserved.
        </div>
      </div>
    </footer>
  );
}
