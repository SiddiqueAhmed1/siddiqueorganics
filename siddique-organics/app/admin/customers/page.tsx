import Link from "next/link";
import prisma from "@/lib/prisma";
import StatusSelect from "@/components/admin/StatusSelect";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ phone?: string }> }) {
  const { phone } = await searchParams;

  if (phone) {
    const orders = await prisma.order.findMany({
      where: { phone },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: { select: { name: true } } } } },
    });
    return (
      <div className="space-y-6">
        <Link href="/admin/customers" className="text-sm text-[#3B7A42]">← All customers</Link>
        <h1 className="text-2xl font-bold">{orders[0]?.customerName ?? phone}</h1>
        <p className="text-sm text-[#0E3A24]/70">{phone} · {orders[0]?.address}</p>
        <div className="rounded-xl bg-white border border-[#0E3A24]/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0E3A24] text-white text-left"><tr>{["Date", "Items", "Total", "Status"].map((h) => <th key={h} className="px-4 py-2">{h}</th>)}</tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-[#0E3A24]/10 align-top">
                  <td className="px-4 py-2 whitespace-nowrap">{o.createdAt.toLocaleDateString("en-GB")}</td>
                  <td className="px-4 py-2">{o.items.map((i) => `${i.product.name} (${i.weight}) × ${i.quantity}`).join(", ")}</td>
                  <td className="px-4 py-2 text-[#6C4E31] font-semibold">৳{o.totalAmount}</td>
                  <td className="px-4 py-2"><StatusSelect id={o.id} status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Customers are derived from orders (grouped by phone), so the list updates automatically on every new order.
  const [stats, latest] = await Promise.all([
    prisma.order.groupBy({ by: ["phone"], _count: { _all: true }, _sum: { totalAmount: true }, _max: { createdAt: true }, orderBy: { _max: { createdAt: "desc" } } }),
    prisma.order.findMany({ distinct: ["phone"], orderBy: { createdAt: "desc" }, select: { phone: true, customerName: true } }),
  ]);
  const names = new Map(latest.map((l) => [l.phone, l.customerName]));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customers ({stats.length})</h1>
      <div className="rounded-xl bg-white border border-[#0E3A24]/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#0E3A24] text-white text-left"><tr>{["Name", "Phone", "Orders", "Total spent", "Last order", ""].map((h) => <th key={h} className="px-4 py-2">{h}</th>)}</tr></thead>
          <tbody>
            {stats.map((c) => (
              <tr key={c.phone} className="border-t border-[#0E3A24]/10">
                <td className="px-4 py-2 font-medium">{names.get(c.phone)}</td><td className="px-4 py-2">{c.phone}</td>
                <td className="px-4 py-2">{c._count._all}</td>
                <td className="px-4 py-2 text-[#6C4E31] font-semibold">৳{(c._sum.totalAmount ?? 0).toLocaleString()}</td>
                <td className="px-4 py-2">{c._max.createdAt?.toLocaleDateString("en-GB")}</td>
                <td className="px-4 py-2"><Link href={`/admin/customers?phone=${encodeURIComponent(c.phone)}`} className="text-[#3B7A42] font-medium">History</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
