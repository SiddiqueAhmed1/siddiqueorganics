"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { addToCart, setBuyNowCart } from "@/lib/cart";
import { flyToCart } from "@/lib/flyToCart";

export interface ProductModalProduct {
  id: string;
  name: string;
  price500g: number;
  price1kg: number;
  image: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductModalProduct;
}

type Weight = "500g" | "1kg";

export default function ProductModal({
  isOpen,
  onClose,
  product,
}: ProductModalProps) {
  const router = useRouter();
  const [selectedWeight, setSelectedWeight] = useState<Weight>("1kg");
  const imageRef = useRef<HTMLImageElement>(null);

  if (!isOpen) return null;

  const selectedPrice =
    selectedWeight === "500g" ? product.price500g : product.price1kg;

  const buildItem = () => ({
    id: product.id,
    name: product.name,
    price: selectedPrice,
    weight: selectedWeight,
  });

  const handleAddToCart = () => {
    flyToCart(imageRef.current, product.image);
    addToCart(buildItem());
    onClose();
  };

  const handleBuyNow = () => {
    setBuyNowCart(buildItem());
    onClose();
    router.push("/checkout");
  };

  return (
    <div
      className="fixed overflow-hidden inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#0E3A24]/10">
          <h2 className="font-extrabold text-[#0E3A24] text-base sm:text-lg pr-2">
            {product.name}
          </h2>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F9F8F3] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-[#0E3A24]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="w-full aspect-square rounded-xl bg-[#F9F8F3] overflow-hidden relative">
            <Image
              ref={imageRef}
              src={product.image}
              alt={product.name}
              fill
              sizes="384px"
              className="object-cover"
            />
          </div>

          <div>
            <p className="text-sm font-bold text-[#0E3A24]/70 mb-2">
              Select Size
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { weight: "500g" as Weight, price: product.price500g },
                  { weight: "1kg" as Weight, price: product.price1kg },
                ] as const
              ).map((option) => (
                <button
                  key={option.weight}
                  onClick={() => setSelectedWeight(option.weight)}
                  className={`rounded-xl border-2 px-3 py-3 text-center transition-colors ${
                    selectedWeight === option.weight
                      ? "border-[#0E3A24] bg-[#0E3A24]/5"
                      : "border-[#0E3A24]/10 hover:border-[#0E3A24]/30"
                  }`}
                >
                  <p className="font-extrabold text-[#0E3A24] text-sm">
                    {option.weight}
                  </p>
                  <p className="text-[#6C4E31] font-bold text-sm mt-0.5">
                    ৳{option.price}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={handleAddToCart}
            className="w-full h-11 rounded-xl border border-[#0E3A24] text-[#0E3A24] hover:text-white hover:bg-[#0E3A24] text-sm font-bold transition-colors"
          >
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="w-full h-11 rounded-xl bg-[#0E3A24] text-white hover:bg-[#3B7A42] text-sm font-bold transition-colors"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
