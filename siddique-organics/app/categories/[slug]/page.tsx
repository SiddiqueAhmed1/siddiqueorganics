import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCategory as getBengaliMeta } from "@/lib/categories";
import CategoryProducts, {
  type CategoryProduct,
} from "@/components/CategoryProducts";
import { SITE } from "@/lib/site";
import { toStoreVariant } from "@/lib/pricing";
import { Phone, MessageCircle, PackageX } from "lucide-react";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

// One cached query shared by generateMetadata + the page.
const getCategoryData = cache(async (slug: string) => {
  try {
    return await prisma.category.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        products: {
          where: { variants: { some: {} } }, // hide products that have no sellable variant
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
            variants: {
              orderBy: { price: "asc" },
              select: { id: true, size: true, price: true, discount: true, stock: true },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to load category products:", error);
    return null;
  }
});

const getAllCategories = cache(async () => {
  try {
    return await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    });
  } catch (error) {
    console.error("Failed to load categories:", error);
    return [];
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryData(slug);
  if (!category) return { title: "Category not found | Siddique Organics" };
  return { title: `${category.name} | Siddique Organics` };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [data, allCategories] = await Promise.all([
    getCategoryData(slug),
    getAllCategories(),
  ]);
  if (!data) notFound();

  // Bengali label is optional: used when lib/categories knows this slug, else the DB name.
  const category = {
    name: data.name,
    bn: getBengaliMeta(slug)?.bn ?? data.name,
  };
  const products: CategoryProduct[] = data.products.map((p) => ({
    ...p,
    variants: p.variants.map(toStoreVariant),
  }));
  const bnFont = {
    fontFamily: "var(--font-open-sans), var(--font-hind), sans-serif",
  };

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Breadcrumb */}
      <nav className="text-xs sm:text-sm text-[#0E3A24]/60 flex items-center gap-2">
        <Link href="/" className="hover:text-[#3B7A42] transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-[#0E3A24] font-semibold">{category.name}</span>
      </nav>

      {/* Title */}
      <div className="border-b border-[#0E3A24]/10 pb-3">
        <h1 className="text-lg sm:text-2xl font-bold text-[#0E3A24] uppercase tracking-wide">
          {category.name}
        </h1>
        <p className="text-sm text-[#3B7A42] font-bold" style={bnFont}>
          {category.bn}
        </p>
      </div>

      {/* Other categories */}
      <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        {allCategories.map((c) => (
          <Link
            key={c.slug}
            href={`/categories/${c.slug}`}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-xs sm:text-sm font-bold transition-colors ${
              c.slug === slug
                ? "bg-[#0E3A24] border-[#0E3A24] text-white"
                : "border-[#0E3A24]/20 text-[#0E3A24] hover:border-[#3B7A42] hover:text-[#3B7A42]"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        /* ---------- Empty category card (Bengali + English) ---------- */
        <div className="mx-auto max-w-xl rounded-2xl bg-white border border-[#0E3A24]/10 shadow-sm p-6 sm:p-10 text-center space-y-5">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#6C4E31]/10 flex items-center justify-center">
            <PackageX className="w-8 h-8 text-[#6C4E31]" />
          </div>

          <div className="space-y-1">
            <h2
              className="text-xl sm:text-2xl font-bold text-[#0E3A24]"
              style={bnFont}
            >
              দুঃখিত, এই মুহূর্তে স্টকে নেই
            </h2>
            <p className="text-lg font-extrabold text-[#6C4E31]">
              Currently Out of Stock
            </p>
          </div>

          <div className="space-y-2 text-sm text-[#0E3A24]/70">
            <p style={bnFont}>
              “{category.bn}” ক্যাটাগরির কোনো পণ্য এখন আমাদের কাছে নেই। খুব
              শিগগিরই নতুন স্টক আসবে, ইনশাআল্লাহ। অগ্রিম অর্ডার বা বিস্তারিত
              জানতে আমাদের সাথে যোগাযোগ করুন।
            </p>
            <p>
              We have no products in {category.name} right now. Fresh stock is
              coming soon — contact us to pre-order or ask about availability.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <a
              href={`https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
                `Hello, when will ${category.name} be back in stock?`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 rounded-xl bg-[#25D366] hover:bg-[#1fb857] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span style={bnFont}>হোয়াটসঅ্যাপ / WhatsApp</span>
            </a>
            <a
              href={SITE.phoneHref}
              className="h-11 rounded-xl border-2 border-[#0E3A24] text-[#0E3A24] hover:bg-[#F9F8F3] text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4" />
              {SITE.phoneDisplay}
            </a>
          </div>

          <Link
            href="/"
            className="inline-block text-sm font-bold text-[#3B7A42] hover:underline"
          >
            <span style={bnFont}>অন্যান্য পণ্য দেখুন</span> / Browse other
            products
          </Link>
        </div>
      ) : (
        <CategoryProducts products={products} />
      )}
    </div>
  );
}
