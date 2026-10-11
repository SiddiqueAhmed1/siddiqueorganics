import prisma from "../lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import HeroSlider from "@/components/HeroSlider";
import { toStoreVariant } from "@/lib/pricing";
import {
  ProductCard,
  ClassicProductCard,
  type CardProduct,
} from "@/components/ProductCard";

// Home page is statically cached and refreshed at most once a minute.
// (Admin create/update already call revalidatePath("/") for instant refresh.)
export const revalidate = 60;

// Left banner slides. Add / reorder / swap images here — any file in /public.
const HERO_SLIDES = [
  {
    src: "/photos/siddique-organics-sundarban-honey-raw-honey-pure-honey-healthy-lifestyle-khati-modhu-honey.webp",
    alt: "Siddique Organics Sundarban pure honey",
  },
  { src: "/photos/siddique-organics-banner2.webp", alt: "Pure raw honey" },
];

// Shop-by-category tiles (desktop grid + mobile chip row share this list).
const CATEGORY_TILES = [
  {
    name: "Pure Honey",
    slug: "honey",
    img: "/category/siddique-organics-honey.webp",
  },
  {
    name: "Premium Oils",
    slug: "oil",
    img: "/category/siddique-organics-mustard-oil.webp",
  },
  {
    name: "Dates",
    slug: "dates",
    img: "/category/siddique-organics-dates.webp",
  },
  {
    name: "Organic Nuts",
    slug: "nuts",
    img: "/category/siddique-organics-cashew-almonds.webp",
  },
  {
    name: "Healthy Seeds",
    slug: "seeds",
    img: "/category/siddique-organics-seeds.webp",
  },
  {
    name: "Khejur Gur",
    slug: "khejur-gur",
    img: "/category/siddique-organics-khejur-gur.webp",
  },
];

// Shown only while the database has no products at all (fresh install).
// They use the category images that really exist in /public/category.
const mock = (
  id: string,
  name: string,
  price500g: number,
  price1kg: number,
  img: string,
): CardProduct => ({
  id,
  name,
  slug: "",
  images: [img],
  variants: [
    { id: `${id}-500g`, size: "500g", price: price500g, stock: 10 },
    { id: `${id}-1kg`, size: "1kg", price: price1kg, stock: 10 },
  ],
});

const MOCKS = {
  top: [
    mock(
      "mock-1",
      "সুন্দরবনের খাঁটি মধু | Sundarban Honey",
      650,
      1200,
      "/category/siddique-organics-honey.webp",
    ),
    mock(
      "mock-2",
      "Extra Virgin Wooden Pressed Mustard Oil",
      220,
      400,
      "/category/siddique-organics-mustard-oil.webp",
    ),
    mock(
      "mock-3",
      "Premium Saudi Ajwa Dates",
      450,
      850,
      "/category/siddique-organics-dates.webp",
    ),
    mock(
      "mock-4",
      "Organic Roasted Cashew Nuts Premium",
      550,
      1050,
      "/category/siddique-organics-cashew-almonds.webp",
    ),
  ],
  honey: [
    mock(
      "honey-m1",
      "Khati Sundarban Khalisha Modhu",
      650,
      1200,
      "/category/siddique-organics-honey.webp",
    ),
    mock(
      "honey-m2",
      "Premium Black Seed Flower Honey",
      750,
      1400,
      "/category/siddique-organics-honey.webp",
    ),
  ],
  nuts: [
    mock(
      "nut-m1",
      "Premium Roasted Cashew Nuts",
      550,
      1050,
      "/category/siddique-organics-cashew-almonds.webp",
    ),
    mock(
      "nut-m2",
      "Premium Quality California Almonds",
      500,
      950,
      "/category/siddique-organics-cashew-almonds.webp",
    ),
  ],
  oils: [
    mock(
      "oil-m1",
      "Khati Sorishar Tel (Wooden Pressed)",
      220,
      400,
      "/category/siddique-organics-mustard-oil.webp",
    ),
    mock(
      "oil-m2",
      "Premium Extra Virgin Coconut Oil",
      450,
      850,
      "/category/siddique-organics-mustard-oil.webp",
    ),
  ],
};

interface ProductData extends CardProduct {
  categoryId: string;
}

async function fetchStoreProducts(): Promise<ProductData[]> {
  try {
    const records = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        categoryId: true,
        images: true,
        variants: {
          orderBy: { price: "asc" },
          select: {
            id: true,
            size: true,
            price: true,
            discount: true,
            stock: true,
          },
        },
      },
    });
    // Products without any variant can't be sold, so they are hidden from the storefront.
    return records
      .filter((item) => item.variants.length > 0)
      .map((item) => ({
        ...item,
        variants: item.variants.map(toStoreVariant),
      }));
  } catch (error) {
    console.error("Failed to extract active store products:", error);
    return [];
  }
}

