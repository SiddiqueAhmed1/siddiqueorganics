import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import FooterCartLink from "@/components/FooterCartLink";
import { SITE } from "@/lib/site";

const linkClass =
  "text-sm text-white/70 hover:text-white hover:translate-x-0.5 inline-block transition-all";

const QUICK_LINKS = [
  { label: "All Products", href: "/products" },
  { label: "FAQ", href: "/faq" },
  // "Cart" is rendered separately (opens the cart drawer)
  { label: "Blog", href: "/blog" },
];

const USEFUL_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Return & Refund", href: "/refunds" },
];

const socialBtn =
  "w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-[#3B7A42] hover:border-[#3B7A42] transition-colors";

function SocialIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="w-full mt-16 bg-[#0E3A24] text-white border-t-4 border-[#3B7A42]">
      <div className="mx-auto max-w-[1420px] px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.4fr] gap-10">
          {/* 1. Logo + about + social */}
          <div className="space-y-5">
            <Link
              href="/"
              className="inline-block bg-white rounded-xl px-3 py-2"
            >
              <Image
                width={150}
                height={120}
                className="h-auto w-[130px]"
                src="/photos/header-logo.webp"
                alt={SITE.name}
              />
            </Link>

            <p className="text-sm leading-relaxed max-w-xs text-white/70">
              Delivering unadulterated, farm-fresh organic food straight across
              Bangladesh. Live a healthy life with pure food.
            </p>

            <div className="flex items-center gap-3">
              <a
                href={SITE.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className={socialBtn}
              >
                <SocialIcon>
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </SocialIcon>
              </a>
              <a
                href={SITE.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className={socialBtn}
              >
                <SocialIcon>
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                  <path d="m10 15 5-3-5-3z" />
                </SocialIcon>
              </a>
              <a
                href={SITE.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={socialBtn}
              >
                <SocialIcon>
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </SocialIcon>
              </a>
            </div>
          </div>

          {/* 2. Quick links */}
          <div>
            <h4 className="font-bold text-base mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href={QUICK_LINKS[0].href} className={linkClass}>
                  {QUICK_LINKS[0].label}
                </Link>
              </li>
              <li>
                <Link href={QUICK_LINKS[1].href} className={linkClass}>
                  {QUICK_LINKS[1].label}
                </Link>
              </li>
              <li>
                <FooterCartLink className={linkClass} />
              </li>
              <li>
                <Link href={QUICK_LINKS[2].href} className={linkClass}>
                  {QUICK_LINKS[2].label}
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Useful links */}
          <div>
            <h4 className="font-bold text-base mb-4">Useful Links</h4>
            <ul className="space-y-3">
              {USEFUL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Contact */}
          <div>
            <h4 className="font-bold text-base mb-4">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 shrink-0 text-[#F9F8F3]" />
                <a
                  href={SITE.phoneHref}
                  className="font-bold text-white hover:underline"
                >
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li className="flex items-start gap-3 text-white/70">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#F9F8F3]" />
                <span>{SITE.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 shrink-0 text-[#F9F8F3]" />
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-white/70 hover:text-white break-all"
                >
                  {SITE.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer bottom */}
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/70 px-4">
        © {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </div>
    </footer>
  );
}
