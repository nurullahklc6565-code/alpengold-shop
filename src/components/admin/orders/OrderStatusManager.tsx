"use client";

import { useActionState } from "react";
import {
  changeOrderStatusAction,
  changePaymentStatusAction,
  type OrderActionState,
} from "@/server/actions/admin/order";
import type { OrderStatus, PaymentStatus } from "@prisma/client";

type Props = {
  orderId: string;
  currentStatus: OrderStatus;
  currentPaymentStatus: PaymentStatus;
  userRole: string;
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Bekliyor", CONFIRMED: "Onaylandı", PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda", DELIVERED: "Teslim Edildi", CANCELLED: "İptal", REFUNDED: "İade",
};

const ALLOWED_NEXT_STATUS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
};

const ALLOWED_NEXT_PAYMENT: Record<string, string[]> = {
  UNPAID: ["PAID"],
  PAID: ["REFUNDED"],
  PARTIALLY_PAID: ["PAID", "REFUNDED"],
  REFUNDED: [],
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: "Ödenmedi", PAID: "Ödendi", PARTIALLY_PAID: "Kısmi Ödeme", REFUNDED: "İade",
};

const init: OrderActionState = {};

export function OrderStatusManager({ orderId, currentStatus, currentPaymentStatus, userRole }: Props) {
  const nextStatuses = ALLOWED_NEXT_STATUS[currentStatus] ?? [];
  const nextPaymentStatuses = ALLOWED_NEXT_PAYMENT[currentPaymentStatus] ?? [];
  const canChangePayment = userRole === "SUPER_ADMIN" && nextPaymentStatuses.length > 0;

  const [orderState, orderAction, orderPending] = useActionState(
    changeOrderStatusAction.bind(null, orderId),
    init
  );
  const [paymentState, paymentAction, paymentPending] = useActionState(
    changePaymentStatusAction.bind(null, orderId),
    init
  );

  return (
    <div className="space-y-4">
      {/* Sipariş Durumu */}
      {nextStatuses.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Sipariş Durumu Güncelle</h3>
          {orderState.error && <p className="mb-2 text-xs text-red-600">{orderState.error}</p>}
          {orderState.success && <p className="mb-2 text-xs text-green-600">Durum güncellendi.</p>}
          <form action={orderAction} className="space-y-3">
            <select name="status" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
              <option value="">Yeni durum seçin…</option>
              {nextStatuses.map((s) => (
                <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
              ))}
            </select>
            <input name="reason" placeholder="Gerekçe (opsiyonel)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            <button type="submit" disabled={orderPending} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition-colors">
              {orderPending ? "Güncelleniyor…" : "Durumu Güncelle"}
            </button>
          </form>
        </div>
      )}

      {/* Ödeme Durumu — SUPER_ADMIN + audit zorunlu */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-1 text-sm font-semibold text-gray-900">Ödeme Durumu</h3>
        {!canChangePayment && (
          <p className="text-xs text-gray-400">
            {nextPaymentStatuses.length === 0
              ? "Bu ödeme durumundan başka duruma geçilemez."
              : "Ödeme durumu değiştirmek için SUPER_ADMIN yetkisi gereklidir."}
          </p>
        )}

        {canChangePayment && (
          <>
            <p className="mb-3 text-xs text-amber-600 bg-amber-50 rounded p-2">
              Ödeme durumunu manuel değiştirmek tüm ayrıntılarıyla aktivite kaydına işlenir.
              PAID geçişi için ödeme referansı zorunludur.
            </p>
            {paymentState.error && <p className="mb-2 text-xs text-red-600">{paymentState.error}</p>}
            {paymentState.success && <p className="mb-2 text-xs text-green-600">Ödeme durumu güncellendi.</p>}
            <form action={paymentAction} className="space-y-3">
              <select name="paymentStatus" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                <option value="">Yeni ödeme durumu…</option>
                {nextPaymentStatuses.map((s) => (
                  <option key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</option>
                ))}
              </select>
              <input name="paymentReference" placeholder="Ödeme referans numarası (PAID için zorunlu)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              <textarea name="reason" required rows={2} placeholder="Gerekçe * (zorunlu)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900" />
              <button type="submit" disabled={paymentPending} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-60 transition-colors">
                {paymentPending ? "Kaydediliyor…" : "Ödeme Durumunu Güncelle"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
