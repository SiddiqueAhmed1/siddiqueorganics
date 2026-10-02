import prisma from "@/lib/prisma";
import CategoryManager from "@/components/admin/CategoryManager";

export default async function CategoriesPage() {
  const rows = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      _count: { select: { products: true } },
    },
  });
  const categories = rows.map(({ _count, ...c }) => ({
    ...c,
    productCount: _count.products,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Categories</h1>
      <CategoryManager categories={categories} />
    </div>
  );
}
