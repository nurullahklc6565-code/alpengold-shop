"use client";

import { useActionState } from "react";
import { registerAction, type AuthState } from "@/server/actions/store/customer";

const init: AuthState = {};

const inputCls = "w-full border border-[#e5e5e5] px-4 py-3 text-[14px] text-[#0a0a0a] placeholder:text-[#d4d4d4] outline-none focus:border-[#0a0a0a] transition-colors bg-transparent";
const labelCls = "text-[12px] font-semibold uppercase tracking-[0.06em] text-[#525252]";

export function CustomerRegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, init);
  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-[13px] text-red-700">{state.error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={labelCls}>Ad *</label>
          <input name="firstName" required className={inputCls} />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Soyad *</label>
          <input name="lastName" required className={inputCls} />
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelCls}>E-posta *</label>
        <input name="email" type="email" required placeholder="ornek@example.com" className={inputCls} />
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Şifre *</label>
        <input name="password" type="password" required minLength={8}
          placeholder="En az 8 karakter" className={inputCls} />
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Telefon</label>
        <input name="phone" type="tel" placeholder="+90 5xx xxx xx xx" className={inputCls} />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="store-btn-primary w-full py-4 text-[13px] disabled:opacity-50"
      >
        {isPending ? "Kayıt oluşturuluyor…" : "Hesap Oluştur"}
      </button>
    </form>
  );
}
