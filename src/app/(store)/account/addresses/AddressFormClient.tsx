"use client";

import { useActionState } from "react";
import type { AddressActionState } from "@/server/actions/store/address";

type Country = { id: string; name: string; flagEmoji: string | null };
type Props = {
  countries: Country[];
  addAction: (prev: AddressActionState, formData: FormData) => Promise<AddressActionState>;
};

const init: AddressActionState = {};

export function AddressFormClient({ countries, addAction }: Props) {
  const [state, formAction, isPending] = useActionState(addAction, init);

  return (
    <form action={formAction} className="space-y-3">
      {state.error && <p className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{state.error}</p>}
      {state.success && <p className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">Adres eklendi.</p>}

      <div className="grid grid-cols-2 gap-3">
        <input name="firstName" required placeholder="Ad *" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        <input name="lastName" required placeholder="Soyad *" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
      </div>
      <input name="line1" required placeholder="Adres *" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
      <input name="line2" placeholder="Adres 2 (opsiyonel)" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
      <div className="grid grid-cols-3 gap-3">
        <input name="city" required placeholder="Şehir *" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        <input name="province" placeholder="İl/Eyalet" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        <input name="zip" placeholder="Posta kodu" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
      </div>
      <select name="countryId" required className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
        <option value="">Ülke seçin *</option>
        {countries.map((c) => <option key={c.id} value={c.id}>{c.flagEmoji} {c.name}</option>)}
      </select>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" name="isDefault" value="true" className="rounded border-gray-300" />
          Varsayılan adres olarak ayarla
        </label>
        <button type="submit" disabled={isPending} className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60 transition-colors">
          {isPending ? "Ekleniyor…" : "Adres Ekle"}
        </button>
      </div>
    </form>
  );
}
