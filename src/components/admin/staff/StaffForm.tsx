"use client";

import { useActionState } from "react";
import type { StaffActionState } from "@/server/actions/admin/staff";

type Role = { id: string; name: string };
type Staff = { id: string; firstName: string; lastName: string; email: string; roleId: string; active: boolean };
type Props = {
  staff?: Staff | null;
  roles: Role[];
  createAction?: (prev: StaffActionState, formData: FormData) => Promise<StaffActionState>;
  updateAction?: (prev: StaffActionState, formData: FormData) => Promise<StaffActionState>;
  passwordAction?: (prev: StaffActionState, formData: FormData) => Promise<StaffActionState>;
};

const init: StaffActionState = {};

export function StaffForm({ staff, roles, createAction, updateAction, passwordAction }: Props) {
  const action = staff ? updateAction! : createAction!;
  const [state, formAction, isPending] = useActionState(action, init);
  const [pwState, pwFormAction, pwPending] = useActionState(passwordAction ?? createAction!, init);

  return (
    <div className="space-y-6">
      {/* Ana form */}
      <form action={formAction} className="space-y-4">
        {state.error && <p className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{state.error}</p>}
        {state.success && <p className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">Güncellendi.</p>}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
            <input name="firstName" required defaultValue={staff?.firstName} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Soyad *</label>
            <input name="lastName" required defaultValue={staff?.lastName} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
        </div>

        {!staff && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
            <input name="email" type="email" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
        )}

        {!staff && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre *</label>
            <input name="password" type="password" required minLength={8} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="En az 8 karakter" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
          <select name="roleId" required defaultValue={staff?.roleId ?? ""} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
            <option value="">Rol seçin…</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>

        {staff && (
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" name="active" value="true" defaultChecked={staff.active} className="rounded border-gray-300" />
            Aktif
          </label>
        )}

        <button type="submit" disabled={isPending} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition-colors">
          {isPending ? "Kaydediliyor…" : staff ? "Güncelle" : "Personel Oluştur"}
        </button>
      </form>

      {/* Şifre sıfırlama (sadece edit modunda) */}
      {staff && passwordAction && (
        <div className="border-t border-gray-100 pt-4">
          <p className="mb-3 text-sm font-semibold text-gray-900">Şifre Değiştir</p>
          <form action={pwFormAction} className="flex gap-2">
            {pwState.error && <p className="text-xs text-red-600 mb-2">{pwState.error}</p>}
            {pwState.success && <p className="text-xs text-green-600 mb-2">Şifre güncellendi.</p>}
            <input name="password" type="password" minLength={8} required placeholder="Yeni şifre (min 8 karakter)" className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            <button type="submit" disabled={pwPending} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors">
              {pwPending ? "…" : "Güncelle"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
