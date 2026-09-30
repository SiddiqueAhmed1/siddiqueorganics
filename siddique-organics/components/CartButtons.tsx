"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { Plus, ShoppingBag } from "lucide-react";

// The modal is only downloaded/mounted once someone actually opens it,
// instead of shipping (and mounting) one per product card on page load.
const ProductModal = dynamic(() => import("@/components/ProductModal"));

interface CartButtonsProps {
  productId: string;
  productName: string;
  price500g: number;
  price1kg: number;
  image: string;
  /**
   * "full"  -> the original full-width Buy Now button (default).
   * "card"  -> responsive trigger for the new product cards:
   *            desktop = compact green "Buy Now" button,
   *            mobile  = small round "+" button.
   */
  variant?: "full" | "card";
}

export default function CartButtons({
  productId,
  productName,
  price500g,
  price1kg,
  image,
  variant = "full",
}: CartButtonsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const close = useCallback(() => setIsModalOpen(false), []);
  const open = () => setIsModalOpen(true);

  return (
    <>
      {variant === "card" ? (
        <>
          <button
            type="button"
            onClick={open}
            className="hidden md:flex shrink-0 h-10 px-4 rounded-xl bg-[#0E3A24] text-white hover:bg-[#3B7A42] text-sm font-bold items-center justify-center gap-1.5 transition-colors active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            Buy Now
          </button>
          <button
            type="button"
            onClick={open}
            aria-label={`Buy ${productName}`}
            className="md:hidden shrink-0 w-9 h-9 rounded-full bg-[#0E3A24] text-white hover:bg-[#3B7A42] flex items-center justify-center transition-colors active:scale-90 shadow-sm"
          >
            <Plus className="w-5 h-5" />
          </button>
        </>
      ) : (
        <button
          onClick={open}
          className="w-full h-10 rounded-xl bg-[#0E3A24] text-white hover:bg-[#3B7A42] text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 mt-2 transition-colors active:scale-95"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Buy Now
        </button>
      )}

      {isModalOpen && (
        <ProductModal
          isOpen
          onClose={close}
          product={{
            id: productId,
            name: productName,
            price500g,
            price1kg,
            image,
          }}
        />
      )}
    </>
  );
}
