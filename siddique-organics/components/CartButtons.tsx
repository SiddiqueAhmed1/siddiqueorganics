"use client";

import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

interface CartButtonsProps {
  productId: string;
  productName: string;
  price500g: number;
}

export default function CartButtons({
  productId,
  productName,
  price500g,
}: CartButtonsProps) {
  const router = useRouter();

  // ১. এখানে 'Add to Cart' বাটনের অ্যাকশন লজিকটি বসবে
  const handleAddToCart = () => {
    const targetItem = {
      id: productId,
      name: productName,
      price: price500g,
      weight: "500g",
      quantity: 1,
    };
    const rawCart = localStorage.getItem("siddique_cart");
    const currentCart = rawCart ? JSON.parse(rawCart) : [];
    const existing = currentCart.find(
      (item: { id: string; weight: string; quantity: number }) =>
        item.id === targetItem.id && item.weight === targetItem.weight,
    );

    if (existing) existing.quantity += 1;
    else currentCart.push(targetItem);

    localStorage.setItem("siddique_cart", JSON.stringify(currentCart));
    window.dispatchEvent(new Event("siddique_cart_sync"));
  };

  // ২. এখানে 'Buy Now' বাটনের অ্যাকশন লজিকটি বসবে
  const handleBuyNow = () => {
    const instantCheckoutItem = [
      {
        id: productId,
        name: productName,
        price: price500g,
        weight: "500g",
        quantity: 1,
      },
    ];
    localStorage.setItem("siddique_cart", JSON.stringify(instantCheckoutItem));
    window.dispatchEvent(new Event("siddique_cart_sync"));
    router.push("/checkout");
  };

  return (
    <div className="flex gap-1.5 w-full mt-2">
      <button
        onClick={handleAddToCart}
        className="w-full h-10 rounded-xl border border-[#0E3A24] text-[#0E3A24] hover:text-white hover:bg-[#0E3A24] text-xs sm:text-sm font-bold flex items-center justify-center gap-1"
      >
        <ShoppingCart className="w-3.5 h-3.5" /> Save to Cart
      </button>
      <button
        onClick={handleBuyNow}
        className="w-full h-10 rounded-xl bg-[#0E3A24] text-white hover:bg-[#3B7A42] text-xs sm:text-sm font-bold flex items-center justify-center gap-1"
      >
        Buy Now
      </button>
    </div>
  );
}
