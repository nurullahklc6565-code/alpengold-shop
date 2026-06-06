import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, MapPin, User, Receipt, ChevronRight } from "lucide-react";
import { getCustomerSession } from "@/lib/customer-session";
import { customerService } from "@/server/services/storefront/customer.service";
import { favoritesService } from "@/server/services/storefront/favorites.service";
import { logoutCustomerAction } from "@/server/actions/store/customer";
import { formatPrice } from "@/lib/utils/pricing";

export const metadata: Metadata = { title: "Hesabım" };

const STATUS_LABEL: Record<string, string> = {
  PAID:    "Ödendi",
  PENDING: "Bekliyor",
  FAILED:  "Başarısız",
  REFUNDED: "İade",
};

export default async function AccountPage() {
  const sessionId = await getCustomerSession();
  if (!sessionId) redirect("/account/login");

  const customer = await customerService.findById(sessionId);
  if (!customer) redirect("/account/login");

  const [orders, favCount] = await Promise.all([
    customerService.getOrders(sessionId),
    favoritesService.count(sessionId),
  ]);

  return (
    <div className="max-w-[900px] mx-auto px-6 py-12 space-y-10">

      {/* Üst: karşılama + çıkış */}
      <div className="flex items-start justify-between border-b border-[#e5e5e5] pb-8">
        <div>
          <p className="store-eyebrow mb-2">Hesabım</p>
          <h1 className="store-section-title">Merhaba, {customer.firstName}.</h1>
          <p className="mt-1 text-[13px] text-[#a3a3a3]">{customer.email}</p>
        </div>
        <form action={logoutCustomerAction}>
          <button
            type="submit"
            className="border border-[#e5e5e5] px-5 py-2 text-[13px] text-[#525252] hover:border-[#a3a3a3] hover:text-[#0a0a0a] transition-colors"
          >
            Çıkış Yap
          </button>
        </form>
      </div>

      {/* Hızlı erişim kartları */}
      <div className="grid grid-cols-2 gap-px border border-[#e5e5e5] bg-[#e5e5e5] sm:grid-cols-4">
        {[
          { href: "/account/profile",   icon: User,    label: "Profilim",     sub: "Bilgileri düzenle" },
          { href: "/account/favorites", icon: Heart,   label: "Favorilerim",  sub: `${favCount} ürün` },
          { href: "/account/addresses", icon: MapPin,  label: "Adreslerim",   sub: `${customer.addresses.length} adres` },
          { href: "/account/orders",    icon: Receipt, label: "Siparişlerim", sub: `${orders.length} sipariş` },
        ].map(({ href, icon: Icon, label, sub }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col items-start gap-3 bg-white p-5 hover:bg-[#f9f9f9] transition-colors"
          >
            <Icon className="h-5 w-5 text-[#a3a3a3] group-hover:text-[#0a0a0a] transition-colors" strokeWidth={1.5} />
            <div>
              <p className="text-[13px] font-semibold text-[#0a0a0a]">{label}</p>
              <p className="text-[12px] text-[#a3a3a3]">{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Son siparişler */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[14px] font-semibold uppercase tracking-[0.06em] text-[#0a0a0a]">
            Son Siparişler
          </h2>
          {orders.length > 3 && (
            <Link href="/account/orders" className="flex items-center gap-1 text-[12px] text-[#525252] hover:text-[#0a0a0a] transition-colors">
              Tümü <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="border border-dashed border-[#e5e5e5] py-14 text-center">
            <p className="store-eyebrow text-[#a3a3a3]">Henüz sipariş yok</p>
            <Link href="/products" className="mt-4 inline-block store-btn-primary px-8 py-3 text-[13px]">
              Alışveriş Yap
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#e5e5e5] border border-[#e5e5e5]">
            {orders.slice(0, 3).map((order) => {
              const currency = {
                code: order.currency.code,
                symbol: order.currency.symbol,
                decimalDigits: order.currency.decimalDigits,
              };
              return (
                <div key={order.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-[13px] font-semibold text-[#0a0a0a]">{order.number}</p>
                    <p className="text-[12px] text-[#a3a3a3]">
                      {new Date(order.createdAt).toLocaleDateString("tr-TR")} · {order.market.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold text-[#0a0a0a]">
                      {formatPrice(Number(order.totalPrice), currency)}
                    </p>
                    <span className={`text-[11px] font-medium ${
                      order.paymentStatus === "PAID" ? "text-emerald-600" : "text-amber-600"
                    }`}>
                      {STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Kayıtlı adresler */}
      {customer.addresses.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold uppercase tracking-[0.06em] text-[#0a0a0a]">
              Adresler
            </h2>
            <Link href="/account/addresses" className="flex items-center gap-1 text-[12px] text-[#525252] hover:text-[#0a0a0a] transition-colors">
              Yönet <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {customer.addresses.slice(0, 2).map((addr) => (
              <div key={addr.id} className="border border-[#e5e5e5] p-4">
                <p className="text-[13px] font-semibold text-[#0a0a0a]">
                  {addr.firstName} {addr.lastName}
                </p>
                <p className="mt-1 text-[13px] text-[#525252]">{addr.line1}</p>
                <p className="text-[13px] text-[#525252]">{addr.city}, {addr.country.name}</p>
                {addr.isDefault && (
                  <span className="mt-2 inline-block store-eyebrow text-[#0a0a0a]">Varsayılan</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
