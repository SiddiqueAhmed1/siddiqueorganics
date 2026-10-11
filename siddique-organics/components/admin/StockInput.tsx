"use client";
import { useState, useTransition } from "react";
import { updateVariantStock } from "@/actions/admin.actions";

/** Inline stock editor for one size. Saves through updateVariantStock. */
export default function StockInput({
  id,
  initial,
}: {
  id: string;
  initial: number;
}) {
  const [value, setValue] = useState(String(initial));
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(
    null,
  );
  const [pending, start] = useTransition();
  const dirty = value !== String(initial);

  const save = () =>
    start(async () => {
      const r = await updateVariantStock(id, Number(value));
      setResult({ ok: r.success, msg: r.message });
    });

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        step={1}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setResult(null);
        }}
        className="h-8 w-20 rounded-md border border-[#0E3A24]/20 bg-white px-2 text-sm focus:outline-none focus:border-[#3B7A42]"
        aria-label="Stock quantity"
      />
      <button
        type="button"
        disabled={!dirty || pending}
        onClick={save}
        className="h-8 rounded-md bg-[#0E3A24] px-3 text-xs font-semibold text-white hover:bg-[#3B7A42] disabled:opacity-40"
      >
        {pending ? "Saving..." : "Save"}
      </button>
      {result && (
        <span
          className={`text-xs ${result.ok ? "text-[#3B7A42]" : "text-red-600"}`}
        >
          {result.msg}
        </span>
      )}
    </div>
  );
}
