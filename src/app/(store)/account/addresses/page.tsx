import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { getCustomerSession } from "@/lib/customer-session";
import { customerService } from "@/server/services/storefront/customer.service";
import { deleteAddressAction, setDefaultAddressAction, addAddressAction } from "@/server/actions/store/address";
import { prisma } from "@/lib/prisma";
import { AddressFormClient } from "./AddressFormClient";

export const metadata: Metadata = { title: "Adreslerim" };

export default async function AddressesPage() {
  const customerId = await getCustomerSession();
  if (!customerId) redirect("/account/login");

  const [customer, countries] = await Promise.all([
    customerService.findById(customerId),
    prisma.country.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true, flagEmoji: true } }),
  ]);

  if (!customer) redirect("/account/login");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/account" className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Adreslerim</h1>
      </div>

      {/* Kayıtlı adresler */}
      {customer.addresses.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {customer.addresses.map((addr) => (
            <div key={addr.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {addr.isDefault && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                  <p className="text-sm font-medium text-gray-900">{addr.firstName} {addr.lastName}</p>
                </div>
                <div className="flex gap-2">
                  {!addr.isDefault && (
                    <form action={setDefaultAddressAction.bind(null, addr.id)}>
                      <button type="submit" className="text-xs text-blue-500 hover:text-blue-700">Varsayılan Yap</button>
                    </form>
                  )}
                  <form action={deleteAddressAction.bind(null, addr.id)}>
                    <button type="submit" className="text-xs text-red-500 hover:text-red-700">Sil</button>
                  </form>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>{addr.line1}</p>
                {addr.line2 && <p>{addr.line2}</p>}
                <p>{addr.city}{addr.province ? `, ${addr.province}` : ""} {addr.zip}</p>
                <p>{addr.country.name}</p>
                {addr.phone && <p>{addr.phone}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Yeni adres ekle */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Yeni Adres Ekle</h2>
        <AddressFormClient countries={countries} addAction={addAddressAction} />
      </div>
    </div>
  );
}
