import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// Returns a short-lived signature so the browser can upload straight to Cloudinary
// (keeps API secret on the server, avoids server body-size limits).
export async function POST() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary env vars missing" }, { status: 500 });
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "siddique-organics/products";
  const signature = createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");
  return NextResponse.json({ cloudName, apiKey, timestamp, folder, signature });
}
