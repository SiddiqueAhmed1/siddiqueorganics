import Link from "next/link";
import prisma from "@/lib/prisma";
import StatusSelect from "@/components/admin/StatusSelect";

export const dynamic = "force-dynamic";

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
type Status = (typeof STATUSES)[number];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const active = STATUSES.find((s) => s === status) as Status | undefined;
  const search = (q ?? "").trim();

  const where = {
    ...(active ? { status: active } : {}),
    ...(search
      ? {
          OR: [
            { phone: { contains: search } },
            { customerName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [orders, grouped] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        items: {
          select: {
            quantity: true,
            size: true,
            product: { select: { name: true } },
          },
        },
      },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const counts = Object.fromEntries(grouped.map((g) => [g.status, g._count._all]));
  const allCount = grouped.reduce((a, g) => a + g._count._all, 0);
  const card = "rounded-xl bg-white border border-[#0E3A24]/10 shadow-sm";

  const tabHref = (st?: Status) => {
    const params = new URLSearchParams();
    if (st) params.set("status", st);
    if (search) params.set("q", search);
    const qs = params.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-[#0E3A24]/60">
          Latest 200 orders. Change the status from the dropdown.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[{ key: undefined, label: "All", count: allCount }, ...STATUSES.map((s) => ({ key: s, label: s.toLowerCase(), count: counts[s] ?? 0 }))].map(
          (t) => (
            <Link
              key={t.label}
              href={tabHref(t.key)}
              className={`h-9 inline-flex items-center gap-2 rounded-full px-4 text-sm font-medium border capitalize ${
                active === t.key || (!active && !t.key)
                  ? "bg-[#0E3A24] text-white border-[#0E3A24]"
                  : "bg-white text-[#0E3A24] border-[#0E3A24]/20 hover:border-[#0E3A24]/50"
              }`}
            >
              {t.label}
              <span className="text-xs opacity-70">{t.count}</span>
            </Link>
          ),
        )}
      </div>

      <form method="get" className="flex flex-wrap gap-2">
        {active && <input type="hidden" name="status" value={active} />}
        <input
          name="q"
          defaultValue={search}
          placeholder="Search by phone or customer name"
          className="h-10 w-full sm:w-80 rounded-lg border border-[#0E3A24]/20 bg-white px-3 text-sm focus:outline-none focus:border-[#3B7A42]"
        />
        <button className="h-10 px-4 rounded-lg bg-[#0E3A24] text-white text-sm font-semibold hover:bg-[#3B7A42]">
          Search
        </button>
        {search && (
          <Link href={tabHref(active)} className="h-10 px-4 inline-flex items-center rounded-lg border border-[#0E3A24]/20 text-sm">
            Clear
          </Link>
        )}
      </form>

      <div className={`${card} overflow-x-auto`}>
        <table className="w-full text-sm">
          <thead className="bg-[#0E3A24] text-white text-left">
            <tr>
              {["Date", "Customer", "Items", "Total", "Status"].map((h) => (
                <th key={h} className="px-4 py-2 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[#0E3A24]/60">
                  No orders found.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-[#0E3A24]/10 align-top">
                <td className="px-4 py-3 whitespace-nowrap">
                  {o.createdAt.toLocaleDateString("en-GB")}
                  <p className="text-xs text-[#0E3A24]/50">
                    {o.createdAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </td>
                <td className="px-4 py-3 min-w-[180px]">
                  <Link
                    href={`/admin/customers?phone=${encodeURIComponent(o.phone)}`}
                    className="font-medium text-[#0E3A24] hover:text-[#3B7A42]"
                  >
                    {o.customerName}
                  </Link>
                  <p className="text-xs text-[#0E3A24]/60">{o.phone}</p>
                  <p className="text-xs text-[#0E3A24]/50 line-clamp-2 max-w-xs">{o.address}</p>
                </td>
                <td className="px-4 py-3">
                  {o.items.map((i, idx) => (
                    <p key={idx} className="whitespace-nowrap">
                      {i.product.name} ({i.size}) × {i.quantity}
                    </p>
                  ))}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-semibold text-[#6C4E31]">৳{o.totalAmount}</span>
                  <p className="text-[10px] text-[#0E3A24]/50">
                    incl. ৳{o.deliveryCharge} delivery
                  </p>
                </td>
                <td className="px-4 py-3">
                  <StatusSelect id={o.id} status={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
