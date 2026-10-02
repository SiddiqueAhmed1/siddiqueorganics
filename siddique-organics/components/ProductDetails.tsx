"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
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

export interface ProductDetailsVariant {
  id: string;
  size: string;
  price: number;
  stock: number;
}

export interface ProductDetailsProduct {
  id: string;
  name: string;
  category: string;
  images: string[];
  description?: string;
  variants: ProductDetailsVariant[];
}

export default function ProductDetails({
  product,
}: {
  product: ProductDetailsProduct;
}) {
  const router = useRouter();
  const { openDrawer } = useCartDrawer();

  const images = product.images ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const variants = product.variants ?? [];
  const [variantId, setVariantId] = useState<string>(
    () => (variants.find((v) => v.stock > 0) ?? variants[0])?.id ?? "",
  );
  const selected = variants.find((v) => v.id === variantId) ?? variants[0];
  const weight = selected?.size ?? "";
  const stock = selected?.stock ?? 0;
  const [quantity, setQuantity] = useState(1);
  const [showBar, setShowBar] = useState(false);

  const mainImageRef = useRef<HTMLImageElement>(null);
  const mobileImageRef = useRef<HTMLDivElement>(null);
  const barImageRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const price = selected?.price ?? 0;
  const soldOut = stock <= 0;
  const maxQty = Math.max(1, Math.min(MAX_QTY_PER_ITEM, stock));
  const cartImage = images[0] ?? "/placeholder.png";

  const selectVariant = (v: ProductDetailsVariant) => {
    setVariantId(v.id);
    setQuantity((q) =>
      Math.min(q, Math.max(1, Math.min(MAX_QTY_PER_ITEM, v.stock))),
    );
  };

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
    `Hello, I want to order: ${product.name} (${weight}) x${quantity}`,
  )}`;

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  const prev = () =>
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setActiveIndex((i) => (i + 1) % images.length);

  const stockLabel = soldOut
    ? "Out of Stock"
    : stock <= 5
      ? `Only ${stock} left`
      : "In Stock";

  return (
    <>
      {/* ================= MOBILE LAYOUT (< md) ================= */}
      <div id="product-mobile" className="md:hidden -mx-4 sm:-mx-6 -mt-4">
        {/* Image area with back arrow */}
        <div
          ref={mobileImageRef}
          className="relative h-[46vh] min-h-[280px] max-h-[440px] bg-white"
        >
          <button
            type="button"
            onClick={goBack}
            aria-label="Go back"
            className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0E3A24] shadow-[0_2px_12px_rgba(14,58,36,0.15)] active:scale-90 transition-transform"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {images.length > 0 ? (
            <Image
              src={images[activeIndex]}
              alt={product.name}
              fill
              priority
              sizes="100vw"
              className="object-contain p-8 pb-12"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold uppercase tracking-wider text-[#0E3A24]/30">
              No Image
            </div>
          )}

          {images.length > 1 && (
            <div className="absolute inset-x-0 bottom-10 flex justify-center gap-1.5">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Show image ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === activeIndex
                      ? "w-6 bg-[#0E3A24]"
                      : "w-2 bg-[#0E3A24]/25"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Rounded cream sheet */}
        <div className="relative -mt-7 rounded-t-[2rem] bg-[#F9F9F9] px-5 pt-6 pb-6 shadow-[0_-10px_30px_rgba(14,58,36,0.07)] space-y-5">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-normal leading-tight text-[#0E3A24]">
              {product.name}
            </h1>
            <span
              className={`mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                soldOut
                  ? "bg-red-50 text-red-600"
                  : stock <= 5
                    ? "bg-[#6C4E31]/10 text-[#6C4E31]"
                    : "bg-[#3B7A42]/10 text-[#3B7A42]"
              }`}
            >
              {stockLabel}
            </span>
          </div>

          {/* Price + quantity stepper */}
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-[#6C4E31]">
              ৳{price}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#3B7A42] text-[#3B7A42] disabled:opacity-30 active:scale-90 transition-transform"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center text-base font-extrabold text-[#0E3A24]">
                {String(quantity).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                disabled={quantity >= maxQty || soldOut}
                aria-label="Increase quantity"
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#3B7A42] text-[#3B7A42] disabled:opacity-30 active:scale-90 transition-transform"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weight options (500g / 1kg boxes) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {variants.map((o) => (
              <button
                key={o.id}
                disabled={o.stock <= 0}
                type="button"
                onClick={() => selectVariant(o)}
                className={`rounded-xl border-2 py-2.5 text-center transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                  selected?.id === o.id
                    ? "border-[#3B7A42] bg-[#3B7A42]/15 shadow-[0_4px_14px_rgba(59,122,66,0.18)]"
                    : "border-[#3B7A42]/20 bg-[#3B7A42]/5 hover:bg-[#3B7A42]/10"
                }`}
              >
                <p className="text-sm font-extrabold text-[#0E3A24]">
                  {o.size}
                </p>
                <p className="mt-0.5 text-xs font-bold text-[#6C4E31]">
                  ৳{o.price}
                </p>
              </button>
            ))}
          </div>

          {/* Description */}
          <div className="border-t border-[#0E3A24]/10 pt-4">
            <h2 className="mb-2 text-base font-bold text-[#0E3A24]">
              Description
            </h2>
            {product.description?.trim() ? (
              <p className="whitespace-pre-line text-sm leading-relaxed text-[#0E3A24]/70">
                {product.description}
              </p>
            ) : (
              <p className="text-sm text-[#0E3A24]/50">
                No description has been added for this product yet.
              </p>
            )}
          </div>

          {/* Quick contact */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-xs font-bold text-white"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <a
              href={SITE.phoneHref}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border-2 border-[#0E3A24] text-xs font-bold text-[#0E3A24]"
            >
              <Phone className="h-4 w-4" />
              Call
            </a>
          </div>
        </div>

        {/* Fixed bottom action bar (no bottom nav on this page) */}
        <div className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_28px_rgba(14,58,36,0.14)]">
          <div className="mx-auto flex max-w-md gap-3">
            <button
              type="button"
              onClick={() => handleAddToCart(mobileImageRef.current)}
              disabled={soldOut}
              className="h-12 flex-1 rounded-2xl border-2 border-[#0E3A24] text-sm font-bold text-[#0E3A24] active:scale-95 transition-transform disabled:pointer-events-none disabled:opacity-40"
            >
              Add to Cart
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={soldOut}
              className="flex h-12 flex-[1.3] items-center justify-center gap-2 rounded-2xl bg-[#0E3A24] text-sm font-bold text-white active:scale-95 transition-transform disabled:pointer-events-none disabled:opacity-40"
            >
              <ShoppingBag className="h-4 w-4" />
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* ================= DESKTOP / TABLET LAYOUT (md+) ================= */}
      <div className="hidden md:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-6 lg:gap-10">
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
            <h1 className="text-xl sm:text-3xl font-normal text-[#0E3A24] leading-tight">
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
                  : stock <= 5
                    ? "bg-[#6C4E31]/10 text-[#6C4E31]"
                    : "bg-[#3B7A42]/10 text-[#3B7A42]"
              }`}
            >
              {soldOut
                ? "Out of Stock"
                : stock <= 5
                  ? `Only ${stock} left`
                  : "In Stock"}
            </span>
          </div>

          {/* Size */}
          <div>
            <p className="text-sm font-bold text-[#0E3A24]/70 mb-2">
              Select Size:
            </p>
            <div className="flex flex-wrap gap-3">
              {variants.map((o) => (
                <button
                  key={o.id}
                  disabled={o.stock <= 0}
                  type="button"
                  onClick={() => selectVariant(o)}
                  className={`rounded-xl border-2 px-5 py-2 text-center transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                    selected?.id === o.id
                      ? "border-[#3B7A42] bg-[#3B7A42]/15 shadow-[0_4px_14px_rgba(59,122,66,0.18)]"
                      : "border-[#3B7A42]/20 bg-[#3B7A42]/5 hover:bg-[#3B7A42]/10"
                  }`}
                >
                  <p className="font-extrabold text-[#0E3A24] text-sm">
                    {o.size}
                  </p>
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
                className="h-12 rounded-xl bg-[#25D366] hover:bg-[#1fb857] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors"
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
        className={`hidden md:block fixed inset-x-0 bottom-0 z-40 bg-white border-t border-[#0E3A24]/10 shadow-[0_-4px_20px_rgba(14,58,36,0.12)] transition-transform duration-300 ${
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
