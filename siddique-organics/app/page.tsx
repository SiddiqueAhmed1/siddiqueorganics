import prisma from "../lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart, ArrowRight } from "lucide-react";
import FloatingCart from "@/components/FloatingCart";
import CartButtons from "@/components/CartButtons";

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
          <span className="text-sm text-[#0E3A24]/30 font-bold uppercase tracking-wider">
            No Image
          </span>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-2 left-2 bg-[#6C4E31] text-white font-extrabold text-[9px] sm:text-sm px-2 py-0.5 rounded-full shadow-sm">
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
            <span className="text-sm text-[#0E3A24]/50 font-bold">
              500g / 1kg
            </span>
            <span className="text-[#6C4E31] font-extrabold text-sm sm:text-lg">
              ৳{product.price500g} - ৳{product.price1kg}
            </span>
          </div>
          <button className="w-full h-9 sm:h-10 rounded-xl border border-[#0E3A24]/10 bg-[#0E3A24] text-white hover:bg-[#3B7A42] text-sm sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors duration-200">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-[#ffffff] space-y-12  pb-16">
      <section className="lg:mt-4 w-full h-full rounded-2xl sm:rounded-3xl flex items-center justify-center gap-3 text-center px-4 relative ">
        <div className="lg:w-[70%]">
          <Image
            src="/siddique-organics-sundarban-honey-raw-honey-pure-honey-healthy-lifestyle-khati-modhu-honey.png"
            alt="Siddique Organics"
            width={2300}
            height={350}
            className="object-contain w-full h-full rounded-md"
            priority
          />
        </div>
        <div className="hidden lg:w-[30%] lg:block ">
          <Image
            src="/photos/siddique-organics-banner.jpg"
            alt="Siddique Organics"
            width={2400}
            height={500}
            className="object-contain w-full h-[390px] rounded-md"
            priority
          />
        </div>
      </section>

      {/* PRESETS IMAGE-PLACEHOLDER SHOP BY CATEGORY CARD UI GRID */}
      {/* 2. DYNAMIC PRESETS SHOP BY CATEGORY CARD UI GRID */}
      <section className="space-y-4">
        <div className="border-b border-[#0E3A24]/10 pb-3">
          <h2 className="text-base sm:text-xl font-extrabold text-[#0E3A24] uppercase tracking-wide font-serif">
            Shop by Category
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            {
              name: "Pure Honey",
              slug: "honey",
              localImg: "/photos/category-honey.jpg",
            },
            { name: "Premium Oils", slug: "oil", localImg: "/mustard-oil.jpg" },
            { name: "Dates", slug: "dates", localImg: "/photos/dates.jpg" },
            {
              name: "Organic Nuts",
              slug: "nuts",
              localImg: "/photos/nuts-cashew-nuts-almonds.jpg",
            },
            {
              name: "Healthy Seeds",
              slug: "seeds",
              localImg: "/photos/organics-seeds.jpg",
            },
          ].map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group p-3 sm:p-5 rounded-2xl bg-white border border-[#0E3A24]/5 hover:border-[#3B7A42]/30 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute right-[-10px] bottom-[-10px] w-14 h-14 rounded-full bg-[#3B7A42]/5 group-hover:bg-[#3B7A42]/10 transition-colors"></div>
              <div className="space-y-3 sm:space-y-4 relative z-10 w-full">
                <div className="w-full h-24 sm:h-32 bg-[#F9F8F3] rounded-xl relative overflow-hidden flex items-center justify-center border border-[#0E3A24]/5">
                  <Image
                    src={cat.localImg}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-[#0E3A24] text-xs sm:text-base group-hover:text-[#3B7A42] transition-colors line-clamp-1 font-serif">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] sm:text-[11px] text-[#3B7A42] font-bold flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    Explore{" "}
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 1: TOP SELLING PRODUCTS ARCHITECTURE (HIGH-UX 2-COLUMN MOBILE GRID) */}
      <section className="space-y-4">
        <div className="border-b border-[#0E3A24]/10 pb-3">
          <h2 className="text-base sm:text-xl font-extrabold text-[#0E3A24] uppercase tracking-wide">
            Top Selling Products
          </h2>
        </div>

        {/* Dynamic Fallback: If database is empty, instantly render premium responsive mock matrix */}
        {products.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              {
                id: "mock-1",
                name: "সুন্দরবনের খাঁটি মধু | Sundarban Honey",
                price500g: 650,
                price1kg: 1200,
                localImg: "/photos/category-honey.jpg",
              },
              {
                id: "mock-2",
                name: "Extra Virgin Wooden Pressed Mustard Oil",
                price500g: 220,
                price1kg: 400,
                localImg: "/mustard-oil.jpg",
              },
              {
                id: "mock-3",
                name: "Premium Premium Saudi Ajwa Dates",
                price500g: 450,
                price1kg: 850,
                localImg: "/photos/dates.jpg",
              },
              {
                id: "mock-4",
                name: "Organic Roasted Cashew Nuts Premium",
                price500g: 550,
                price1kg: 1050,
                localImg: "/photos/nuts-cashew-nuts-almonds.jpg",
              },
            ].map((mockProd) => (
              <div
                key={mockProd.id}
                className="group rounded-2xl bg-white border border-[#0E3A24]/5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
              >
                <div className="w-full aspect-square bg-[#F9F8F3] relative overflow-hidden flex items-center justify-center p-4">
                  <Image
                    src={mockProd.localImg}
                    alt={mockProd.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 bg-[#6C4E31] text-white font-extrabold text-[9px] sm:text-sm px-2 py-0.5 rounded-full shadow-sm">
                    Hot
                  </span>
                </div>
                <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between gap-2 sm:gap-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-[#0E3A24] text-md">
                      {mockProd.name}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5 border-t border-[#F9F8F3] pt-2">
                      <span className="text-[10px] sm:text-sm text-[#0E3A24]/50 font-bold">
                        500g / 1kg
                      </span>
                      <span className="text-[#6C4E31] font-extrabold text-sm sm:text-base">
                        ৳{mockProd.price500g} - ৳{mockProd.price1kg}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <CartButtons
                        productId={mockProd.id}
                        productName={mockProd.name}
                        price500g={mockProd.price500g}
                      />
                      <div className="right-0 top-1/2 -translate-y-1/2)">
                        <FloatingCart />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {topSelling.map(renderProductCard)}
          </div>
        )}
      </section>

      {/* SECTION 2: PREMIUM HONEY PRODUCTS */}
      <section className="space-y-4">
        <div className="border-b border-[#0E3A24]/10 pb-3">
          <h2 className="text-base sm:text-xl font-extrabold text-[#0E3A24] uppercase tracking-wide">
            Premium Honey
          </h2>
        </div>
        {products.filter((p) => p.category === "honey").length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              {
                id: "honey-m1",
                name: "Khati Sundarban Khalisha Modhu",
                price500g: 650,
                price1kg: 1200,
                localImg: "/photos/category-honey.jpg",
              },
              {
                id: "honey-m2",
                name: "Premium Black Seed Flower Honey",
                price500g: 750,
                price1kg: 1400,
                localImg: "/photos/category-honey.jpg",
              },
            ].map((mockProd) => (
              <div
                key={mockProd.id}
                className="group rounded-2xl bg-white border border-[#0E3A24]/5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
              >
                <div className="w-full aspect-square bg-[#F9F8F3] relative overflow-hidden flex items-center justify-center p-4">
                  <Image
                    src={mockProd.localImg}
                    alt={mockProd.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 bg-[#6C4E31] text-white font-extrabold text-[9px] sm:text-sm px-2 py-0.5 rounded-full shadow-sm">
                    Hot
                  </span>
                </div>
                <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between gap-2 sm:gap-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-[#0E3A24] text-md">
                      {mockProd.name}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5 border-t border-[#F9F8F3] pt-2">
                      <span className="text-[10px] sm:text-sm text-[#0E3A24]/50 font-bold">
                        500g / 1kg
                      </span>
                      <span className="text-[#6C4E31] font-extrabold text-sm sm:text-base">
                        ৳{mockProd.price500g} - ৳{mockProd.price1kg}
                      </span>
                    </div>
                    <button className="w-full h-10 sm:h-10 rounded-xl border border-[#0E3A24]/10 bg-[#0E3A24] text-white hover:bg-[#3B7A42] text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors duration-200">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {honeyProducts.map(renderProductCard)}
          </div>
        )}
      </section>

      {/* SECTION 3: ORGANIC NUTS PRODUCTS */}
      <section className="space-y-4">
        <div className="border-b border-[#0E3A24]/10 pb-3">
          <h2 className="text-base sm:text-xl font-extrabold text-[#0E3A24] uppercase tracking-wide">
            Organic Nuts
          </h2>
        </div>
        {products.filter((p) => p.category === "nuts" || p.category === "nut")
          .length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              {
                id: "nut-m1",
                name: "Premium Roasted Cashew Nuts",
                price500g: 550,
                price1kg: 1050,
                localImg: "/photos/nuts-cashew-nuts-almonds.jpg",
              },
              {
                id: "nut-m2",
                name: "Premium Quality California Almonds",
                price500g: 500,
                price1kg: 950,
                localImg: "/photos/nuts-cashew-nuts-almonds.jpg",
              },
            ].map((mockProd) => (
              <div
                key={mockProd.id}
                className="group rounded-2xl bg-white border border-[#0E3A24]/5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
              >
                <div className="w-full aspect-square bg-[#F9F8F3] relative overflow-hidden flex items-center justify-center p-4">
                  <Image
                    src={mockProd.localImg}
                    alt={mockProd.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between gap-2 sm:gap-4">
                  <h3 className="font-bold text-[#0E3A24] text-sm sm:text-sm line-clamp-2 min-h-[40px] leading-tight">
                    {mockProd.name}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline border-t border-[#F9F8F3] pt-2">
                      <span className="text-[10px] text-[#0E3A24]/50 font-bold">
                        500g / 1kg
                      </span>
                      <span className="text-[#6C4E31] font-extrabold text-sm sm:text-base">
                        ৳{mockProd.price500g} - ৳{mockProd.price1kg}
                      </span>
                    </div>
                    <button className="w-full h-10 sm:h-10 rounded-xl bg-[#0E3A24] text-white text-sm font-bold flex items-center justify-center gap-1.5">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {nutsProducts.map(renderProductCard)}
          </div>
        )}
      </section>

      {/* SECTION 4: PREMIUM OILS PRODUCTS */}
      <section className="space-y-4">
        <div className="border-b border-[#0E3A24]/10 pb-3">
          <h2 className="text-base sm:text-xl font-extrabold text-[#0E3A24] uppercase tracking-wide">
            Premium Oils
          </h2>
        </div>

        {oilsProducts.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              {
                id: "oil-m1",
                name: "Khati Sorishar Tel (Wooden Pressed)",
                price500g: 220,
                price1kg: 400,
                localImg: "/mustard-oil.jpg",
              },
              {
                id: "oil-m2",
                name: "Premium Extra Virgin Coconut Oil",
                price500g: 450,
                price1kg: 850,
                localImg: "/mustard-oil.jpg",
              },
            ].map((mockProd) => (
              <div
                key={mockProd.id}
                className="group rounded-2xl bg-white border border-[#0E3A24]/5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
              >
                <div className="w-full aspect-square bg-[#F9F8F3] relative overflow-hidden flex items-center justify-center p-4">
                  <Image
                    src={mockProd.localImg}
                    alt={mockProd.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between gap-2 sm:gap-4">
                  <h3 className="font-bold text-[#0E3A24] text-sm sm:text-sm line-clamp-2 min-h-[40px] leading-tight">
                    {mockProd.name}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline border-t border-[#F9F8F3] pt-2">
                      <span className="text-[10px] text-[#0E3A24]/50 font-bold">
                        500g / 1kg
                      </span>
                      <span className="text-[#6C4E31] font-extrabold text-sm sm:text-base">
                        ৳{mockProd.price500g} - ৳{mockProd.price1kg}
                      </span>
                    </div>
                    <button className="w-full h-10 sm:h-10 rounded-xl border border-[#0E3A24]/10 bg-[#0E3A24] text-white hover:bg-[#3B7A42] text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors duration-200">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {oilsProducts.map(renderProductCard)}
          </div>
        )}
      </section>
    </div>
  );
}
