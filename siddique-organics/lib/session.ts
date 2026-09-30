import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const key = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET || "siddique_organics_fallback_secret_key_2026",
  );

export type Session = { email: string; name: string; role: string };

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

export async function requireSession() {
  const s = await getSession();
  if (!s) throw new Error("Unauthorized");
  return s;
}
