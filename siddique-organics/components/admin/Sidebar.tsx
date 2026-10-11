"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  Users,
  Boxes,
  ShoppingBag,
  UserRound,
  LogOut,
  X,
} from "lucide-react";
import { logoutEmployee } from "@/actions/auth.actions";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/profile", label: "Profile", icon: UserRound },
];

export default function Sidebar({
  name,
  role,
  open,
  setOpen,
}: {
  name: string;
  role: string;
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const path = usePathname();
  const router = useRouter();
  const active = (h: string) =>
    h === "/admin" ? path === h : path.startsWith(h);

  const content = (
    <div className="flex h-full flex-col bg-[#0E3A24] text-white">
      <div className="flex h-16 items-center justify-between px-5 border-b border-white/10">
        <div>
          <p className="text-lg font-bold leading-none">Siddique Organics</p>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-white/50">
            Admin Panel
          </p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-1 text-white/70"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-widest text-white/40">
          Menu
        </p>
        {NAV.map(({ href, label, icon: Icon, soon }) => {
          const cls = `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            active(href)
              ? "bg-white/10 text-white shadow-[inset_3px_0_0_#7BC47F]"
              : "text-white/70 hover:bg-white/5 hover:text-white"
          }`;
          if (soon)
            return (
              <div
                key={href}
                className={`${cls} cursor-not-allowed opacity-50`}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span className="flex-1">{label}</span>
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] uppercase">
                  Soon
                </span>
              </div>
            );
          return (
            <Link
              key={href}
              href={href}
              onClick={() => {
                if (window.innerWidth < 1024) setOpen(false);
              }}
              className={cls}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[#3B7A42] text-sm font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="text-[11px] text-white/50">
              {role === "SUPER_ADMIN" ? "Super Admin" : "Employee"}
            </p>
          </div>
          <button
            title="Logout"
            onClick={async () => {
              await logoutEmployee();
              router.replace("/admin-siddique");
            }}
            className="rounded-md p-2 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {content}
      </aside>
    </>
  );
}
