"use client";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";

/** Multi-photo picker: uploads to Cloudinary from the browser and exposes URLs
 *  through hidden `images` inputs so the server action receives them in FormData. */
export default function ImageUploader({
  initial = [],
  onBusyChange,
}: {
  initial?: string[];
  onBusyChange?: (busy: boolean) => void;
}) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  // ✅ স্পিড অপটিমাইজড useEffect: এটি কম্পোনেন্টের টপ-লেভেলে থাকবে।
  // যখনই busy স্টেটের মান পরিবর্তন হবে, এটি প্যারেন্ট কম্পোনেন্টকে নিরাপদে জানিয়ে দেবে।
  useEffect(() => {
    onBusyChange?.(busy > 0);
  }, [busy, onBusyChange]);

  async function uploadOne(file: File) {
    const sig = await fetch("/api/cloudinary-sign", { method: "POST" }).then(
      (r) => r.json(),
    );
    if (sig.error) throw new Error(sig.error);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", sig.apiKey);
    fd.append("timestamp", String(sig.timestamp));
    fd.append("folder", sig.folder);
    fd.append("signature", sig.signature);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
      { method: "POST", body: fd },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "Upload failed");
    return data.secure_url as string;
  }

  async function onPick(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));

    // আপলোড শুরু হওয়ার আগে মোট ফাইলের সংখ্যা দিয়ে busy স্টেট সেট করছি
    setBusy(list.length);

    for (const f of list) {
      try {
        const url = await uploadOne(f);
        setUrls((u) => [...u, url]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        // ✅ প্রতিটি ফাইলের আপলোড শেষ (বা ফেইল) হলে busy ১ করে কমবে
        setBusy((n) => Math.max(0, n - 1));
      }
    }
    if (ref.current) ref.current.value = "";
  }

  return (
    <div className="sm:col-span-3 space-y-2">
      {urls.map((u) => (
        <input key={u} type="hidden" name="images" value={u} />
      ))}
      <div className="flex flex-wrap gap-2">
        {urls.map((u, i) => (
          <div
            key={u}
            className="relative h-20 w-20 overflow-hidden rounded-lg border border-[#0E3A24]/15"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute bottom-0 inset-x-0 bg-[#0E3A24]/80 text-center text-[9px] text-white">
                Main
              </span>
            )}
            <button
              type="button"
              onClick={() => setUrls((x) => x.filter((y) => y !== u))}
              className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
              aria-label="Remove photo"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="grid h-20 w-20 place-items-center rounded-lg border-2 border-dashed border-[#0E3A24]/25 text-[#0E3A24]/60 hover:border-[#3B7A42] hover:text-[#3B7A42]"
        >
          {busy > 0 ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImagePlus className="h-5 w-5" />
          )}
        </button>
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => onPick(e.target.files)}
      />
      <p className="text-xs text-[#0E3A24]/60">
        Select one or more photos from your computer. First photo is the main
        image.
      </p>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
