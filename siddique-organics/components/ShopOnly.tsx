"use client";
import { usePathname } from "next/navigation";

// Hides the public header/footer/cart on dashboard + login routes.
export default function ShopOnly({ children }: { children: React.ReactNode }) {
  const p = usePathname();
  if (p.startsWith("/admin")) return null;
  return <>{children}</>;
}
