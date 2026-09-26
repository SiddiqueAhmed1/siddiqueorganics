"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  name: string;
  price: number;
  weight: string;
  quantity: number;
}

export default function FloatingCart() {
  const router = useRouter();
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    const calculateCartTotals = () => {
      try {
        const storedCart = localStorage.getItem("siddique_cart");
        if (storedCart) {
          const items: CartItem[] = JSON.parse(storedCart);
          const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
          const priceCount = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          );

          setTotalItems(itemCount);
          setTotalPrice(priceCount);
        } else {
          setTotalItems(0);
          setTotalPrice(0);
        }
      } catch (error) {
        console.error("Failed to parse cart storage updates:", error);
      }
    };

    // Initialize display bounds instantly upon hydration profiles
    calculateCartTotals();

    const handleCartSyncEvent = () => {
      calculateCartTotals();
      setIsUpdating(true);
      setTimeout(() => setIsUpdating(false), 300); // Gentle feedback scale pulse duration
    };

    window.addEventListener("siddique_cart_sync", handleCartSyncEvent);
    window.addEventListener("storage", calculateCartTotals);

    return () => {
      window.removeEventListener("siddique_cart_sync", handleCartSyncEvent);
      window.removeEventListener("storage", calculateCartTotals);
    };
  }, []);

  // Gracefully hide the floating side-bar widget if no items exist inside cart memory
  if (totalItems === 0) return null;

  return (
    <button
      onClick={() => router.push("/checkout")}
      className={`fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center justify-between w-16 sm:w-20 bg-[#0E3A24] text-white shadow-2xl border-l border-y border-[#3B7A42]/30 rounded-l-2xl overflow-hidden transition-all duration-300 transform active:scale-95 group ${
        isUpdating ? "scale-105 bg-[#3B7A42]" : ""
      }`}
    >
      {/* Top Segment: Bag Icon & Item Counter Text Layout */}
      <div className="w-full flex flex-col items-center justify-center pt-3 pb-2 px-1 gap-1 text-center">
        <ShoppingBag className="w-5 h-5 sm:w-6 h-6 text-white group-hover:animate-bounce" />
        <span className="text-[10px] sm:text-xs font-black tracking-tight leading-none mt-0.5 text-white">
          {totalItems} Items
        </span>
      </div>

      {/* Bottom Segment: Dynamic Total Price Badge Indicator Display Block */}
      <div className="w-full bg-[#6C4E31] text-white text-[11px] sm:text-xs font-black py-2 px-1 text-center border-t border-white/10 group-hover:bg-[#3B7A42] transition-colors duration-200">
        ৳{totalPrice}
      </div>
    </button>
  );
}
