"use client";

import { useActionState } from "react";
import { loginAction, type AuthState } from "@/server/actions/store/customer";

const init: AuthState = {};

export function CustomerLoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, init);
  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-[13px] text-red-700">{state.error}</p>
        </div>
      )}
      <div className="space-y-1">
        <label className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#525252]">
          E-posta
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder="ornek@example.com"
          className="w-full border border-[#e5e5e5] px-4 py-3 text-[14px] text-[#0a0a0a] placeholder:text-[#d4d4d4] outline-none focus:border-[#0a0a0a] transition-colors bg-transparent"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#525252]">
          Şifre
        </label>
        <input
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className="w-full border border-[#e5e5e5] px-4 py-3 text-[14px] text-[#0a0a0a] placeholder:text-[#d4d4d4] outline-none focus:border-[#0a0a0a] transition-colors bg-transparent"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="store-btn-primary w-full py-4 text-[13px] disabled:opacity-50"
      >
        {isPending ? "Giriş yapılıyor…" : "Giriş Yap"}
      </button>
    </form>
  );
}
