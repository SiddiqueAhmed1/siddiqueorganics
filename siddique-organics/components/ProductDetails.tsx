"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  MessageCircle,
} from "lucide-react";
import { addToCart, MAX_QTY_PER_ITEM } from "@/lib/cart";
import { flyToCart } from "@/lib/flyToCart";
import { useCartDrawer } from "@/components/CartDrawerContext";
import { SITE } from "@/lib/site";

export interface ProductDetailsProduct {
  id: string;
  name: string;
  category: string;
  price500g: number;
  price1kg: number;
  stock: number;
  images: string[];
}

type Weight = "500g" | "1kg";

export default function ProductDetails({
  product,
}: {
  product: ProductDetailsProduct;
}) {
  const router = useRouter();
  const { openDrawer } = useCartDrawer();

  const images = product.images ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [weight, setWeight] = useState<Weight>("1kg");
  const [quantity, setQuantity] = useState(1);
  const [showBar, setShowBar] = useState(false);

  const mainImageRef = useRef<HTMLImageElement>(null);
  const barImageRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const price = weight === "500g" ? product.price500g : product.price1kg;
  const soldOut = product.stock <= 0;
  const maxQty = Math.max(1, Math.min(MAX_QTY_PER_ITEM, product.stock));
  const cartImage = images[0] ?? "/placeholder.png";

  // Show the bottom bar once the main action buttons have scrolled
  // out of view (above the viewport).
  useEffect(() => {
    const el = actionsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) =>
        setShowBar(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const buildItem = () => ({
    id: product.id,
    name: product.name,
    price,
    weight,
    image: cartImage,
  });

  const handleAddToCart = (source: Element | null) => {
    if (soldOut) return;
    flyToCart(source, cartImage);
    addToCart(buildItem(), quantity);
    openDrawer();
  };

  // Same behaviour as the product modal: add to the real cart, then checkout.
  const handleBuyNow = () => {
    if (soldOut) return;
    addToCart(buildItem(), quantity);
    router.push("/checkout");
  };

  const whatsappHref = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
    `Hello, I want to order: ${product.name} (${weight}) x ${quantity}`,
  )}`;

  const prev = () =>
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setActiveIndex((i) => (i + 1) % images.length);

  return (
    <>
      <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-6 lg:gap-10">
        {/* ---------- Gallery ---------- */}
        <div className="flex flex-col-reverse lg:flex-row gap-3">
          {images.length > 1 && (
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Show image ${i + 1}`}
                  className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-[#F9F8F3] border-2 transition-colors ${
                    i === activeIndex
                      ? "border-[#3B7A42]"
                      : "border-[#0E3A24]/10 hover:border-[#3B7A42]/50"
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="relative flex-1 aspect-square rounded-xl overflow-hidden bg-[#F9F8F3]">
            {images.length > 0 ? (
              <Image
                ref={mainImageRef}
                src={images[activeIndex]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-[#0E3A24]/30 font-bold uppercase tracking-wider">
                No Image
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-[#0E3A24] shadow flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-[#0E3A24] shadow flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* ---------- Info ---------- */}
        <div className="space-y-5">
          <div className="space-y-2">
            <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#3B7A42] bg-[#3B7A42]/10 px-2.5 py-1 rounded-full">
              {product.category}
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold text-[#0E3A24] leading-tight">
              {product.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#6C4E31]">
              ৳{price}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                soldOut
                  ? "bg-red-50 text-red-600"
                  : product.stock <= 5
                    ? "bg-[#6C4E31]/10 text-[#6C4E31]"
                    : "bg-[#3B7A42]/10 text-[#3B7A42]"
              }`}
            >
              {soldOut
                ? "Out of Stock"
                : product.stock <= 5
                  ? `Only ${product.stock} left`
                  : "In Stock"}
            </span>
          </div>

          {/* Size */}
          <div>
            <p className="text-sm font-bold text-[#0E3A24]/70 mb-2">
              Select Size:
            </p>
            <div className="flex gap-3">
              {(
                [
                  { w: "1kg" as Weight, price: product.price1kg },
                  { w: "500g" as Weight, price: product.price500g },
                ] as const
              ).map((o) => (
                <button
                  key={o.w}
                  type="button"
                  onClick={() => setWeight(o.w)}
                  className={`rounded-xl border-2 px-5 py-2.5 text-center transition-colors ${
                    weight === o.w
                      ? "border-[#0E3A24] bg-[#0E3A24]/5"
                      : "border-[#0E3A24]/10 hover:border-[#0E3A24]/30"
                  }`}
                >
                  <p className="font-extrabold text-[#0E3A24] text-sm">{o.w}</p>
                  <p className="text-[#6C4E31] font-bold text-xs mt-0.5">
                    ৳{o.price}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <p className="text-sm font-bold text-[#0E3A24]/70 mb-2">
              Quantity:
            </p>
            <div className="inline-flex items-center rounded-xl border border-[#0E3A24]/20 overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="w-10 h-10 flex items-center justify-center text-[#0E3A24] hover:bg-[#F9F8F3] disabled:opacity-30 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-extrabold text-[#0E3A24]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                disabled={quantity >= maxQty || soldOut}
                aria-label="Increase quantity"
                className="w-10 h-10 flex items-center justify-center text-[#0E3A24] hover:bg-[#F9F8F3] disabled:opacity-30 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div ref={actionsRef} className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleAddToCart(mainImageRef.current)}
                disabled={soldOut}
                className="h-12 rounded-xl border-2 border-[#0E3A24] text-[#0E3A24] hover:bg-[#0E3A24] hover:text-white text-sm font-bold transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                Add to Cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={soldOut}
                className="h-12 rounded-xl bg-[#0E3A24] text-white hover:bg-[#3B7A42] text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <ShoppingBag className="w-4 h-4" />
                Buy Now
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 rounded-xl bg-[#0E3A24] hover:bg-[#3B7A42] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Order on WhatsApp
              </a>
              <a
                href={SITE.phoneHref}
                className="h-12 rounded-xl border-2 border-[#0E3A24] text-[#0E3A24] hover:bg-[#F9F8F3] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call: {SITE.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Sticky bottom bar ---------- */}
      <div
        id="sticky-buy-bar"
        inert={!showBar}
        aria-hidden={!showBar}
        className={`fixed inset-x-0 bottom-0 z-40 bg-white border-t border-[#0E3A24]/10 shadow-[0_-4px_20px_rgba(14,58,36,0.12)] transition-transform duration-300 ${
          showBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto max-w-[1420px] px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              ref={barImageRef}
              className="relative w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-lg overflow-hidden bg-[#F9F8F3]"
            >
              {images[0] && (
                <Image
                  src={images[0]}
                  alt={product.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-[#0E3A24] truncate">
                {product.name}
              </p>
              <p className="text-sm sm:text-base font-extrabold text-[#6C4E31]">
                ৳{price}
                <span className="text-[11px] font-bold text-[#0E3A24]/50 ml-1.5">
                  / {weight}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleAddToCart(barImageRef.current)}
              disabled={soldOut}
              className="h-10 px-3 sm:px-5 rounded-xl border-2 border-[#0E3A24] text-[#0E3A24] hover:bg-[#0E3A24] hover:text-white text-xs sm:text-sm font-bold transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Add to Cart
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={soldOut}
              className="h-10 px-3 sm:px-5 rounded-xl bg-[#0E3A24] text-white hover:bg-[#3B7A42] text-xs sm:text-sm font-bold transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
