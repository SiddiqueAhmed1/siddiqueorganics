"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/cart";
import { useScrollLock } from "@/lib/useScrollLock";
import { flyToCart } from "@/lib/flyToCart";
import { useCartDrawer } from "@/components/CartDrawerContext";

export interface ProductModalProduct {
  id: string;
  name: string;
  image: string;
  variants: ProductModalVariant[];
}

export interface ProductModalVariant {
  id: string;
  size: string;
  price: number;
  stock: number;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductModalProduct;
}

export default function ProductModal({
  isOpen,
  onClose,
  product,
}: ProductModalProps) {
  const router = useRouter();
  const { openDrawer } = useCartDrawer();
  const [selectedId, setSelectedId] = useState<string>(
    () =>
      (product.variants.find((v) => v.stock > 0) ?? product.variants[0])?.id ??
      "",
  );
  const imageRef = useRef<HTMLImageElement>(null);

  // Issue 4: freeze the page behind the modal while it is open.
  useScrollLock(isOpen);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  const selected =
    product.variants.find((v) => v.id === selectedId) ?? product.variants[0];
  const selectedPrice = selected?.price ?? 0;
  const soldOut = !selected || selected.stock <= 0;

  const buildItem = () => ({
    id: product.id,
    name: product.name,
    price: selectedPrice,
    weight: selected?.size ?? "",
    image: product.image,
  });

  const handleAddToCart = () => {
    if (soldOut) return;
    flyToCart(imageRef.current, product.image);
    addToCart(buildItem());
    onClose();
    openDrawer();
  };

  // Issues 1 & 2: "Buy Now" adds to the real cart (merging with what is
  // already there), then goes to checkout, which shows the whole cart.
  const handleBuyNow = () => {
    if (soldOut) return;
    addToCart(buildItem());
    onClose();
    router.push("/checkout");
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 overscroll-contain touch-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm max-h-[92dvh] overflow-y-auto overscroll-contain touch-auto bg-white rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#0E3A24]/10">
          <h2 className="font-normal text-[#0E3A24] text-base sm:text-lg pr-2">
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
              {product.variants.map((option) => (
                <button
                  key={option.id}
                  disabled={option.stock <= 0}
                  onClick={() => setSelectedId(option.id)}
                  className={`rounded-xl border-2 px-3 py-3 text-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    selected?.id === option.id
                      ? "border-[#0E3A24] bg-[#0E3A24]/5"
                      : "border-[#0E3A24]/10 hover:border-[#0E3A24]/30"
                  }`}
                >
                  <p className="font-extrabold text-[#0E3A24] text-sm">
                    {option.size}
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
            disabled={soldOut}
            className="w-full h-11 disabled:opacity-40 disabled:pointer-events-none rounded-xl border border-[#0E3A24] text-[#0E3A24] hover:text-white hover:bg-[#0E3A24] text-sm font-bold transition-colors"
          >
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={soldOut}
            className="w-full h-11 disabled:opacity-40 disabled:pointer-events-none rounded-xl bg-[#0E3A24] text-white hover:bg-[#3B7A42] text-sm font-bold transition-colors"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
