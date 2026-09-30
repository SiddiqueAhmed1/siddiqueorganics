"use client";
import { useTransition } from "react";
import { updateOrderStatus } from "@/actions/admin.actions";

const S = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export default function StatusSelect({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => start(async () => { await updateOrderStatus(id, e.target.value as (typeof S)[number]); })}
      className="h-8 rounded-md border border-[#0E3A24]/20 bg-white px-2 text-xs"
    >
      {S.map((x) => <option key={x}>{x}</option>)}
    </select>
  );
}
