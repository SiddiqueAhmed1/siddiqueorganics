import { ShoppingBag, Banknote, Clock, TriangleAlert } from "lucide-react";
import prisma from "@/lib/prisma";
import StatusSelect from "@/components/admin/StatusSelect";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-400",
  CONFIRMED: "bg-sky-500",
  SHIPPED: "bg-indigo-500",
  DELIVERED: "bg-[#3B7A42]",
  CANCELLED: "bg-red-500",
};

export default async function DashboardPage() {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 6);

  const [agg, byStatus, week, lowStock, recent] = await Promise.all([
    prisma.order.aggregate({
      where: { NOT: { status: "CANCELLED" } },
      _count: true,
      _sum: { totalAmount: true },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.findMany({
      where: { createdAt: { gte: since }, NOT: { status: "CANCELLED" } },
      select: { createdAt: true, totalAmount: true },
    }),
    // Stock now lives on variants, so low-stock is reported per variant (size).
    prisma.productVariant.findMany({
      where: { stock: { lte: 5 } },
      orderBy: { stock: "asc" },
      take: 6,
      select: {
        id: true,
        size: true,
        stock: true,
        product: { select: { name: true } },
      },
    }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const statusCount = Object.fromEntries(
    byStatus.map((s) => [s.status, s._count._all]),
  );
  const totalOrdersAll = byStatus.reduce((a, s) => a + s._count._all, 0) || 1;

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    return {
      key: d.toDateString(),
      label: d.toLocaleDateString("en-GB", { weekday: "short" }),
      total: 0,
    };
  });
  week.forEach((o) => {
    const d = days.find((x) => x.key === o.createdAt.toDateString());
    if (d) d.total += o.totalAmount;
  });
  const max = Math.max(...days.map((d) => d.total), 1);

  const stats = [
    {
      label: "Total Orders",
      value: agg._count,
      icon: ShoppingBag,
      tone: "bg-[#3B7A42]/10 text-[#3B7A42]",
    },
    {
      label: "Revenue",
      value: `৳${(agg._sum.totalAmount ?? 0).toLocaleString()}`,
      icon: Banknote,
      tone: "bg-[#6C4E31]/10 text-[#6C4E31]",
    },
    {
      label: "Pending Orders",
      value: statusCount.PENDING ?? 0,
      icon: Clock,
      tone: "bg-amber-100 text-amber-600",
    },
    {
      label: "Low Stock",
      value: lowStock.length,
      icon: TriangleAlert,
      tone: "bg-red-100 text-red-600",
    },
  ];
  const card = "rounded-xl bg-white border border-[#0E3A24]/10 shadow-sm";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-[#0E3A24]/60">
          Overview of your store performance
        </p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className={`${card} flex items-center gap-4 p-5`}>
            <div
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tone}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#0E3A24]/60">{label}</p>
              <p className="truncate text-xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className={`${card} p-5 lg:col-span-2`}>
          <h2 className="font-semibold">Revenue — last 7 days</h2>
          <div className="mt-6 flex h-44 items-end gap-3">
            {days.map((d) => (
              <div
                key={d.key}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <span className="text-[10px] text-[#0E3A24]/60">
                  {d.total ? `৳${d.total}` : ""}
                </span>
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-md bg-[#3B7A42]"
                    style={{
                      height: `${Math.max((d.total / max) * 100, d.total ? 4 : 1)}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-[#0E3A24]/60">{d.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={`${card} p-5`}>
          <h2 className="font-semibold">Orders by status</h2>
          <div className="mt-5 space-y-3">
            {Object.keys(STATUS_COLOR).map((s) => (
              <div key={s}>
                <div className="flex justify-between text-xs">
                  <span className="capitalize">{s.toLowerCase()}</span>
                  <span className="font-semibold">{statusCount[s] ?? 0}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-[#0E3A24]/10">
                  <div
                    className={`h-2 rounded-full ${STATUS_COLOR[s]}`}
                    style={{
                      width: `${((statusCount[s] ?? 0) / totalOrdersAll) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className={`${card} overflow-x-auto lg:col-span-2`}>
          <h2 className="p-5 pb-3 font-semibold">Recent orders</h2>
          <table className="w-full text-sm">
            <thead className="bg-[#F9F8F3] text-left text-xs uppercase text-[#0E3A24]/60">
              <tr>
                {["Customer", "Total", "Date", "Status"].map((h) => (
                  <th key={h} className="px-5 py-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id} className="border-t border-[#0E3A24]/10">
                  <td className="px-5 py-3">
                    <p className="font-medium">{o.customerName}</p>
                    <p className="text-xs text-[#0E3A24]/50">{o.phone}</p>
                  </td>
                  <td className="px-5 py-3 font-semibold text-[#6C4E31]">
                    ৳{o.totalAmount}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    {o.createdAt.toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-5 py-3">
                    <StatusSelect id={o.id} status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={`${card} p-5`}>
          <h2 className="font-semibold">Low stock alert</h2>
          <ul className="mt-4 space-y-3">
            {lowStock.length === 0 && (
              <li className="text-sm text-[#0E3A24]/60">
                All products well stocked.
              </li>
            )}
            {lowStock.map((v) => (
              <li
                key={v.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="truncate pr-3">
                  {v.product.name} ({v.size})
                </span>
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                  {v.stock} left
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
