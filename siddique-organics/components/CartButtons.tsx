"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { ShoppingBag } from "lucide-react";

// The modal is only downloaded/mounted once someone actually opens it,
// instead of shipping (and mounting) one per product card on page load.
const ProductModal = dynamic(() => import("@/components/ProductModal"));

interface CartButtonsProps {
  productId: string;
  productName: string;
  price500g: number;
  price1kg: number;
  image: string;
}

export default function CartButtons({
  productId,
  productName,
  price500g,
  price1kg,
  image,
}: CartButtonsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const close = useCallback(() => setIsModalOpen(false), []);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full h-10 rounded-xl bg-[#0E3A24] text-white hover:bg-[#3B7A42] text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 mt-2 transition-colors active:scale-95"
      >
        <ShoppingBag className="w-3.5 h-3.5" />
        Buy Now
      </button>

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
