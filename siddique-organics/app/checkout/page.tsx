"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getCart, type CartItem } from "@/lib/cart";
import { submitCustomerOrder } from "@/actions/order.actions";

const DELIVERY_CHARGE = 100;

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Reading localStorage must happen after mount (it doesn't exist on
    // the server), so this intentionally syncs state from an effect to
    // avoid a server/client hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCart(getCart());
    setHydrated(true);
  }, []);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = cart.length > 0 ? subtotal + DELIVERY_CHARGE : 0;

  const handlePlaceOrder = () => {
    setError(null);

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setError("Please fill in all delivery details.");
      return;
    }

    const formData = new FormData();
    formData.set("customerName", customerName);
    formData.set("phone", phone);
    formData.set("address", address);
    formData.set(
      "cartItems",
      JSON.stringify(
        cart.map((c) => ({ id: c.id, weight: c.weight, quantity: c.quantity })),
      ),
    );

    startTransition(async () => {
      const result = await submitCustomerOrder(null, formData);

      if (!result.success) {
        setError(result.message);
        return;
      }

      // Save the server-confirmed order (authoritative prices/items) for
      // the success page to read once, then clear the cart everywhere.
      sessionStorage.setItem(
        "siddique_last_order",
        JSON.stringify(result.data),
      );
      localStorage.removeItem("siddique_cart");
      window.dispatchEvent(new Event("siddique_cart_sync"));

      router.push("/order-success");
    });
  };

  if (hydrated && cart.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-[#0E3A24] font-bold text-lg">Your cart is empty.</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 rounded-xl bg-[#0E3A24] text-white font-bold"
        >
          Continue Shopping
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9F8F3] px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        {/* Delivery Info Form */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#0E3A24]/5 p-5 sm:p-7 order-2 lg:order-1">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#0E3A24] mb-5">
            Delivery Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#0E3A24]/70 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Siddique Ahmed"
                className="w-full h-11 rounded-xl border border-[#0E3A24]/15 px-3 text-sm focus:outline-none focus:border-[#3B7A42]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0E3A24]/70 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full h-11 rounded-xl border border-[#0E3A24]/15 px-3 text-sm focus:outline-none focus:border-[#3B7A42]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0E3A24]/70 mb-1">
                Full Delivery Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={4}
                placeholder="House, Road, Area, City"
                className="w-full rounded-xl border border-[#0E3A24]/15 px-3 py-2 text-sm focus:outline-none focus:border-[#3B7A42] resize-none"
              />
            </div>

            <div className="rounded-xl bg-[#F9F8F3] border border-[#0E3A24]/10 px-4 py-3 text-sm text-[#0E3A24]/70 font-semibold">
              Payment Method: Cash on Delivery
            </div>

            {error && (
              <p className="text-red-600 text-sm font-semibold">{error}</p>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={isPending}
              className="w-full h-12 rounded-xl bg-[#0E3A24] text-white font-extrabold text-sm sm:text-base hover:bg-[#3B7A42] transition-colors disabled:opacity-60"
            >
              {isPending ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </section>

        {/* Order Summary (read-only) */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#0E3A24]/5 p-5 sm:p-7 order-1 lg:order-2 h-fit">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#0E3A24] mb-5">
            Order Summary
          </h2>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div
                key={`${item.id}-${item.weight}`}
                className="flex items-center justify-between gap-3 border-b border-[#F9F8F3] pb-3"
              >
                <div>
                  <p className="font-bold text-[#0E3A24] text-sm">
                    {item.name}
                  </p>
                  <p className="text-xs text-[#0E3A24]/50 font-semibold">
                    {item.weight} × {item.quantity}
                  </p>
                </div>
                <p className="font-extrabold text-[#6C4E31] text-sm whitespace-nowrap">
                  ৳{item.price * item.quantity}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2 border-t border-[#0E3A24]/10 pt-4">
            <div className="flex justify-between text-sm font-semibold text-[#0E3A24]/70">
              <span>Subtotal</span>
              <span>৳{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-[#0E3A24]/70">
              <span>Delivery Charge</span>
              <span>৳{DELIVERY_CHARGE}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-[#0E3A24] pt-2 border-t border-[#0E3A24]/10">
              <span>Total</span>
              <span>৳{total}</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
