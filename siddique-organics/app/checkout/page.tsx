"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import {
  getCart,
  updateQuantity,
  removeFromCart,
  removeAllByProductId,
  clearExpressCheckoutItem,
  CART_SYNC_EVENT,
  MAX_QTY_PER_ITEM,
  type CartItem,
} from "@/lib/cart";
import { submitCustomerOrder } from "@/actions/order.actions";
import {
  DELIVERY_ZONES,
  DEFAULT_ZONE,
  type DeliveryZone,
} from "@/lib/delivery";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zone, setZone] = useState<DeliveryZone>(DEFAULT_ZONE);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Reading storage must happen after mount (it doesn't exist on the
    // server), so this intentionally syncs state from an effect to
    // avoid a server/client hydration mismatch.
    /* eslint-disable react-hooks/set-state-in-effect */
    // Drop any leftover single-item "express" entry from older builds so
    // it can never hijack checkout again. Checkout ALWAYS shows the cart.
    clearExpressCheckoutItem();
    const sync = () => setCart(getCart());
    sync();
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    // Stay live when quantities change (here, in the drawer, other tabs).
    window.addEventListener(CART_SYNC_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_SYNC_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Display only — the server recalculates the real charge from the zone key.
  const deliveryCharge = DELIVERY_ZONES[zone].charge;
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = cart.length > 0 ? subtotal + deliveryCharge : 0;

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
    formData.set("deliveryZone", zone);
    formData.set(
      "cartItems",
      JSON.stringify(
        cart.map((c) => ({ id: c.id, weight: c.weight, quantity: c.quantity })),
      ),
    );

    startTransition(async () => {
      const result = await submitCustomerOrder(null, formData);

      if (!result.success) {
        // Auto-recover: if the server told us exactly which line is
        // invalid (deleted/out of stock), remove just that line instead
        // of leaving the customer stuck.
        if (result.invalidItemId) {
          removeAllByProductId(result.invalidItemId);
          setCart(getCart());
        }
        setError(result.message);
        return;
      }

      // Save the server-confirmed order (authoritative prices/items) for
      // the success page to read once.
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
    <main className="min-h-screen bg-[#FBF9F5] px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        {/* Delivery Info Form */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#0E3A24]/5 p-5 sm:p-7 order-2 lg:order-1">
          <h2 className="text-lg sm:text-xl font-bold text-[#0E3A24] mb-5">
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
                placeholder="e.g. Abdullah Masud"
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

            {/* Delivery Area — selecting a card updates the total instantly */}
            <div>
              <label
                id="delivery-area-label"
                className="block text-sm font-bold text-[#0E3A24]/70 mb-2"
              >
                Delivery Area
              </label>
              <div
                role="radiogroup"
                aria-labelledby="delivery-area-label"
                className="grid grid-cols-1 gap-3"
              >
                {(Object.keys(DELIVERY_ZONES) as DeliveryZone[]).map((key) => {
                  const selected = zone === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setZone(key)}
                      className={`rounded-xl border-2 p-3 text-left transition-colors ${
                        selected
                          ? "border-[#3B7A42] bg-[#3B7A42]/5"
                          : "border-[#0E3A24]/15 hover:border-[#0E3A24]/30"
                      }`}
                    >
                      <p className="text-sm font-bold text-[#0E3A24] leading-tight">
                        {DELIVERY_ZONES[key].label}
                      </p>
                      <p className="text-sm font-extrabold text-[#6C4E31] mt-1">
                        ৳{DELIVERY_ZONES[key].charge}
                      </p>
                    </button>
                  );
                })}
              </div>
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

        {/* Order Summary — every cart line with image, price and +/- controls */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#0E3A24]/5 p-5 sm:p-7 order-1 lg:order-2 h-fit">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg sm:text-xl font-bold text-[#0E3A24]">
              Order Summary
            </h2>
            <span className="text-xs font-bold text-[#0E3A24]/50">
              {cart.reduce((n, i) => n + i.quantity, 0)} items
            </span>
          </div>

          <div className="space-y-3 max-h-[26rem] overflow-y-auto overscroll-contain pr-1">
            {cart.map((item) => (
              <div
                key={`${item.id}-${item.weight}`}
                className="flex items-center gap-3 border-b border-[#F9F8F3] pb-3"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl bg-[#F9F8F3] overflow-hidden flex items-center justify-center">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ShoppingBag className="w-6 h-6 text-[#0E3A24]/30" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-normal text-[#0E3A24] text-sm line-clamp-2 leading-tight">
                    {item.name}
                  </p>
                  <p className="text-xs text-[#0E3A24]/50 font-semibold mt-0.5">
                    {item.weight} · ৳{item.price} each
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
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
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.weight, item.quantity + 1)
                      }
                      disabled={item.quantity >= MAX_QTY_PER_ITEM}
                      className="w-7 h-7 rounded-lg border border-[#0E3A24]/20 flex items-center justify-center hover:bg-[#F9F8F3] disabled:opacity-30 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between self-stretch gap-2">
                  <p className="font-extrabold text-[#6C4E31] text-sm whitespace-nowrap">
                    ৳{item.price * item.quantity}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id, item.weight)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2 border-t border-[#0E3A24]/10 pt-4">
            <div className="flex justify-between text-sm font-semibold text-[#0E3A24]/70">
              <span>Subtotal</span>
              <span>৳{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-[#0E3A24]/70">
              <span>Delivery Charge ({DELIVERY_ZONES[zone].label})</span>
              <span>৳{deliveryCharge}</span>
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
