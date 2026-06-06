"use client";

import { useActionState } from "react";
import { CheckCircle } from "lucide-react";
import { updateProfileAction, type AuthState } from "@/server/actions/store/customer";

const init: AuthState = {};

const inputCls = "w-full border border-[#e5e5e5] px-4 py-3 text-[14px] text-[#0a0a0a] placeholder:text-[#d4d4d4] outline-none focus:border-[#0a0a0a] transition-colors bg-transparent";
const labelCls = "text-[12px] font-semibold uppercase tracking-[0.06em] text-[#525252]";

export function ProfileForm({
  firstName,
  lastName,
  phone,
}: {
  firstName: string;
  lastName: string;
  phone: string | null;
}) {
  const [state, action, pending] = useActionState(updateProfileAction, init);

  return (
    <form action={action} className="space-y-5">
      {state.success && (
        <div className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
          <p className="text-[13px] text-emerald-700">Profil bilgileriniz güncellendi.</p>
        </div>
      )}
      {state.error && (
        <div className="border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-[13px] text-red-700">{state.error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={labelCls}>Ad</label>
          <input name="firstName" defaultValue={firstName} required className={inputCls} />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Soyad</label>
          <input name="lastName" defaultValue={lastName} required className={inputCls} />
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Telefon</label>
        <input
          name="phone"
          type="tel"
          defaultValue={phone ?? ""}
          placeholder="+90 5xx xxx xx xx"
          className={inputCls}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="store-btn-primary w-full py-4 text-[13px] disabled:opacity-50"
      >
        {pending ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </form>
  );
}
