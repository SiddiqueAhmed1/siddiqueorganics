"use server";

import prisma from "../lib/prisma";

export interface SearchResult {
  id: string;
  name: string;
  slug: string;
  category: string;
  price500g: number;
  price1kg: number;
  image: string | null;
}

/**
 * Instant-search over name, description, category and price.
 * - Text: case-insensitive "contains" on name / description / category.
 * - Number (e.g. "650"): also matches products whose 500g or 1kg price
 *   equals it, or is within ±15% of it.
 * Returns a tiny payload (max 6 rows, only the fields the dropdown needs).
 */
export async function searchProducts(rawQuery: string): Promise<SearchResult[]> {
  const q = (rawQuery ?? "").trim().slice(0, 60);
  if (q.length < 2) return [];

  const or: Record<string, unknown>[] = [
    { name: { contains: q, mode: "insensitive" } },
    { description: { contains: q, mode: "insensitive" } },
    { category: { contains: q, mode: "insensitive" } },
  ];

  const num = Number(q.replace(/[৳,\s]/g, ""));
  if (Number.isFinite(num) && num > 0) {
    const lo = num * 0.85;
    const hi = num * 1.15;
    or.push({ price500g: { gte: lo, lte: hi } });
    or.push({ price1kg: { gte: lo, lte: hi } });
  }

  try {
    const rows = await prisma.product.findMany({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { OR: or as any },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        price500g: true,
        price1kg: true,
        images: true,
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      category: r.category,
      price500g: r.price500g,
      price1kg: r.price1kg,
      image: r.images?.[0] ?? null,
    }));
  } catch (error) {
    console.error("Product search failed:", error);
    return [];
  }
}
