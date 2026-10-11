import { getSession } from "@/lib/session";
import LogoutButton from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const s = await getSession();
  const card = "rounded-xl bg-white border border-[#0E3A24]/10 shadow-sm";
  const rows = [
    ["Name", s?.name ?? "—"],
    ["Email", s?.email ?? "—"],
    ["Role", s?.role === "SUPER_ADMIN" ? "Super Admin" : "Employee"],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-[#0E3A24]/60">Your signed-in account.</p>
      </div>

      <section className={`${card} p-6 max-w-xl`}>
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[#3B7A42] text-xl font-bold text-white">
            {(s?.name ?? "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold">{s?.name ?? "User"}</p>
            <p className="text-sm text-[#0E3A24]/60">{s?.email}</p>
          </div>
        </div>

        <dl className="mt-6 divide-y divide-[#0E3A24]/10 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between py-3">
              <dt className="text-[#0E3A24]/60">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-xs text-[#0E3A24]/50 max-w-xs">
            Passwords are set in the server environment (ADMIN_*, EMPLOYEE_*_*
            variables), so they can&apos;t be changed from this page.
          </p>
          <LogoutButton />
        </div>
      </section>
    </div>
  );
}
