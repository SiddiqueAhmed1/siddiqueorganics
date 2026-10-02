import prisma from "@/lib/prisma";
import ProductManager from "@/components/admin/ProductManager";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        images: true,
        category: { select: { id: true, name: true } },
        variants: {
          orderBy: { price: "asc" },
          select: { id: true, size: true, price: true, stock: true, sku: true },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Products</h1>
      <ProductManager products={products} categories={categories} />
    </div>
  );
}
