import Link from "next/link";
import prisma from "@/lib/prisma";
import StockInput from "@/components/admin/StockInput";

export const dynamic = "force-dynamic";

const LOW_STOCK = 5;

const FILTERS = [
  { key: "all", label: "All sizes" },
  { key: "low", label: `Low stock (≤${LOW_STOCK})` },
  { key: "out", label: "Out of stock" },
] as const;

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const active = filter === "low" || filter === "out" ? filter : "all";
  const where =
    active === "out"
      ? { stock: 0 }
      : active === "low"
        ? { stock: { lte: LOW_STOCK } }
        : {};

  const [variants, units, outCount, lowCount, total] = await Promise.all([
    prisma.productVariant.findMany({
      where,
      orderBy: [{ stock: "asc" }, { product: { name: "asc" } }],
      select: {
        id: true,
        size: true,
        sku: true,
        price: true,
        discount: true,
        stock: true,
        product: {
          select: { name: true, category: { select: { name: true } } },
        },
      },
    }),
    prisma.productVariant.aggregate({ _sum: { stock: true } }),
    prisma.productVariant.count({ where: { stock: 0 } }),
    prisma.productVariant.count({ where: { stock: { lte: LOW_STOCK } } }),
    prisma.productVariant.count(),
  ]);

  const card = "rounded-xl bg-white border border-[#0E3A24]/10 shadow-sm";
  const summary = [
    { label: "Sizes tracked", value: total },
    { label: "Units in stock", value: units._sum.stock ?? 0 },
    { label: "Low stock", value: lowCount },
    { label: "Out of stock", value: outCount },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inventory</h1>
        <p className="text-sm text-[#0E3A24]/60">
          Stock per size. Edit the number and press Save.
        </p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {summary.map((s) => (
          <div key={s.label} className={`${card} p-5`}>
            <p className="text-xs text-[#0E3A24]/60">{s.label}</p>
            <p className="text-xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/admin/inventory" : `/admin/inventory?filter=${f.key}`}
            className={`h-9 inline-flex items-center rounded-full px-4 text-sm font-medium border ${
              active === f.key
                ? "bg-[#0E3A24] text-white border-[#0E3A24]"
                : "bg-white text-[#0E3A24] border-[#0E3A24]/20 hover:border-[#0E3A24]/50"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className={`${card} overflow-x-auto`}>
        <table className="w-full text-sm">
          <thead className="bg-[#0E3A24] text-white text-left">
            <tr>
              {["Product", "Category", "Size", "SKU", "Price", "Stock"].map((h) => (
                <th key={h} className="px-4 py-2 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {variants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-[#0E3A24]/60">
                  No sizes match this filter.
                </td>
              </tr>
            )}
            {variants.map((v) => (
              <tr key={v.id} className="border-t border-[#0E3A24]/10 align-middle">
                <td className="px-4 py-2 font-medium">{v.product.name}</td>
                <td className="px-4 py-2">{v.product.category.name}</td>
                <td className="px-4 py-2">{v.size}</td>
                <td className="px-4 py-2 text-xs text-[#0E3A24]/60">{v.sku}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className="font-semibold text-[#6C4E31]">
                    ৳{v.price - v.discount}
                  </span>
                  {v.discount > 0 && (
                    <span className="ml-1.5 text-xs text-[#0E3A24]/40 line-through">
                      ৳{v.price}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <StockInput id={v.id} initial={v.stock} />
                    {v.stock === 0 ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                        Out
                      </span>
                    ) : v.stock <= LOW_STOCK ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                        Low
                      </span>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
