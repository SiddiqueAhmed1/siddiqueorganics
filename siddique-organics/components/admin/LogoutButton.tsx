"use client";
import { useRouter } from "next/navigation";
import { logoutEmployee } from "@/actions/auth.actions";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => { await logoutEmployee(); router.replace("/admin-siddique"); }}
      className="text-sm px-3 h-9 rounded-full border border-[#0E3A24]/20 text-[#0E3A24] hover:bg-[#0E3A24] hover:text-white transition-colors"
    >
      Logout
    </button>
  );
}
