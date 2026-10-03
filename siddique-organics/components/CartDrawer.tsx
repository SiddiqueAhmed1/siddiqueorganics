"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import {
  getCart,
  updateQuantity,
  removeFromCart,
  getCartTotals,
  CART_SYNC_EVENT,
  type CartItem,
} from "@/lib/cart";
import { useCartDrawer } from "@/components/CartDrawerContext";
import { useScrollLock } from "@/lib/useScrollLock";
import { DELIVERY_ZONES } from "@/lib/delivery";

// Delivery area is chosen at checkout, so the drawer only shows the range.
const zoneCharges = Object.values(DELIVERY_ZONES).map((z) => z.charge);
const MIN_DELIVERY = Math.min(...zoneCharges);
const MAX_DELIVERY = Math.max(...zoneCharges);

export default function CartDrawer() {
  const router = useRouter();
  const { isOpen, closeDrawer } = useCartDrawer();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [slidIn, setSlidIn] = useState(false);

  useEffect(() => {
    const sync = () => setCart(getCart());
    sync();
    window.addEventListener(CART_SYNC_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_SYNC_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useScrollLock(isOpen);

  useEffect(() => {
    // Intentional: drives the enter/exit slide transition off the
    // isOpen prop (a rAF-timed state flip, not a value derivable from
    // props/state during render), plus a DOM side effect (scroll lock).
    /* eslint-disable react-hooks/set-state-in-effect */
    if (isOpen) {
      const raf = requestAnimationFrame(() => setSlidIn(true));
      return () => cancelAnimationFrame(raf);
    }
    setSlidIn(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [isOpen]);

  if (!isOpen) return null;

  const { totalItems, totalPrice } = getCartTotals(cart);

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          slidIn ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeDrawer}
      />

      <div
        className={`relative w-full max-w-sm h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          slidIn ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#0E3A24]/10">
          <h2 className="font-bold text-[#0E3A24] text-lg flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" /> Your Cart ({totalItems})
          </h2>
          <button
            onClick={closeDrawer}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F9F8F3] transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5 text-[#0E3A24]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {cart.length === 0 ? (
            <p className="text-sm text-[#0E3A24]/50 font-semibold text-center mt-10">
              Your cart is empty.
            </p>
          ) : (
            cart.map((item) => (
              <div
                key={`${item.id}-${item.weight}`}
                className="flex items-start justify-between gap-3 border-b border-[#F9F8F3] pb-4"
              >
                {item.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.name}
                    width={56}
                    height={56}
                    loading="lazy"
                    className="w-14 h-14 rounded-lg object-cover bg-[#F9F8F3] shrink-0"
                  />
                )}
                <div className="flex-1">
                  <p className="font-normal text-[#0E3A24] text-sm">
                    {item.name}
                  </p>
                  <p className="text-xs text-[#0E3A24]/50 font-semibold mb-2">
                    {item.weight} · ৳{item.price}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.weight, item.quantity - 1)
                      }
                      className="w-7 h-7 rounded-lg border border-[#0E3A24]/20 flex items-center justify-center hover:bg-[#F9F8F3] transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-[#0E3A24]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.weight, item.quantity + 1)
                      }
                      disabled={item.quantity >= 5}
                      className="w-7 h-7 rounded-lg border border-[#0E3A24]/20 flex items-center justify-center hover:bg-[#F9F8F3] disabled:opacity-30 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between h-full gap-3">
                  <p className="font-extrabold text-[#6C4E31] text-sm whitespace-nowrap">
                    ৳{item.price * item.quantity}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id, item.weight)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-[#0E3A24]/10 px-5 py-4 space-y-3">
            <div className="flex justify-between text-base font-extrabold text-[#0E3A24]">
              <span>Subtotal</span>
              <span>৳{totalPrice}</span>
            </div>
            <div className="flex justify-between gap-3 text-xs font-semibold text-[#0E3A24]/80">
              <span>ডেলিভারি চার্জ (আপনার এলাকা অনুযায়ী)</span>
              <span className="whitespace-nowrap">
                ৳{MIN_DELIVERY} – ৳{MAX_DELIVERY}
              </span>
            </div>
            <p className="text-xs text-[#0E3A24]/80 font-semibold">
              আপনার ডেলিভারি এলাকা নির্বাচন করার পর চেকআউটে চূড়ান্ত মোট মূল্য
              দেখানো হবে।
            </p>
            <button
              onClick={() => {
                closeDrawer();
                router.push("/checkout");
              }}
              className="w-full h-12 rounded-xl bg-[#0E3A24] text-white font-extrabold text-sm hover:bg-[#3B7A42] transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
