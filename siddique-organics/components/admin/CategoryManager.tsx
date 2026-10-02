"use client";
import { useActionState, useEffect, useState, useTransition } from "react";
import ImageUploader from "./ImageUploader";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/actions/admin.actions";

type C = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  productCount: number;
};
const inp =
  "h-10 w-full rounded-lg border border-[#0E3A24]/20 px-3 text-sm focus:outline-none focus:border-[#3B7A42]";
const btn =
  "h-10 px-4 rounded-lg bg-[#0E3A24] text-white text-sm font-semibold hover:bg-[#3B7A42] disabled:opacity-60";

export default function CategoryManager({ categories }: { categories: C[] }) {
  const [state, action, pending] = useActionState(createCategory, null);
  const [edit, setEdit] = useState<C | null>(null);
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
        <h2 className="sm:col-span-3 font-semibold">Add category</h2>
        <input
          name="name"
          placeholder="Name (e.g. Pure Honey)"
          required
          className={inp}
        />
        <input
          name="slug"
          placeholder="slug (auto from name if empty)"
          className={inp}
        />
        <div />
        <ImageUploader onBusyChange={setUploading} />
        <div className="sm:col-span-3 flex items-center gap-3">
          <button disabled={pending || uploading} className={btn}>
            {uploading
              ? "Uploading photo..."
              : pending
                ? "Saving..."
                : "Add category"}
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
              const r = await updateCategory(edit.id, fd);
              setMsg(r.message);
              if (r.success) setEdit(null);
            })
          }
          className="grid sm:grid-cols-3 gap-3 rounded-xl bg-white border-2 border-[#3B7A42] p-4"
        >
          <h2 className="sm:col-span-3 font-semibold">Edit: {edit.name}</h2>
          <input name="name" defaultValue={edit.name} className={inp} />
          <input name="slug" defaultValue={edit.slug} className={inp} />
          <div />
          <ImageUploader
            initial={edit.image ? [edit.image] : []}
            onBusyChange={setUploading}
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
              {["Image", "Name", "Slug", "Products", ""].map((h) => (
                <th key={h} className="px-4 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-[#0E3A24]/50"
                >
                  No categories yet. Add your first one above.
                </td>
              </tr>
            )}
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-[#0E3A24]/10">
                <td className="px-4 py-2">
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.image}
                      alt={c.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#0E3A24]/5 text-[10px] text-[#0E3A24]/40">
                      none
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 font-medium">{c.name}</td>
                <td className="px-4 py-2 text-[#0E3A24]/60">{c.slug}</td>
                <td className="px-4 py-2">{c.productCount}</td>
                <td className="px-4 py-2 space-x-3 whitespace-nowrap">
                  <button
                    onClick={() => {
                      setEdit(c);
                      setMsg("");
                    }}
                    className="text-[#3B7A42] font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      confirm(`Delete ${c.name}?`) &&
                      start(async () => {
                        setMsg((await deleteCategory(c.id)).message);
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
