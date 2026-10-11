"use client";
import { useActionState, useEffect, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import ImageUploader from "./ImageUploader";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/actions/admin.actions";

type Variant = {
  id: string;
  size: string;
  price: number;
  discount: number;
  stock: number;
  sku: string;
};
type Category = { id: string; name: string };
type P = {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  category: Category;
  variants: Variant[];
};

const inp =
  "h-10 w-full rounded-lg border border-[#0E3A24]/20 px-3 text-sm focus:outline-none focus:border-[#3B7A42]";
const btn =
  "h-10 px-4 rounded-lg bg-[#0E3A24] text-white text-sm font-semibold hover:bg-[#3B7A42] disabled:opacity-60";

type Row = {
  id?: string;
  size: string;
  price: string;
  discount: string;
  stock: string;
  sku: string;
};
const blankRow = (): Row => ({
  size: "",
  price: "",
  discount: "0",
  stock: "0",
  sku: "",
});

/** Dynamic size/price/discount/stock rows. Serialised into one hidden `variants` JSON field. */
function VariantEditor({ initial }: { initial?: Variant[] }) {
  const [rows, setRows] = useState<Row[]>(
    initial?.length
      ? initial.map((v) => ({
          id: v.id,
          size: v.size,
          price: String(v.price),
          discount: String(v.discount ?? 0),
          stock: String(v.stock),
          sku: v.sku,
        }))
      : [blankRow()],
  );
  const patch = (i: number, p: Partial<Row>) =>
    setRows((r) => r.map((x, j) => (j === i ? { ...x, ...p } : x)));

  const payload = JSON.stringify(
    rows.map((r) => ({
      id: r.id,
      size: r.size,
      price: Number(r.price),
      discount: Number(r.discount) || 0,
      stock: Number(r.stock),
      sku: r.sku || undefined,
    })),
  );

  return (
    <div className="sm:col-span-3 space-y-2">
      <input type="hidden" name="variants" value={payload} />
      <p className="text-sm font-medium">
        Variants (size · price · discount ৳ · stock)
      </p>
      {rows.map((r, i) => (
        <div
          key={r.id ?? i}
          className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_1fr_1.4fr_auto] gap-2"
        >
          <input
            value={r.size}
            onChange={(e) => patch(i, { size: e.target.value })}
            placeholder="Size (500gm, 1ltr)"
            className={inp}
          />
          <input
            value={r.price}
            onChange={(e) => patch(i, { price: e.target.value })}
            type="number"
            step="any"
            min="0"
            placeholder="Price"
            className={inp}
          />
          <input
            value={r.discount}
            onChange={(e) => patch(i, { discount: e.target.value })}
            type="number"
            step="any"
            min="0"
            placeholder="Discount ৳ (0)"
            title="Flat ৳ taken off the price"
            className={inp}
          />
          <input
            value={r.stock}
            onChange={(e) => patch(i, { stock: e.target.value })}
            type="number"
            min="0"
            placeholder="Stock"
            className={inp}
          />
          <input
            value={r.sku}
            onChange={(e) => patch(i, { sku: e.target.value })}
            placeholder="SKU (auto if empty)"
            className={inp}
          />
          <button
            type="button"
            disabled={rows.length === 1}
            onClick={() => setRows((x) => x.filter((_, j) => j !== i))}
            className="grid h-10 w-10 place-items-center rounded-lg border border-[#0E3A24]/20 text-red-600 disabled:opacity-40"
            aria-label="Remove variant"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setRows((r) => [...r, blankRow()])}
        className="inline-flex items-center gap-1 text-sm font-medium text-[#3B7A42]"
      >
        <Plus className="h-4 w-4" /> Add variant
      </button>
    </div>
  );
}

function CategorySelect({
  categories,
  defaultValue,
}: {
  categories: Category[];
  defaultValue?: string;
}) {
  return (
    <select
      name="categoryId"
      defaultValue={defaultValue ?? ""}
      required
      className={inp}
    >
      <option value="" disabled>
        {categories.length ? "Select category" : "No categories yet"}
      </option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}

export default function ProductManager({
  products,
  categories,
}: {
  products: P[];
  categories: Category[];
}) {
  const [state, action, pending] = useActionState(createProduct, null);
  const [edit, setEdit] = useState<P | null>(null);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [, start] = useTransition();
  useEffect(() => {
    if (state?.success) setFormKey((k) => k + 1);
  }, [state]);

  return (
    <div className="space-y-6">
      <form
        key={formKey}
        action={action}
        className="grid sm:grid-cols-3 gap-3 rounded-xl bg-white border border-[#0E3A24]/10 p-4"
      >
        <h2 className="sm:col-span-3 font-semibold">Add product</h2>
        <input name="name" placeholder="Name" required className={inp} />
        <input
          name="slug"
          placeholder="slug (auto from name if empty)"
          className={inp}
        />
        <CategorySelect categories={categories} />
        <VariantEditor />
        <ImageUploader onBusyChange={setUploading} />
        <textarea
          name="description"
          placeholder="Description"
          required
          className="sm:col-span-3 rounded-lg border border-[#0E3A24]/20 p-3 text-sm"
          rows={2}
        />
        <div className="sm:col-span-3 flex items-center gap-3">
          <button disabled={pending || uploading} className={btn}>
            {uploading
              ? "Uploading photos..."
              : pending
                ? "Saving..."
                : "Add product"}
          </button>
          {state && (
            <span
              className={`text-sm ${state.success ? "text-[#3B7A42]" : "text-red-600"}`}
            >
              {state.message}
            </span>
          )}
        </div>
      </form>

      {edit && (
        <form
          key={edit.id}
          action={(fd) =>
            start(async () => {
              const r = await updateProduct(edit.id, fd);
              setMsg(r.message);
              if (r.success) setEdit(null);
            })
          }
          className="grid sm:grid-cols-3 gap-3 rounded-xl bg-white border-2 border-[#3B7A42] p-4"
        >
          <h2 className="sm:col-span-3 font-semibold">Edit: {edit.name}</h2>
          <input name="name" defaultValue={edit.name} className={inp} />
          <CategorySelect
            categories={categories}
            defaultValue={edit.category.id}
          />
          <div />
          <VariantEditor initial={edit.variants} />
          <ImageUploader initial={edit.images} onBusyChange={setUploading} />
          <textarea
            name="description"
            defaultValue={edit.description}
            className="sm:col-span-3 rounded-lg border border-[#0E3A24]/20 p-3 text-sm"
            rows={2}
          />
          <div className="sm:col-span-3 flex gap-2">
            <button disabled={uploading} className={btn}>
              {uploading ? "Uploading..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEdit(null)}
              className="h-10 px-4 rounded-lg border border-[#0E3A24]/20 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {msg && <p className="text-sm text-[#6C4E31]">{msg}</p>}

      <div className="rounded-xl bg-white border border-[#0E3A24]/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#0E3A24] text-white text-left">
            <tr>
              {["Name", "Category", "Variants (size · price · discount · stock)", ""].map(
                (h) => (
                  <th key={h} className="px-4 py-2">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-[#0E3A24]/10 align-top">
                <td className="px-4 py-2 font-medium">{p.name}</td>
                <td className="px-4 py-2">{p.category.name}</td>
                <td className="px-4 py-2">
                  <ul className="space-y-0.5">
                    {p.variants.map((v) => (
                      <li key={v.id} className="whitespace-nowrap">
                        {v.size} · ৳{v.price}
                        {v.discount > 0 && (
                          <span className="text-[#6C4E31]">
                            {" "}
                            (−৳{v.discount} → ৳{v.price - v.discount})
                          </span>
                        )}{" "}
                        ·{" "}
                        <span
                          className={`font-semibold ${v.stock <= 5 ? "text-red-600" : "text-[#3B7A42]"}`}
                        >
                          {v.stock}
                        </span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-2 space-x-3 whitespace-nowrap">
                  <button
                    onClick={() => {
                      setEdit(p);
                      setMsg("");
                    }}
                    className="text-[#3B7A42] font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      confirm(`Delete ${p.name}?`) &&
                      start(async () => {
                        setMsg((await deleteProduct(p.id)).message);
                      })
                    }
                    className="text-red-600 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
