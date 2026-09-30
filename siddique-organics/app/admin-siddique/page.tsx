"use client";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginEmployee } from "@/actions/auth.actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginEmployee, null);
  const router = useRouter();
  useEffect(() => {
    if (state?.success) router.replace("/admin");
  }, [state, router]);

  return (
    <div className="min-h-screen grid place-items-center bg-[#F9F8F3] px-4">
      <form action={action} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-lg border border-[#0E3A24]/10">
        <h1 className="text-2xl font-bold text-[#0E3A24] font-[family-name:var(--font-playfair)]">Siddique Organics</h1>
        <p className="text-sm text-[#0E3A24]/60">Employee login</p>
        <input name="email" type="email" required placeholder="Email" className="w-full h-11 px-4 rounded-lg border border-[#0E3A24]/20 focus:outline-none focus:border-[#3B7A42]" />
        <input name="password" type="password" required placeholder="Password" className="w-full h-11 px-4 rounded-lg border border-[#0E3A24]/20 focus:outline-none focus:border-[#3B7A42]" />
        {state && !state.success && <p className="text-sm text-red-600">{state.message}</p>}
        <button disabled={pending} className="w-full h-11 rounded-lg bg-[#0E3A24] text-white font-semibold hover:bg-[#3B7A42] disabled:opacity-60 transition-colors">
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
