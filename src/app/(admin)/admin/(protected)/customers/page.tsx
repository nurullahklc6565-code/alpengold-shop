import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Müşteriler" };

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1");
  const perPage = 30;
  const where = sp.search
    ? {
        OR: [
          { email: { contains: sp.search, mode: "insensitive" as const } },
          { firstName: { contains: sp.search, mode: "insensitive" as const } },
          { lastName: { contains: sp.search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        _count: { select: { orders: true, addresses: true } },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return (
    <div>
      <PageHeader title="Müşteriler" description={`${total} müşteri`} />

      <div className="mb-4">
        <form>
          <input name="search" defaultValue={sp.search} placeholder="E-posta, ad veya soyad ara…"
            className="w-64 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Müşteri</th>
              <th className="px-4 py-3 text-left">Sipariş</th>
              <th className="px-4 py-3 text-left">Adres</th>
              <th className="px-4 py-3 text-left">Kayıt</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-sm text-gray-400">Müşteri bulunamadı.</td></tr>
            ) : customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{c.firstName} {c.lastName}</p>
                  <p className="text-xs text-gray-400">{c.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{c._count.orders}</td>
                <td className="px-4 py-3 text-gray-600">{c._count.addresses}</td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {new Date(c.createdAt).toLocaleDateString("tr-TR")}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/customers/${c.id}`} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900">
                    Detay <ChevronRight className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
