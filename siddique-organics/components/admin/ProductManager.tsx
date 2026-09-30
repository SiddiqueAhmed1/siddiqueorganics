"use client";
import { useActionState, useState, useTransition } from "react";
import { createProduct, updateProduct, deleteProduct } from "@/actions/admin.actions";

type P = { id: string; name: string; slug: string; description: string; category: string; price500g: number; price1kg: number; stock: number };
const inp = "h-10 w-full rounded-lg border border-[#0E3A24]/20 px-3 text-sm focus:outline-none focus:border-[#3B7A42]";
const btn = "h-10 px-4 rounded-lg bg-[#0E3A24] text-white text-sm font-semibold hover:bg-[#3B7A42] disabled:opacity-60";

export default function ProductManager({ products }: { products: P[] }) {
  const [state, action, pending] = useActionState(createProduct, null);
  const [edit, setEdit] = useState<P | null>(null);
  const [msg, setMsg] = useState("");
  const [, start] = useTransition();

  return (
    <div className="space-y-6">
      <form action={action} className="grid sm:grid-cols-3 gap-3 rounded-xl bg-white border border-[#0E3A24]/10 p-4">
        <h2 className="sm:col-span-3 font-semibold">Add product</h2>
        <input name="name" placeholder="Name" className={inp} />
        <input name="slug" placeholder="slug (e.g. sundarban-honey)" className={inp} />
        <input name="category" placeholder="category (honey, oil, nuts...)" className={inp} />
        <input name="price500g" type="number" step="any" placeholder="Price 500g" className={inp} />
        <input name="price1kg" type="number" step="any" placeholder="Price 1kg" className={inp} />
        <input name="stock" type="number" placeholder="Stock" className={inp} />
        <input name="imageUrl" placeholder="Image URL (e.g. /photos/x.webp)" className={`${inp} sm:col-span-2`} />
        <textarea name="description" placeholder="Description" className="sm:col-span-3 rounded-lg border border-[#0E3A24]/20 p-3 text-sm" rows={2} />
        <div className="sm:col-span-3 flex items-center gap-3">
          <button disabled={pending} className={btn}>{pending ? "Saving..." : "Add product"}</button>
          {state && <span className={`text-sm ${state.success ? "text-[#3B7A42]" : "text-red-600"}`}>{state.message}</span>}
        </div>
      </form>

      {edit && (
        <form
          action={(fd) => start(async () => { const r = await updateProduct(edit.id, fd); setMsg(r.message); if (r.success) setEdit(null); })}
          className="grid sm:grid-cols-3 gap-3 rounded-xl bg-white border-2 border-[#3B7A42] p-4"
        >
          <h2 className="sm:col-span-3 font-semibold">Edit: {edit.name}</h2>
          <input name="name" defaultValue={edit.name} className={inp} />
          <input name="price500g" type="number" step="any" defaultValue={edit.price500g} className={inp} />
          <input name="price1kg" type="number" step="any" defaultValue={edit.price1kg} className={inp} />
          <input name="stock" type="number" defaultValue={edit.stock} className={inp} />
          <textarea name="description" defaultValue={edit.description} className="sm:col-span-2 rounded-lg border border-[#0E3A24]/20 p-3 text-sm" rows={2} />
          <div className="sm:col-span-3 flex gap-2">
            <button className={btn}>Save</button>
            <button type="button" onClick={() => setEdit(null)} className="h-10 px-4 rounded-lg border border-[#0E3A24]/20 text-sm">Cancel</button>
          </div>
        </form>
      )}
      {msg && <p className="text-sm text-[#6C4E31]">{msg}</p>}

      <div className="rounded-xl bg-white border border-[#0E3A24]/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#0E3A24] text-white text-left"><tr>{["Name", "Category", "500g", "1kg", "Stock", ""].map((h) => <th key={h} className="px-4 py-2">{h}</th>)}</tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-[#0E3A24]/10">
                <td className="px-4 py-2 font-medium">{p.name}</td><td className="px-4 py-2 capitalize">{p.category}</td>
                <td className="px-4 py-2">৳{p.price500g}</td><td className="px-4 py-2">৳{p.price1kg}</td>
                <td className={`px-4 py-2 font-semibold ${p.stock <= 5 ? "text-red-600" : "text-[#3B7A42]"}`}>{p.stock}</td>
                <td className="px-4 py-2 space-x-3 whitespace-nowrap">
                  <button onClick={() => { setEdit(p); setMsg(""); }} className="text-[#3B7A42] font-medium">Edit</button>
                  <button
                    onClick={() => confirm(`Delete ${p.name}?`) && start(async () => { setMsg((await deleteProduct(p.id)).message); })}
                    className="text-red-600 font-medium"
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
