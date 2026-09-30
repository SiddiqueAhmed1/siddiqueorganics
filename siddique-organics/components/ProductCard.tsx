import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import CartButtons from "@/components/CartButtons";

export interface CardProduct {
  id: string;
  name: string;
  slug: string;
  price500g: number;
  price1kg: number;
  stock: number;
  images: string[];
}

/**
 * NEW product card (used in every grid except desktop "Top Selling").
 *  - desktop: full-bleed image, name, price + green "Buy Now" button
 *  - mobile : contained image on white, centred name, price + round "+"
 */
export function ProductCard({
  product,
  weight = "all",
  rank,
}: {
  product: CardProduct;
  /** Which price to show — "all" shows the 500g–1kg range. */
  weight?: "all" | "500g" | "1kg";
  /** Small #N badge (mobile top-selling grid). */
  rank?: number;
}) {
  const soldOut = product.stock <= 0;
  const lowStock = !soldOut && product.stock <= 5;
  const lo = Math.min(product.price500g, product.price1kg);
  const hi = Math.max(product.price500g, product.price1kg);
  const sizeLabel = weight === "all" ? "500g / 1kg" : weight;
  const priceLabel =
    weight === "all"
      ? `৳${lo} - ৳${hi}`
      : `৳${weight === "500g" ? product.price500g : product.price1kg}`;

  return (
    <div
      data-product-card
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white border border-[#0E3A24]/[0.04] shadow-[0_2px_14px_rgba(14,58,36,0.06)] transition-all duration-300 md:hover:-translate-y-0.5 md:hover:shadow-[0_12px_32px_rgba(14,58,36,0.14)]"
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative block w-full aspect-square overflow-hidden bg-white"
      >
        {product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-contain p-3 md:object-cover md:p-0 transition-transform duration-500 group-hover:scale-105 ${
              soldOut ? "opacity-50" : ""
            }`}
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-xs text-[#0E3A24]/30 font-bold uppercase tracking-wider">
            No Image
          </span>
        )}

        {soldOut && (
          <span className="absolute top-2.5 left-2.5 bg-red-600 text-white font-extrabold text-[10px] sm:text-xs px-2.5 py-1 rounded-full shadow-sm">
            Out of Stock
          </span>
        )}
        {lowStock && (
          <span className="absolute top-2.5 left-2.5 bg-[#6C4E31] text-white font-extrabold text-[10px] sm:text-xs px-2.5 py-1 rounded-full shadow-sm">
            Low Stock
          </span>
        )}
        {rank && (
          <span className="absolute top-2.5 right-2.5 bg-amber-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
            #{rank}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3 md:p-5">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-center md:text-left font-normal text-[#0E3A24] text-[13px] md:text-base leading-snug line-clamp-2 min-h-[2.5rem] md:min-h-[2.75rem] group-hover:text-[#3B7A42] transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="mt-0.5 text-center text-[11px] font-medium text-[#0E3A24]/50 md:hidden">
          {sizeLabel}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3 md:pt-4">
          <span className="font-extrabold text-[#6C4E31] text-sm md:text-lg whitespace-nowrap">
            {priceLabel}
          </span>
          {soldOut ? (
            <span className="shrink-0 rounded-xl bg-[#0E3A24]/10 px-3 h-9 md:h-10 flex items-center text-[11px] md:text-sm font-bold text-[#0E3A24]/50">
              Sold out
            </span>
          ) : (
            <CartButtons
              variant="card"
              productId={product.id}
              productName={product.name}
              price500g={product.price500g}
              price1kg={product.price1kg}
              image={product.images?.[0] ?? "/placeholder.png"}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The ORIGINAL card, kept only for the desktop "Top Selling Products"
 * section (that section was asked to stay unchanged).
 */
export function ClassicProductCard({
  product,
  rank,
}: {
  product: CardProduct;
  rank: number;
}) {
  return (
    <div
      data-product-card
      className="group rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden relative border-2 border-amber-400/50 h-full"
    >
      <Link
        href={`/products/${product.slug}`}
        className="block w-full aspect-square bg-[#F9F8F3] relative overflow-hidden flex items-center justify-center p-4"
      >
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 33vw, 25vw"
            className="object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="text-sm text-[#0E3A24]/30 font-bold uppercase tracking-wider">
            No Image
          </span>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-2 left-2 bg-[#6C4E31] text-white font-extrabold text-[9px] sm:text-sm px-2 py-0.5 rounded-full shadow-sm">
            Low Stock
          </span>
        )}
        <span className="absolute top-2 right-2 bg-amber-500 text-white font-extrabold text-[9px] sm:text-xs px-2 py-0.5 rounded-full shadow-sm">
          #{rank} Best Seller
        </span>
      </Link>
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between gap-2 sm:gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-0.5 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-current" />
            ))}
          </div>
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-normal text-[#0E3A24] text-sm sm:text-base line-clamp-2 min-h-[40px] leading-tight hover:text-[#3B7A42] transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5 border-t border-[#F9F8F3] pt-2">
            <span className="text-sm text-[#0E3A24]/50 font-bold">
              500g / 1kg
            </span>
            <span className="text-[#6C4E31] font-extrabold text-sm sm:text-lg">
              ৳{product.price500g} - ৳{product.price1kg}
            </span>
          </div>
          <CartButtons
            productId={product.id}
            productName={product.name}
            price500g={product.price500g}
            price1kg={product.price1kg}
            image={product.images?.[0] ?? "/placeholder.png"}
          />
        </div>
      </div>
    </div>
  );
}
