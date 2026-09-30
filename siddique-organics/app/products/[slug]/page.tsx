import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ProductDetails from "@/components/ProductDetails";

// Refreshed at most once a minute (same policy as the home page).
export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

// cache() so generateMetadata + the page share a single DB query.
const getProduct = cache(async (slug: string) => {
  try {
    return await prisma.product.findUnique({ where: { slug } });
  } catch (error) {
    console.error("Failed to load product:", error);
    return null;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found | Siddique Organics" };
  return {
    title: `${product.name} | Siddique Organics`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <div className="w-full md:space-y-6 pb-10">
      {/* Breadcrumb */}
      <nav className="hidden md:flex text-xs sm:text-sm text-[#0E3A24]/60 items-center gap-2">
        <Link href="/" className="hover:text-[#3B7A42] transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-[#0E3A24] font-semibold line-clamp-1">
          {product.name}
        </span>
      </nav>

      {/* Main product card */}
      <section className="md:rounded-2xl md:bg-white md:border md:border-[#0E3A24]/10 md:shadow-sm md:p-6 lg:p-8">
        <ProductDetails
          product={{
            id: product.id,
            name: product.name,
            category: product.category,
            price500g: product.price500g,
            price1kg: product.price1kg,
            stock: product.stock,
            images: product.images,
            description: product.description,
          }}
        />
      </section>

      {/* Description */}
      <section className="hidden md:block rounded-2xl bg-white border border-[#0E3A24]/10 shadow-sm overflow-hidden">
        <div className="border-b border-[#0E3A24]/10 px-4 sm:px-8">
          <h2 className="inline-block py-4 text-sm sm:text-base font-bold uppercase tracking-wide text-[#0E3A24] border-b-4 border-[#3B7A42] -mb-px">
            Product Description
          </h2>
        </div>
        <div className="p-4 sm:p-8 bg-[#F9F8F3]/50">
          {product.description.trim() ? (
            <p className="text-sm sm:text-base leading-relaxed text-[#0E3A24]/80 whitespace-pre-line">
              {product.description}
            </p>
          ) : (
            <p className="text-sm text-[#0E3A24]/50">
              No description has been added for this product yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
