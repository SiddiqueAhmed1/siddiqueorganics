import { getSession } from "@/lib/session";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await getSession();
  return (
    <AdminShell name={s?.name ?? "User"} role={s?.role ?? "EMPLOYEE"}>
      {children}
    </AdminShell>
  );
}
