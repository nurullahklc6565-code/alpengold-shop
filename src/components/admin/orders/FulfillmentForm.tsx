"use client";

import { useActionState } from "react";
import { updateFulfillmentAction, type OrderActionState } from "@/server/actions/admin/order";
import type { FulfillmentStatus } from "@prisma/client";

type Props = {
  orderId: string;
  currentFulfillmentStatus: FulfillmentStatus;
  currentTrackingNumber: string | null;
  currentCarrierCode: string | null;
  currentAdminNote: string | null;
};

const FULFILLMENT_OPTIONS: { value: FulfillmentStatus; label: string }[] = [
  { value: "UNFULFILLED", label: "Gönderilmedi" },
  { value: "PARTIALLY_FULFILLED", label: "Kısmen Gönderildi" },
  { value: "FULFILLED", label: "Gönderildi" },
  { value: "RETURNED", label: "İade Edildi" },
];

const CARRIERS = [
  { code: "", label: "— Kargo Firması Seçin —" },
  { code: "PTT", label: "PTT Kargo" },
  { code: "YURTICI", label: "Yurtiçi Kargo" },
  { code: "ARAS", label: "Aras Kargo" },
  { code: "MNG", label: "MNG Kargo" },
  { code: "SURAT", label: "Sürat Kargo" },
  { code: "UPS", label: "UPS" },
  { code: "DHL", label: "DHL" },
  { code: "FEDEX", label: "FedEx" },
  { code: "DIGER", label: "Diğer" },
];

const init: OrderActionState = {};

export function FulfillmentForm({
  orderId,
  currentFulfillmentStatus,
  currentTrackingNumber,
  currentCarrierCode,
  currentAdminNote,
}: Props) {
  const action = updateFulfillmentAction.bind(null, orderId);
  const [state, formAction, isPending] = useActionState(action, init);

  return (
    <form action={formAction} className="space-y-3">
      {state.error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{state.error}</p>
      )}
      {state.success && (
        <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2">Güncellendi.</p>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Gönderim Durumu</label>
        <select name="fulfillmentStatus" defaultValue={currentFulfillmentStatus}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
          {FULFILLMENT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Kargo Firması</label>
        <select name="carrierCode" defaultValue={currentCarrierCode ?? ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
          {CARRIERS.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Takip Numarası</label>
        <input name="trackingNumber" defaultValue={currentTrackingNumber ?? ""}
          placeholder="Kargo takip numarası"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900" />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Admin Notu</label>
        <textarea name="adminNote" defaultValue={currentAdminNote ?? ""} rows={2}
          placeholder="Müşterinin görmediği dahili not…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900" />
      </div>

      <button type="submit" disabled={isPending}
        className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition-colors">
        {isPending ? "Kaydediliyor…" : "Kargo Bilgisini Kaydet"}
      </button>
    </form>
  );
}
