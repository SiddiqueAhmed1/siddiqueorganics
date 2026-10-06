"use client";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import Image from "next/image";

export default function AdminShell({
  name,
  role,
  children,
}: {
  name: string;
  role: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Restore preference (open by default on desktop, closed on mobile)
  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar");
    setOpen(saved ? saved === "1" : window.innerWidth >= 1024);
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem("admin-sidebar", open ? "1" : "0");
  }, [open, ready]);

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#0E3A24]">
      <Sidebar name={name} role={role} open={open} setOpen={setOpen} />
      <div
        className={`transition-[padding] duration-200 ${open ? "lg:pl-64" : ""}`}
      >
        <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[#0E3A24]/10 bg-white px-4">
          <button
            onClick={() => setOpen(!open)}
            className="rounded-md p-1.5 text-[#0E3A24] hover:bg-[#0E3A24]/5"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-bold text-[#0E3A24]">
            <Image
              src={"/photos/siddique-organics-logo.png"}
              width={150}
              height={120}
              alt="siddique organics"
            />{" "}
          </span>
        </div>
        <main>
          <div className="mx-auto max-w-6xl p-4 sm:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
