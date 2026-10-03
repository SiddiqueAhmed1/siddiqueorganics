"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import {
  getAllSearchableProducts,
  type SearchProductItem,
} from "@/actions/search.actions";

interface SearchBarProps {
  placeholder: string;
  className?: string;
  inputClassName?: string;
}

export default function SearchBar({
  placeholder,
  className = "",
  inputClassName = "",
}: SearchBarProps) {
  const router = useRouter();
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  // ক্লায়েন্টে ক্যাশড প্রোডাক্ট লিস্ট
  const [allProducts, setAllProducts] = useState<SearchProductItem[]>([]);
  const hasLoadedRef = useRef(false);

  // ইনপুটে ফোকাস বা হোভার করার সাথে সাথে প্রি-ফেচ হবে (Zero-latency)
  const preloadProducts = useCallback(async () => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    try {
      const data = await getAllSearchableProducts();
      setAllProducts(data);
    } catch {
      hasLoadedRef.current = false;
    }
  }, []);

  // ইনস্ট্যান্ট মেমোরি ফিল্টারিং (0ms Delay)
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2 || !allProducts.length) return [];

    const num = Number(q.replace(/[৳,\s]/g, ""));
    const isPriceSearch = Number.isFinite(num) && num > 0;
    const lo = num * 0.85;
    const hi = num * 1.15;

    return allProducts
      .filter((p) => {
        // ১. নাম বা ক্যাটাগরিতে মিল থাকলে
        const textMatch =
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);

        if (textMatch) return true;

        // ২. দামের সাথে মিল থাকলে (±15% রেঞ্জ)
        if (isPriceSearch) {
          return (
            (p.minPrice >= lo && p.minPrice <= hi) ||
            (p.maxPrice >= lo && p.maxPrice <= hi)
          );
        }

        return false;
      })
      .slice(0, 6); // প্রথম ৬টি ইনস্ট্যান্ট রেজাল্ট
  }, [query, allProducts]);

  // ড্রপডাউনের বাইরে ক্লিক করলে বন্ধ হবে
  useEffect(() => {
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, []);

  const pick = useCallback(
    (r: SearchProductItem) => {
      setOpen(false);
      setQuery("");
      router.push(`/products/${r.slug}`);
    },
    [router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return setOpen(false);
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active >= 0 ? active : 0]) {
        pick(results[active >= 0 ? active : 0]);
      }
    }
  };

  const showBox = open && query.trim().length >= 2;

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        onFocus={() => {
          preloadProducts();
          setOpen(true);
        }}
        onMouseEnter={preloadProducts}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={showBox}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        className={inputClassName}
      />

      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0E3A24]/60">
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
            }}
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
      </span>

      {showBox && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 z-[70] max-h-[70vh] overflow-y-auto overscroll-contain rounded-2xl bg-white border border-[#0E3A24]/10 shadow-2xl divide-y divide-[#F9F8F3]"
        >
          {results.map((r, i) => (
            <li
              key={r.id}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(r)}
              className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer ${
                i === active ? "bg-[#F9F8F3]" : ""
              }`}
            >
              {r.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.image}
                  alt=""
                  width={44}
                  height={44}
                  loading="lazy"
                  className="w-11 h-11 rounded-lg object-cover bg-[#F9F8F3] shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-lg bg-[#F9F8F3] shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#0E3A24] truncate">
                  {r.name}
                </p>
                <p className="text-xs text-[#0E3A24]/50 capitalize truncate">
                  {r.category}
                </p>
              </div>

              <p className="text-xs font-extrabold text-[#6C4E31] whitespace-nowrap">
                {r.minPrice === r.maxPrice
                  ? `৳${r.minPrice}`
                  : `৳${r.minPrice} - ৳${r.maxPrice}`}
              </p>
            </li>
          ))}

          {results.length === 0 && (
            <li className="px-4 py-5 text-center text-sm font-semibold text-[#0E3A24]/50">
              No products found for “{query.trim()}”
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
