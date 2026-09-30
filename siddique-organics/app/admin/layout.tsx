import { getSession } from "@/lib/session";
import Sidebar from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  return (
    <div className="min-h-screen bg-[#F6F2E8] text-[#0E3A24]">
      <Sidebar name={s?.name ?? "User"} role={s?.role ?? "EMPLOYEE"} />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl p-4 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
