"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Phone, Search, ShoppingCart, Truck } from "lucide-react";
import { getCart, getCartTotals, CART_SYNC_EVENT } from "@/lib/cart";
import { useCartDrawer } from "@/components/CartDrawerContext";
import { SITE } from "@/lib/site";

// Routes where the bar is NOT shown (single product page has its own
// sticky Add to Cart / Buy Now bar, checkout has a form).
const HIDDEN_PREFIXES = ["/products/", "/checkout"];

export default function MobileBottomNav() {
  const pathname = usePathname() ?? "/";
  const { openDrawer } = useCartDrawer();
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const sync = () => setTotalItems(getCartTotals(getCart()).totalItems);
    sync();
    window.addEventListener(CART_SYNC_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_SYNC_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  const focusSearch = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      document
        .querySelector<HTMLInputElement>("#mobile-search input")
        ?.focus();
    }, 250);
  };

  const base =
    "relative flex h-12 w-12 items-center justify-center rounded-2xl transition-colors active:scale-90";
  const idle = "text-[#0E3A24]/60 hover:bg-[#0E3A24]/5";
  const active = "bg-[#0E3A24] text-white shadow-md";

  return (
    <nav
      aria-label="Quick navigation"
      className="md:hidden fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto flex max-w-sm items-center justify-between rounded-3xl border border-[#0E3A24]/5 bg-white px-3 py-2 shadow-[0_10px_34px_rgba(14,58,36,0.2)]">
        <Link
          href="/track"
          aria-label="Track order"
          className={`${base} ${pathname.startsWith("/track") ? active : idle}`}
        >
          <Truck className="h-5 w-5" />
        </Link>

        <button
          type="button"
          onClick={openDrawer}
          aria-label="Open cart"
          data-cart-target
          className={`${base} ${idle}`}
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#3B7A42] px-1 text-[9px] font-extrabold text-white ring-2 ring-white">
              {totalItems}
            </span>
          )}
        </button>

        <Link
          href="/"
          aria-label="Home"
          className={`${base} ${pathname === "/" ? active : idle}`}
        >
          <House className="h-5 w-5" />
        </Link>

        <a href={SITE.phoneHref} aria-label="Call us" className={`${base} ${idle}`}>
          <Phone className="h-5 w-5" />
        </a>

        <button
          type="button"
          onClick={focusSearch}
          aria-label="Search products"
          className={`${base} ${idle}`}
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
}
