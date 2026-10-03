"use server";

import prisma from "../lib/prisma";
import { unstable_cache } from "next/cache";

export interface SearchProductItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  image: string | null;
}

// প্রোডাক্ট লিস্ট সার্ভার মেমোরিতে ১ ঘণ্টার জন্য ক্যাশ থাকবে
export const getAllSearchableProducts = unstable_cache(
  async (): Promise<SearchProductItem[]> => {
    try {
      const rows = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          images: true,
          category: {
            select: { name: true },
          },
          variants: {
            orderBy: { price: "asc" },
            select: { price: true },
          },
        },
      });

      return rows.map((r) => {
        const prices = r.variants.map((v) => v.price);
        return {
          id: r.id,
          name: r.name,
          slug: r.slug,
          category: r.category?.name ?? "General",
          minPrice: prices.length > 0 ? Math.min(...prices) : 0,
          maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
          image: r.images?.[0] ?? null,
        };
      });
    } catch (e) {
      console.error("Cache load failed:", e);
      return [];
    }
  },
  ["searchable-products-index"],
  { revalidate: 3600 },
);
