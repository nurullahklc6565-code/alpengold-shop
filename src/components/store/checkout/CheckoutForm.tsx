"use client";

import { useActionState } from "react";
import { placeOrderAction, type CheckoutState } from "@/server/actions/store/checkout";
import type { CartData } from "@/server/services/storefront/cart.service";

type Country = { id: string; name: string; codeIso2: string; flagEmoji: string | null };
type ShippingOption = { id: string | null; name: string; rate: number; currencyCode?: string; isFree: boolean; freeAbove?: number | null };

type Props = {
  cart: CartData;
  countries: Country[];
  shippingOptions: ShippingOption[];
  marketCurrencyCode: string;
  customerEmail?: string;
};

const init: CheckoutState = {};

const inputCls =
  "w-full border border-[#e5e5e5] bg-white px-4 py-3 text-[13px] text-[#0a0a0a] placeholder:text-[#d4d4d4] outline-none focus:border-[#0a0a0a] transition-colors";

const sectionTitle =
  "text-[11px] font-semibold uppercase tracking-[0.08em] text-[#525252] mb-3";

function fmtRate(rate: number, code: string) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: code }).format(rate);
}

export function CheckoutForm({ cart, countries, shippingOptions, marketCurrencyCode, customerEmail }: Props) {
  const [state, formAction, isPending] = useActionState(placeOrderAction, init);

  return (
    <form action={formAction} className="space-y-8">
      {state.error && (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {state.error}
        </div>
      )}

      {/* İletişim */}
      <section>
        <h2 className={sectionTitle}>İletişim</h2>
        <input
          name="email"
          type="email"
          defaultValue={customerEmail}
          required
          placeholder="E-posta adresiniz *"
          className={inputCls}
        />
      </section>

      {/* Teslimat Adresi */}
      <section>
        <h2 className={sectionTitle}>Teslimat Adresi</h2>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input name="firstName" required placeholder="Ad *" className={inputCls} />
            <input name="lastName"  required placeholder="Soyad *" className={inputCls} />
          </div>
          <input name="line1" required placeholder="Adres satırı 1 *" className={inputCls} />
          <input name="line2" placeholder="Adres satırı 2 (opsiyonel)" className={inputCls} />
          <div className="grid grid-cols-2 gap-2">
            <input name="city"     required placeholder="Şehir *"       className={inputCls} />
            <input name="province"         placeholder="İl / Eyalet"     className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input name="zip" placeholder="Posta kodu" className={inputCls} />
            <select
              name="countryId"
              required
              defaultValue=""
              className={`${inputCls} cursor-pointer`}
            >
              <option value="" disabled>Ülke seçin *</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.flagEmoji ? `${c.flagEmoji} ` : ""}{c.name}
                </option>
              ))}
            </select>
          </div>
          <input name="phone" type="tel" placeholder="Telefon (opsiyonel)" className={inputCls} />
        </div>
      </section>

      {/* Kargo */}
      <section>
        <h2 className={sectionTitle}>Kargo Yöntemi</h2>
        <div className="border border-[#e5e5e5] divide-y divide-[#e5e5e5]">
          {shippingOptions.map((opt, i) => (
            <label
              key={opt.id ?? "free"}
              className="flex cursor-pointer items-center justify-between px-4 py-3.5 hover:bg-[#fafafa] transition-colors"
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shippingRateId"
                  value={opt.id ?? ""}
                  defaultChecked={i === 0}
                  className="accent-[#0a0a0a]"
                />
                <span className="text-[13px] font-medium text-[#0a0a0a]">{opt.name}</span>
              </div>
              <span className="text-[13px] font-semibold text-[#0a0a0a]">
                {opt.isFree || opt.rate === 0
                  ? "Ücretsiz"
                  : fmtRate(opt.rate, opt.currencyCode ?? marketCurrencyCode)}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* İndirim Kodu */}
      <section>
        <h2 className={sectionTitle}>İndirim Kodu</h2>
        <input
          name="couponCode"
          placeholder="Kupon kodunu girin (opsiyonel)"
          className={`${inputCls} uppercase`}
          autoComplete="off"
        />
      </section>

      {/* Sipariş Özeti */}
      <section className="border border-[#e5e5e5] p-5 bg-[#fafafa]">
        <h2 className={sectionTitle}>Sipariş Özeti</h2>
        <div className="space-y-2">
          {cart.lines.map((line) => (
            <div key={line.variantId} className="flex justify-between text-[13px] text-[#525252]">
              <span className="truncate pr-4">{line.productName} × {line.quantity}</span>
              <span className="shrink-0">{line.formattedLineTotal ?? "—"}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-[#e5e5e5] flex justify-between">
          <span className="text-[13px] font-semibold text-[#0a0a0a]">Ara Toplam</span>
          <span className="text-[13px] font-semibold text-[#0a0a0a]">{cart.formattedSubtotal}</span>
        </div>
      </section>

      <button
        type="submit"
        disabled={isPending || cart.hasUnavailableItems}
        className="store-btn-primary w-full py-4 text-[13px] font-semibold uppercase tracking-[0.06em] disabled:opacity-60"
      >
        {isPending ? "Sipariş oluşturuluyor…" : "Siparişi Onayla"}
      </button>

      <p className="text-center text-[11px] text-[#a3a3a3]">
        Siparişi onaylayarak{" "}
        <a href="/kullanim-sartlari" className="underline">Kullanım Şartları</a>
        {" "}ve{" "}
        <a href="/gizlilik-politikasi" className="underline">Gizlilik Politikası</a>
        'nı kabul etmiş olursunuz.
      </p>
    </form>
  );
}
