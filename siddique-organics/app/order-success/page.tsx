"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import type { OrderConfirmation } from "@/actions/order.actions";

export default function OrderSuccessPage() {
  const router = useRouter();
  const [order, setOrder] = useState<OrderConfirmation | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("siddique_last_order");
    if (raw) {
      try {
        // Reading sessionStorage must happen after mount, so this
        // intentionally syncs state from an effect (see checkout page).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOrder(JSON.parse(raw));
      } catch {
        setOrder(null);
      }
      // One-time view — refreshing this page intentionally won't show
      // stale order data again.
      sessionStorage.removeItem("siddique_last_order");
    }
    setChecked(true);
  }, []);

  if (checked && !order) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-[#0E3A24] font-bold text-lg">
          No recent order found.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 rounded-xl bg-[#0E3A24] text-white font-bold"
        >
          Go to Home
        </button>
      </main>
    );
  }

  if (!order) return null;

  return (
    <main className="min-h-screen bg-[#FBF9F5] px-4 sm:px-6 py-10 sm:py-16 flex justify-center">
      <div className="max-w-lg w-full">
        <div className="flex flex-col items-center text-center mb-8">
          <CheckCircle2 className="w-16 h-16 text-[#3B7A42] mb-3" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0E3A24]">
            Thank You for Your Order!
          </h1>
          <p className="text-sm text-[#0E3A24]/60 font-semibold mt-1">
            Order ID: {order.id}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#0E3A24]/5 p-5 sm:p-7 space-y-5">
          <div>
            <h2 className="font-extrabold text-[#0E3A24] text-sm mb-3">
              Order Items
            </h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <div>
                    <p className="font-bold text-[#0E3A24]">
                      {item.productName}
                    </p>
                    <p className="text-xs text-[#0E3A24]/50 font-semibold">
                      {item.weight} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-extrabold text-[#6C4E31]">
                    ৳{item.subtotal}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#0E3A24]/10 pt-4 space-y-1.5 text-sm font-semibold text-[#0E3A24]/70">
            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span>৳{order.deliveryCharge}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-[#0E3A24]">
              <span>Total (Cash on Delivery)</span>
              <span>৳{order.totalAmount}</span>
            </div>
          </div>

          <div className="border-t border-[#0E3A24]/10 pt-4 text-sm">
            <p className="font-extrabold text-[#0E3A24] mb-1">Delivery To</p>
            <p className="text-[#0E3A24]/70 font-semibold">
              {order.customerName} · {order.phone}
            </p>
            <p className="text-[#0E3A24]/70 font-semibold">{order.address}</p>
          </div>

          <div className="border-t border-[#0E3A24]/10 pt-4 flex justify-center">
            <span className="px-4 py-1.5 rounded-full bg-[#F9F8F3] text-[#0E3A24] text-xs font-extrabold border border-[#0E3A24]/10">
              Status: {order.status}
            </span>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => router.push("/track")}
            className="flex-1 h-12 rounded-xl border border-[#0E3A24] text-[#0E3A24] font-extrabold text-sm hover:bg-[#0E3A24] hover:text-white transition-colors"
          >
            Track This Order
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex-1 h-12 rounded-xl bg-[#0E3A24] text-white font-extrabold text-sm hover:bg-[#3B7A42] transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </main>
  );
}
