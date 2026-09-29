"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownUp, SlidersHorizontal, X } from "lucide-react";
import CartButtons from "@/components/CartButtons";

export interface CategoryProduct {
  id: string;
  name: string;
  slug: string;
  price500g: number;
  price1kg: number;
  stock: number;
  images: string[];
}

type WeightFilter = "all" | "500g" | "1kg";
type StockFilter = "all" | "in" | "out";
type Sort = "default" | "low" | "high";

const bnFont = { fontFamily: "var(--font-hind), sans-serif" };

export default function CategoryProducts({
  products,
}: {
  products: CategoryProduct[];
}) {
  const [weight, setWeight] = useState<WeightFilter>("all");
  const [stock, setStock] = useState<StockFilter>("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<Sort>("default");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // With "All" weights a product is priced by its cheapest size.
  const effectivePrice = (p: CategoryProduct) =>
    weight === "500g"
      ? p.price500g
      : weight === "1kg"
        ? p.price1kg
        : Math.min(p.price500g, p.price1kg);

  const filtered = useMemo(() => {
    const min = minPrice === "" ? 0 : Number(minPrice);
    const max = maxPrice === "" ? Infinity : Number(maxPrice);
    const price = (p: CategoryProduct) =>
      weight === "500g"
        ? p.price500g
        : weight === "1kg"
          ? p.price1kg
          : Math.min(p.price500g, p.price1kg);

    const list = products.filter((p) => {
      const pr = price(p);
      if (pr < min || pr > max) return false;
      if (stock === "in" && p.stock <= 0) return false;
      if (stock === "out" && p.stock > 0) return false;
      return true;
    });

    if (sort === "low") list.sort((a, b) => price(a) - price(b));
    if (sort === "high") list.sort((a, b) => price(b) - price(a));
    return list;
  }, [products, weight, stock, minPrice, maxPrice, sort]);

  const activeCount =
    (weight !== "all" ? 1 : 0) +
    (stock !== "all" ? 1 : 0) +
    (minPrice !== "" || maxPrice !== "" ? 1 : 0);

  const reset = () => {
    setWeight("all");
    setStock("all");
    setMinPrice("");
    setMaxPrice("");
  };

  const chip = (active: boolean) =>
    `rounded-lg border px-3 py-1.5 text-xs sm:text-sm font-bold transition-colors ${
      active
        ? "bg-[#0E3A24] border-[#0E3A24] text-white"
        : "border-[#0E3A24]/20 text-[#0E3A24] hover:border-[#3B7A42]"
    }`;

  const filterPanel = (
    <div className="space-y-6">
      {/* Weight */}
      <div>
        <p className="text-sm font-extrabold text-[#0E3A24] mb-2">Weight</p>
        <div className="flex flex-wrap gap-2">
          {(["all", "500g", "1kg"] as const).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWeight(w)}
              className={chip(weight === w)}
            >
              {w === "all" ? "All" : w}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="text-sm font-extrabold text-[#0E3A24] mb-2">
          Price (৳)
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            aria-label="Minimum price"
            className="w-full h-10 rounded-lg border border-[#0E3A24]/20 px-3 text-sm text-[#0E3A24] focus:outline-none focus:border-[#3B7A42]"
          />
          <span className="text-[#0E3A24]/40">–</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            aria-label="Maximum price"
            className="w-full h-10 rounded-lg border border-[#0E3A24]/20 px-3 text-sm text-[#0E3A24] focus:outline-none focus:border-[#3B7A42]"
          />
        </div>
        <p className="text-[11px] text-[#0E3A24]/50 mt-1.5">
          {weight === "all"
            ? "Matches the lowest size price"
            : `Matches the ${weight} price`}
        </p>
      </div>

      {/* Stock */}
      <div>
        <p className="text-sm font-extrabold text-[#0E3A24] mb-2">
          Availability
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStock("all")}
            className={chip(stock === "all")}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setStock("in")}
            className={chip(stock === "in")}
          >
            In Stock
          </button>
          <button
            type="button"
            onClick={() => setStock("out")}
            className={chip(stock === "out")}
          >
            Out of Stock
          </button>
        </div>
      </div>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={reset}
          className="text-sm font-bold text-[#6C4E31] hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="grid lg:grid-cols-[250px_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
      {/* ---------- Filters ---------- */}
      <aside className="lg:sticky lg:top-24">
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          className="lg:hidden w-full h-11 rounded-xl border border-[#0E3A24]/20 bg-white text-[#0E3A24] text-sm font-bold flex items-center justify-center gap-2"
          aria-expanded={filtersOpen}
        >
          {filtersOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <SlidersHorizontal className="w-4 h-4" />
          )}
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>

        <div
          className={`${
            filtersOpen ? "block" : "hidden"
          } lg:block mt-3 lg:mt-0 rounded-2xl bg-white border border-[#0E3A24]/10 shadow-sm p-4 sm:p-5`}
        >
          <p className="hidden lg:flex items-center gap-2 text-base font-extrabold text-[#0E3A24] mb-5">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </p>
          {filterPanel}
        </div>
      </aside>

      {/* ---------- Results ---------- */}
      <div className="space-y-4 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-[#0E3A24]/60">
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
          </p>

          <label className="flex items-center gap-2 text-sm font-bold text-[#0E3A24]">
            <ArrowDownUp className="w-4 h-4 text-[#3B7A42]" />
            <span className="sr-only sm:not-sr-only">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-10 rounded-lg border border-[#0E3A24]/20 bg-white px-3 text-sm font-semibold text-[#0E3A24] focus:outline-none focus:border-[#3B7A42]"
            >
              <option value="default">Newest</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </label>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[#0E3A24]/10 shadow-sm p-8 text-center space-y-2">
            <p
              className="text-lg font-extrabold text-[#0E3A24]"
              style={bnFont}
            >
              কোনো পণ্য পাওয়া যায়নি
            </p>
            <p className="text-sm font-bold text-[#6C4E31]">
              No products match your filters
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-2 h-10 px-5 rounded-xl bg-[#0E3A24] hover:bg-[#3B7A42] text-white text-sm font-bold transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            {filtered.map((product) => {
              const soldOut = product.stock <= 0;
              const lo = Math.min(product.price500g, product.price1kg);
              const hi = Math.max(product.price500g, product.price1kg);
              return (
                <div
                  key={product.id}
                  className="group rounded-2xl bg-white border border-[#0E3A24]/5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="block w-full aspect-square bg-[#F9F8F3] relative overflow-hidden"
                  >
                    {product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className={`object-contain p-4 transition-transform duration-500 group-hover:scale-105 ${
                          soldOut ? "opacity-50" : ""
                        }`}
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-sm text-[#0E3A24]/30 font-bold uppercase tracking-wider">
                        No Image
                      </span>
                    )}
                    {soldOut && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white font-extrabold text-[9px] sm:text-xs px-2 py-0.5 rounded-full shadow-sm">
                        Out of Stock
                      </span>
                    )}
                    {!soldOut && product.stock <= 5 && (
                      <span className="absolute top-2 left-2 bg-[#6C4E31] text-white font-extrabold text-[9px] sm:text-xs px-2 py-0.5 rounded-full shadow-sm">
                        Low Stock
                      </span>
                    )}
                  </Link>

                  <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between gap-2 sm:gap-4">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-bold text-[#0E3A24] text-sm sm:text-base line-clamp-2 min-h-[40px] leading-tight hover:text-[#3B7A42] transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5 border-t border-[#F9F8F3] pt-2">
                        <span className="text-[10px] sm:text-sm text-[#0E3A24]/50 font-bold">
                          {weight === "all" ? "500g / 1kg" : weight}
                        </span>
                        <span className="text-[#6C4E31] font-extrabold text-sm sm:text-lg">
                          {weight === "all"
                            ? `৳${lo} - ৳${hi}`
                            : `৳${effectivePrice(product)}`}
                        </span>
                      </div>

                      {soldOut ? (
                        <button
                          type="button"
                          disabled
                          className="w-full h-10 rounded-xl bg-[#0E3A24]/10 text-[#0E3A24]/50 text-xs sm:text-sm font-bold mt-2 cursor-not-allowed"
                        >
                          Out of Stock
                        </button>
                      ) : (
                        <CartButtons
                          productId={product.id}
                          productName={product.name}
                          price500g={product.price500g}
                          price1kg={product.price1kg}
                          image={product.images[0] ?? "/placeholder.png"}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
