import prisma from "../lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart } from "lucide-react";

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price500g: number;
  price1kg: number;
  stock: number;
  images: string[];
}

async function fetchStoreProducts(): Promise<ProductData[]> {
  try {
    const records = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return records.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      category: item.category
        ? item.category.trim().toLowerCase()
        : "uncategorized",
      price500g: item.price500g,
      price1kg: item.price1kg,
      stock: item.stock,
      images: item.images,
    }));
  } catch (error) {
    console.error("Failed to extract active store products:", error);
    return [];
  }
}

export default async function HomePage() {
  const products = await fetchStoreProducts();

  const topSelling = products.slice(0, 4);
  const honeyProducts = products.filter((p) => p.category === "honey");
  const nutsProducts = products.filter(
    (p) => p.category === "nuts" || p.category === "nut",
  );
  const oilsProducts = products.filter(
    (p) => p.category === "oil" || p.category === "oils",
  );

  const renderProductCard = (product: ProductData) => (
    <div
      key={product.id}
      className="group rounded-2xl bg-white border border-[#0E3A24]/5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
    >
      <div className="w-full aspect-square bg-[#F9F8F3] relative overflow-hidden flex items-center justify-center p-4">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="text-xs text-[#0E3A24]/30 font-bold uppercase tracking-wider">
            No Image
          </span>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-2 left-2 bg-[#6C4E31] text-white font-extrabold text-[9px] sm:text-xs px-2 py-0.5 rounded-full shadow-sm">
            Low Stock
          </span>
        )}
      </div>
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between gap-2 sm:gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-0.5 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-current" />
            ))}
          </div>
          <h3 className="font-bold text-[#0E3A24] text-sm sm:text-base line-clamp-2 min-h-[40px] leading-tight">
            {product.name}
          </h3>
        </div>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5 border-t border-[#F9F8F3] pt-2">
            <span className="text-xs text-[#0E3A24]/50 font-bold">
              500g / 1kg
            </span>
            <span className="text-[#6C4E31] font-extrabold text-sm sm:text-lg">
              ৳{product.price500g} - ৳{product.price1kg}
            </span>
          </div>
          <button className="w-full h-9 sm:h-10 rounded-xl border border-[#0E3A24]/10 bg-[#0E3A24] text-white hover:bg-[#3B7A42] text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors duration-200">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Order Now</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-[#F9F8F3] space-y-12 sm:space-y-16 pb-16">
      <section className="w-full h-[220px] sm:h-[400px] rounded-2xl sm:rounded-3xl bg-[#0E3A24] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden shadow-md">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          <Image
            src="/siddique-organics-sundarban-honey-raw-honey-pure-honey-healthy-lifestyle-khati-modhu-honey.png"
            alt="Siddique Organics"
            width={1400}
            height={220}
            className="object-contain w-full h-[220px] object-left transition-transform group-hover:scale-105"
            priority
          />
        </h1>
      </section>

      <section className="space-y-4">
        <div className="border-b border-[#0E3A24]/10 pb-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#0E3A24] uppercase tracking-wide">
            Top Selling Products
          </h2>
        </div>
        {topSelling.length === 0 ? (
          <p className="text-sm text-[#0E3A24]/40 font-medium">
            No items found inside records.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {topSelling.map(renderProductCard)}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="border-b border-[#0E3A24]/10 pb-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#0E3A24] uppercase tracking-wide">
            Premium Honey
          </h2>
        </div>
        {honeyProducts.length === 0 ? (
          <p className="text-sm text-[#0E3A24]/40 font-medium">
            No items available under honey category logs.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {honeyProducts.map(renderProductCard)}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="border-b border-[#0E3A24]/10 pb-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#0E3A24] uppercase tracking-wide">
            Organic Nuts
          </h2>
        </div>
        {nutsProducts.length === 0 ? (
          <p className="text-sm text-[#0E3A24]/40 font-medium">
            No items available under nuts category logs.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {nutsProducts.map(renderProductCard)}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="border-b border-[#0E3A24]/10 pb-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#0E3A24] uppercase tracking-wide">
            Premium Oils
          </h2>
        </div>
        {oilsProducts.length === 0 ? (
          <p className="text-sm text-[#0E3A24]/40 font-medium">
            No items available under oils category logs.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {oilsProducts.map(renderProductCard)}
          </div>
        )}
      </section>

      <footer className="w-full border-t border-[#0E3A24]/10 pt-10 mt-12 bg-transparent text-[#0E3A24]/70">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="space-y-3">
            <h4 className="font-extrabold text-[#0E3A24] text-base tracking-tight">
              Siddique Organics
            </h4>
            <p className="text-xs sm:text-sm leading-relaxed max-w-xs mx-auto md:mx-0 text-[#0E3A24]/60 font-medium">
              Delivering unadulterated, farm-fresh organic food metrics straight
              across all domestic divisions inside Bangladesh.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-[#0E3A24] text-sm tracking-wider uppercase">
              Quick Policies
            </h4>
            <ul className="text-xs sm:text-sm font-semibold space-y-1.5">
              <li>
                <Link
                  href="/terms"
                  className="hover:text-[#3B7A42] transition-colors"
                >
                  Terms of Operations
                </Link>
              </li>
              <li>
                <Link
                  href="/refunds"
                  className="hover:text-[#3B7A42] transition-colors"
                >
                  Return & Refund Policy
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-[#0E3A24] text-sm tracking-wider uppercase">
              Contact Channels
            </h4>
            <p className="text-xs sm:text-sm font-medium text-[#0E3A24]/60">
              Email: support@siddiqueorganics.com
            </p>
            <p className="text-xs sm:text-sm font-bold text-[#6C4E31]">
              Hotline: +880 1700-000000
            </p>
          </div>
        </div>
        <div className="w-full text-center border-t border-[#0E3A24]/5 mt-8 pt-6 text-xs text-[#0E3A24]/40 font-medium">
          © {new Date().getFullYear()} Siddique Organics Ltd. All corporate
          rights reserved.
        </div>
      </footer>
    </div>
  );
}
