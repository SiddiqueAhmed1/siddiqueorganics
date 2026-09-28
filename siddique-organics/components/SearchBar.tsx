"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, Search, X } from "lucide-react";
import { searchProducts, type SearchResult } from "@/actions/search.actions";

const ProductModal = dynamic(() => import("@/components/ProductModal"));

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
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const reqId = useRef(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [active, setActive] = useState(-1);
  const [selected, setSelected] = useState<SearchResult | null>(null);

  // Debounced search (300ms). `reqId` drops out-of-order responses.
  useEffect(() => {
    const q = query.trim();
    const id = ++reqId.current;

    const timer = setTimeout(
      async () => {
        if (q.length < 2) {
          setResults([]);
          setSearched(false);
          setLoading(false);
          return;
        }
        setLoading(true);
        const data = await searchProducts(q);
        if (id !== reqId.current) return; // a newer keystroke won
        setResults(data);
        setSearched(true);
        setLoading(false);
        setActive(-1);
      },
      q.length < 2 ? 0 : 300,
    );

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside closes the dropdown.
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

  const pick = useCallback((r: SearchResult) => {
    setSelected(r);
    setOpen(false);
  }, []);

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
      pick(results[active >= 0 ? active : 0]);
    }
  };

  const showBox = open && query.trim().length >= 2;

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
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
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setResults([]);
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
                ৳{r.price500g} - ৳{r.price1kg}
              </p>
            </li>
          ))}
          {!loading && searched && results.length === 0 && (
            <li className="px-4 py-5 text-center text-sm font-semibold text-[#0E3A24]/50">
              No products found for “{query.trim()}”
            </li>
          )}
          {loading && results.length === 0 && (
            <li className="px-4 py-5 text-center text-sm font-semibold text-[#0E3A24]/50">
              Searching…
            </li>
          )}
        </ul>
      )}

      {selected && (
        <ProductModal
          isOpen
          onClose={() => setSelected(null)}
          product={{
            id: selected.id,
            name: selected.name,
            price500g: selected.price500g,
            price1kg: selected.price1kg,
            image: selected.image ?? "/placeholder.png",
          }}
        />
      )}
    </div>
  );
}
