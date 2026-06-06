import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { StaffForm } from "@/components/admin/staff/StaffForm";
import { createStaffAction } from "@/server/actions/admin/staff";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Yeni Personel" };

export default async function NewStaffPage() {
  const roles = await prisma.role.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/staff" className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"><ArrowLeft className="h-4 w-4" /></Link>
        <h1 className="text-xl font-semibold text-gray-900">Yeni Personel</h1>
      </div>
      <div className="max-w-lg">
        <SectionCard title="Personel Bilgileri">
          <StaffForm roles={roles} createAction={createStaffAction} />
        </SectionCard>
      </div>
    </div>
  );
}
