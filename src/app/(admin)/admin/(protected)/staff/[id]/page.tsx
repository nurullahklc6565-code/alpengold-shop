import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { StaffForm } from "@/components/admin/staff/StaffForm";
import { DeleteButton } from "@/components/admin/ui/DeleteButton";
import { staffService } from "@/server/services/staff.service";
import {
  updateStaffAction,
  resetStaffPasswordAction,
  deleteStaffAction,
} from "@/server/actions/admin/staff";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Personel Düzenle" };

export default async function StaffEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [currentUser, staff, roles] = await Promise.all([
    requireAuth(),
    staffService.get(id),
    prisma.role.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!staff) return notFound();

  const updateAction = updateStaffAction.bind(null, id);
  const passwordAction = resetStaffPasswordAction.bind(null, id);
  const deleteAction = deleteStaffAction.bind(null, id, currentUser.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/staff" className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"><ArrowLeft className="h-4 w-4" /></Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{staff.firstName} {staff.lastName}</h1>
            <p className="text-sm text-gray-500">{staff.email} · {staff.role.name}</p>
          </div>
        </div>
        {staff.id !== currentUser.id && (
          <DeleteButton onDelete={deleteAction} confirmMessage={`${staff.firstName} ${staff.lastName} kullanıcısını silmek istediğinizden emin misiniz?`} />
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Personel Bilgileri">
          <StaffForm
            staff={staff}
            roles={roles}
            updateAction={updateAction}
            passwordAction={passwordAction}
          />
        </SectionCard>

        <SectionCard title="Son Aktiviteler">
          {staff.activityLogs.length === 0 ? (
            <p className="text-sm text-gray-400">Henüz aktivite yok.</p>
          ) : (
            <div className="space-y-2">
              {staff.activityLogs.map((log) => (
                <div key={log.id} className="text-xs">
                  <span className="font-mono text-gray-600">{log.action}</span>
                  <span className="text-gray-400 ml-2">{log.resource}</span>
                  <span className="text-gray-300 ml-2">{new Date(log.createdAt).toLocaleString("tr-TR")}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
