"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import ProductModal from "@/components/ProductModal";

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

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full h-10 rounded-xl bg-[#0E3A24] text-white hover:bg-[#3B7A42] text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 mt-2 transition-colors active:scale-95"
      >
        <ShoppingBag className="w-3.5 h-3.5" />
        Buy Now
      </button>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={{
          id: productId,
          name: productName,
          price500g,
          price1kg,
          image,
        }}
      />
    </>
  );
}
