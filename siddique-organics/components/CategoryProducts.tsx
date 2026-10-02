"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, SlidersHorizontal, X } from "lucide-react";
import { ProductCard, type CardProduct } from "@/components/ProductCard";

export type CategoryProduct = CardProduct;

type WeightFilter = string; // "all" or a variant size label such as "500g", "1ltr"
type StockFilter = "all" | "in" | "out";
type Sort = "default" | "low" | "high";

const bnFont = {
  fontFamily: "var(--font-open-sans), var(--font-hind), sans-serif",
};

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

  // Size filter options come from the variants that actually exist in this category.
  const sizes = useMemo(() => {
    const seen = new Set<string>();
    products.forEach((p) => p.variants.forEach((v) => seen.add(v.size)));
    return [...seen];
  }, [products]);

  const filtered = useMemo(() => {
    const min = minPrice === "" ? 0 : Number(minPrice);
    const max = maxPrice === "" ? Infinity : Number(maxPrice);
    const pool = (p: CategoryProduct) =>
      weight === "all"
        ? p.variants
        : p.variants.filter((v) => v.size === weight);
    const price = (p: CategoryProduct) =>
      Math.min(...pool(p).map((v) => v.price));
    const stockOf = (p: CategoryProduct) =>
      pool(p).reduce((sum, v) => sum + v.stock, 0);

    const list = products.filter((p) => {
      if (pool(p).length === 0) return false; // product doesn't come in the chosen size
      const pr = price(p);
      if (pr < min || pr > max) return false;
      if (stock === "in" && stockOf(p) <= 0) return false;
      if (stock === "out" && stockOf(p) > 0) return false;
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
        <p className="text-sm font-extrabold text-[#0E3A24] mb-2">Size</p>
        <div className="flex flex-wrap gap-2">
          {["all", ...sizes].map((w) => (
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
        <p className="text-sm font-extrabold text-[#0E3A24] mb-2">Price (৳)</p>
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
            <p className="text-lg font-extrabold text-[#0E3A24]" style={bnFont}>
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} weight={weight} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
