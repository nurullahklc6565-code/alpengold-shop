import type { Metadata } from "next";
import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { requireAuth } from "@/lib/auth-helpers";
import { staffService } from "@/server/services/staff.service";

export const metadata: Metadata = { title: "Personel" };

export default async function StaffPage() {
  const [currentUser, staffList] = await Promise.all([requireAuth(), staffService.list()]);

  return (
    <div>
      <PageHeader title="Personel" description={`${staffList.length} kullanıcı`}
        actions={
          <Link href="/admin/staff/new" className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
            <Plus className="h-4 w-4" /> Yeni Personel
          </Link>
        }
      />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Personel</th>
              <th className="px-4 py-3 text-left">Rol</th>
              <th className="px-4 py-3 text-left">Son Giriş</th>
              <th className="px-4 py-3 text-left">Durum</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staffList.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{s.firstName} {s.lastName}
                    {s.id === currentUser.id && <span className="ml-2 text-xs text-blue-500">(siz)</span>}
                  </p>
                  <p className="text-xs text-gray-400">{s.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{s.role.name}</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleDateString("tr-TR") : "—"}
                </td>
                <td className="px-4 py-3"><StatusBadge active={s.active} /></td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/staff/${s.id}`} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900">
                    Düzenle <ChevronRight className="h-3 w-3" />
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
