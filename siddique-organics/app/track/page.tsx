"use client";

import { useState, useTransition } from "react";
import { PackageSearch } from "lucide-react";
import { trackOrderByPhone } from "@/actions/order.actions";

interface TrackedOrderItem {
  weight: string;
  quantity: number;
  product: { name: string };
}

interface TrackedOrder {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: TrackedOrderItem[];
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function TrackOrderPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<TrackedOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleTrack = () => {
    setError(null);
    setOrders(null);

    const formData = new FormData();
    formData.set("phone", phone);

    startTransition(async () => {
      const result = await trackOrderByPhone(null, formData);
      if (!result.success) {
        setError(result.message);
        return;
      }
      setOrders(result.data as TrackedOrder[]);
    });
  };

  return (
    <main className="min-h-screen bg-[#F9F8F3] px-4 sm:px-6 py-10 sm:py-16 flex justify-center">
      <div className="max-w-lg w-full">
        <div className="flex flex-col items-center text-center mb-8">
          <PackageSearch className="w-12 h-12 text-[#0E3A24] mb-3" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0E3A24]">
            Track Your Order
          </h1>
          <p className="text-sm text-[#0E3A24]/60 font-semibold mt-1">
            Enter the phone number you used at checkout.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#0E3A24]/5 p-5 sm:p-6 flex flex-col sm:flex-row gap-2">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01XXXXXXXXX"
            className="flex-1 h-11 rounded-xl border border-[#0E3A24]/15 px-3 text-sm focus:outline-none focus:border-[#3B7A42]"
          />
          <button
            onClick={handleTrack}
            disabled={isPending || !phone.trim()}
            className="h-11 px-5 rounded-xl bg-[#0E3A24] text-white font-extrabold text-sm hover:bg-[#3B7A42] transition-colors disabled:opacity-60 whitespace-nowrap"
          >
            {isPending ? "Searching..." : "Track"}
          </button>
        </div>

        {error && (
          <p className="text-red-600 text-sm font-semibold text-center mt-4">
            {error}
          </p>
        )}

        {orders && (
          <div className="space-y-4 mt-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm border border-[#0E3A24]/5 p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-[#0E3A24]/50">
                    Order #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${
                      STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="space-y-2 border-t border-[#F9F8F3] pt-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-[#0E3A24] font-semibold">
                        {item.product.name}{" "}
                        <span className="text-[#0E3A24]/50">
                          ({item.weight} × {item.quantity})
                        </span>
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t border-[#F9F8F3] mt-3 pt-3">
                  <span className="text-xs font-semibold text-[#0E3A24]/50">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="font-extrabold text-[#6C4E31]">
                    ৳{order.totalAmount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