async function fetchCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, image: true },
    });
  } catch (error) {
    console.error("Failed to load categories:", error);
    return [];
  }
}

const GRID = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6";

function SectionHeading({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-end justify-between border-b border-[#0E3A24]/10 pb-3">
      <h2 className="text-lg sm:text-xl font-bold text-[#0E3A24] md:uppercase md:tracking-wide">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#3B7A42] hover:underline"
        >
          See all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}

function ProductSection({
  title,
  href,
  items,
  fallback,
}: {
  title: string;
  href: string;
  items: CardProduct[];
  fallback: CardProduct[];
}) {
  const list = items.length > 0 ? items : fallback;
  return (
    <section className="space-y-4">
      <SectionHeading title={title} href={href} />
      <div className={GRID}>
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    fetchStoreProducts(),
    fetchCategories(),
  ]);

  // Category tiles come from the database; the static list is only a fresh-install fallback.
  const tiles =
    categories.length > 0
      ? categories.map((c) => ({
          name: c.name,
          slug: c.slug,
          img: c.image ?? "/placeholder.png",
        }))
      : CATEGORY_TILES;

  const topSelling = products.slice(0, 4);
  const topList = products.length === 0 ? MOCKS.top : topSelling;
  const sections =
    products.length === 0
      ? [
          {
            key: "honey",
            title: "Premium Honey",
            href: "/categories/honey",
            items: MOCKS.honey,
          },
          {
            key: "nuts",
            title: "Organic Nuts",
            href: "/categories/nuts",
            items: MOCKS.nuts,
          },
          {
            key: "oil",
            title: "Premium Oils",
            href: "/categories/oil",
            items: MOCKS.oils,
          },
        ]
      : categories
          .map((c) => ({
            key: c.id,
            title: c.name,
            href: `/categories/${c.slug}`,
            items: products.filter((p) => p.categoryId === c.id).slice(0, 8),
          }))
          .filter((sec) => sec.items.length > 0);

  return (
    <div className="w-full space-y-9 md:space-y-12 pb-10 md:pb-16">
      <section className="lg:mt-4 w-full h-full rounded-2xl sm:rounded-3xl flex items-center justify-center gap-3 text-center relative">
        <div className="w-full lg:w-[70%] overflow-hidden rounded-2xl">
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

      {/* SHOP BY CATEGORY — mobile: scrolling icon chips, desktop: card grid */}
      <section className="space-y-4">
        <SectionHeading title="Shop by Category" />

        {/* Mobile chips (design: rounded icon tiles with label underneath) */}
        <div className="md:hidden -mx-4 px-4 flex gap-4 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          {tiles.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="shrink-0 w-[68px] flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <span className="relative block scale- w-[62px] h-[62px] rounded-2xl overflow-hidden bg-white shadow-[0_2px_12px_rgba(14,58,36,0.1)] border border-[#0E3A24]/5">
                <Image
                  src={cat.img}
                  alt={cat.name}
                  fill
                  sizes="62px"
                  className="object-cover"
                />
              </span>
              <span className="text-[11px] font-semibold text-[#0E3A24] text-center leading-tight line-clamp-2">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Desktop / tablet grid (unchanged design) */}
        <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-4">
          {tiles.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group p-5 rounded-2xl bg-white border border-[#0E3A24]/5 hover:border-[#3B7A42]/20 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              <div className="space-y-4 w-full flex flex-col justify-between h-full">
                <div className="w-full aspect-[4/3] bg-white rounded-xl relative overflow-hidden flex items-center justify-center border border-gray-100">
                  <Image
                    src={cat.img}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 1024px) 33vw, 16vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="pt-1 flex flex-col items-start">
                  <h3 className="font-normal text-[#0E3A24] text-lg group-hover:text-[#3B7A42] transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-500 font-medium transition-colors group-hover:text-[#3B7A42]">
                    <span>Explore</span>
                    <span className="transform transition-transform duration-200 group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TOP SELLING — desktop keeps the ORIGINAL card, mobile uses new grid */}
      <section className="space-y-4">
        <SectionHeading title="Top Selling Products" />

        <div className="md:hidden grid grid-cols-2 gap-3">
          {topList.map((p, i) => (
            <ProductCard key={p.id} product={p} rank={i + 1} />
          ))}
        </div>

        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {topList.map((p, i) => (
            <ClassicProductCard key={p.id} product={p} rank={i + 1} />
          ))}
        </div>
      </section>

      {sections.map((sec) => (
        <ProductSection
          key={sec.key}
          title={sec.title}
          href={sec.href}
          items={sec.items}
          fallback={[]}
        />
      ))}
    </div>
  );
}
