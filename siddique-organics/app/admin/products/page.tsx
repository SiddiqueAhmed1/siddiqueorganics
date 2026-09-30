import prisma from "@/lib/prisma";
import ProductManager from "@/components/admin/ProductManager";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, slug: true, description: true, category: true, price500g: true, price1kg: true, stock: true, images: true },
  });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Products</h1>
      <ProductManager products={products} />
    </div>
  );
}
