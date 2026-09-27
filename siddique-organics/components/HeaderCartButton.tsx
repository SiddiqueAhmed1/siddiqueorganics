"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { getCart, getCartTotals, CART_SYNC_EVENT } from "@/lib/cart";
import { useCartDrawer } from "@/components/CartDrawerContext";

export default function HeaderCartButton() {
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

  return (
    <button
      onClick={openDrawer}
      className="flex items-center justify-center p-2 rounded-full text-[#0E3A24] hover:bg-[#0E3A24]/5 transition-colors group relative"
      title="View Cart"
    >
      <div className="relative">
        <ShoppingCart className="w-5 h-5 sm:w-6 h-6 text-[#0E3A24]" />
        <span className="absolute -top-1.5 -right-1.5 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-[#3B7A42] text-white flex items-center justify-center text-[9px] sm:text-[10px] font-extrabold shadow-sm ring-2 ring-white">
          {totalItems}
        </span>
      </div>
      <span className="hidden lg:inline text-xs font-semibold ml-1.5">
        Cart
      </span>
    </button>
  );
}
