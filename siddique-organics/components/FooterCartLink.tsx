"use client";

import { useCartDrawer } from "@/components/CartDrawerContext";

// The cart on this site is a drawer, not a page, so the footer's
// "Cart" link opens the drawer instead of navigating.
export default function FooterCartLink({ className }: { className?: string }) {
  const { openDrawer } = useCartDrawer();
  return (
    <button type="button" onClick={openDrawer} className={className}>
      Cart
    </button>
  );
}
