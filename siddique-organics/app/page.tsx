import prisma from "../lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart, ArrowRight } from "lucide-react";
import CartButtons from "@/components/CartButtons";
import HeroSlider from "@/components/HeroSlider";

// Home page is statically cached and refreshed at most once a minute.
// (Admin create/update already call revalidatePath("/") for instant refresh.)
export const revalidate = 60;

// Left banner slides. Add / reorder / swap images here — any file in /public.
const HERO_SLIDES = [
  {
    src: "/siddique-organics-sundarban-honey-raw-honey-pure-honey-healthy-lifestyle-khati-modhu-honey.webp",
    alt: "Siddique Organics Sundarban pure honey",
  },
  { src: "/photos/siddique-organics-banner2.webp", alt: "Pure raw honey" },
  { src: "/photos/nuts-cashew-nuts-almonds.webp", alt: "Organic nuts" },
];

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
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        price500g: true,
        price1kg: true,
        stock: true,
        images: true,
      },
    });
    return records.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: "",
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

  const renderProductCard = (product: ProductData, rank?: number) => (
    <div
      key={product.id}
      data-product-card
      className={`group rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden relative ${
        rank ? "border-2 border-amber-400/50" : "border border-[#0E3A24]/5"
      }`}
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
        {rank && (
          <span className="absolute top-2 right-2 bg-amber-500 text-white font-extrabold text-[9px] sm:text-xs px-2 py-0.5 rounded-full shadow-sm">
            #{rank} Best Seller
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

  return (
    <div className="w-full bg-[#ffffff] space-y-12  pb-16">
      <section className="lg:mt-4 w-full h-full rounded-2xl sm:rounded-3xl flex items-center justify-center gap-3 text-center px-4 relative ">
        <div className="w-full lg:w-[70%]">
          <HeroSlider slides={HERO_SLIDES} interval={4000} />
        </div>
        <div className="hidden lg:w-[30%] lg:block hover:scale-105 transition-all">
          <Image
            src="/photos/siddique-organics-banner.webp"
            alt="Siddique Organics"
            width={2400}
            height={500}
            sizes="30vw"
            className="object-contain w-full h-[390px] rounded-md "
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
              localImg: "/photos/category-honey.webp",
            },
            {
              name: "Premium Oils",
              slug: "oil",
              localImg: "/mustard-oil.webp",
            },
            { name: "Dates", slug: "dates", localImg: "/photos/dates.webp" },
            {
              name: "Organic Nuts",
              slug: "nuts",
              localImg: "/photos/nuts-cashew-nuts-almonds.webp",
            },
            {
              name: "Healthy Seeds",
              slug: "seeds",
              localImg: "/photos/organics-seeds.webp",
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
          <div className="flex gap-3 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[
              {
                id: "mock-1",
                name: "সুন্দরবনের খাঁটি মধু | Sundarban Honey",
                price500g: 650,
                price1kg: 1200,
                localImg: "/photos/category-honey.webp",
              },
              {
                id: "mock-2",
                name: "Extra Virgin Wooden Pressed Mustard Oil",
                price500g: 220,
                price1kg: 400,
                localImg: "/mustard-oil.webp",
              },
              {
                id: "mock-3",
                name: "Premium Premium Saudi Ajwa Dates",
                price500g: 450,
                price1kg: 850,
                localImg: "/photos/dates.webp",
              },
              {
                id: "mock-4",
                name: "Organic Roasted Cashew Nuts Premium",
                price500g: 550,
                price1kg: 1050,
                localImg: "/photos/nuts-cashew-nuts-almonds.webp",
              },
            ].map((mockProd, i) => (
              <div
                key={mockProd.id}
                data-product-card
                className="group rounded-2xl bg-white border-2 border-amber-400/50 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden relative shrink-0 w-[65%] xs:w-[45%] snap-start sm:w-auto"
              >
                <div className="w-full aspect-square bg-[#F9F8F3] relative overflow-hidden flex items-center justify-center p-4">
                  <Image
                    src={mockProd.localImg}
                    alt={mockProd.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-2 right-2 bg-amber-500 text-white font-extrabold text-[9px] sm:text-xs px-2 py-0.5 rounded-full shadow-sm">
                    #{i + 1} Best Seller
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
                    <CartButtons
                      productId={mockProd.id}
                      productName={mockProd.name}
                      price500g={mockProd.price500g}
                      price1kg={mockProd.price1kg}
                      image={mockProd.localImg}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-3 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {topSelling.map((product, i) => (
              <div
                key={product.id}
                className="shrink-0 w-[65%] xs:w-[45%] snap-start sm:w-auto"
              >
                {renderProductCard(product, i + 1)}
              </div>
            ))}
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
                localImg: "/photos/category-honey.webp",
              },
              {
                id: "honey-m2",
                name: "Premium Black Seed Flower Honey",
                price500g: 750,
                price1kg: 1400,
                localImg: "/photos/category-honey.jwebp",
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
                    <CartButtons
                      productId={mockProd.id}
                      productName={mockProd.name}
                      price500g={mockProd.price500g}
                      price1kg={mockProd.price1kg}
                      image={mockProd.localImg}
                    />
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
                localImg: "/photos/nuts-cashew-nuts-almonds.webp",
              },
              {
                id: "nut-m2",
                name: "Premium Quality California Almonds",
                price500g: 500,
                price1kg: 950,
                localImg: "/photos/nuts-cashew-nuts-almonds.webp",
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
                    <CartButtons
                      productId={mockProd.id}
                      productName={mockProd.name}
                      price500g={mockProd.price500g}
                      price1kg={mockProd.price1kg}
                      image={mockProd.localImg}
                    />
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
                localImg: "/mustard-oil.webp",
              },
              {
                id: "oil-m2",
                name: "Premium Extra Virgin Coconut Oil",
                price500g: 450,
                price1kg: 850,
                localImg: "/mustard-oil.webp",
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
                    <CartButtons
                      productId={mockProd.id}
                      productName={mockProd.name}
                      price500g={mockProd.price500g}
                      price1kg={mockProd.price1kg}
                      image={mockProd.localImg}
                    />
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
