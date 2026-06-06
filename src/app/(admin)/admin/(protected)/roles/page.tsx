import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { roleService } from "@/server/services/role.service";
import { setRolePermissionsAction } from "@/server/actions/admin/role";

export const metadata: Metadata = { title: "Roller & Yetkiler" };

export default async function RolesPage() {
  const [roles, allPermissions] = await Promise.all([
    roleService.listWithPermissions(),
    roleService.listAllPermissions(),
  ]);

  const resources = Array.from(new Set(allPermissions.map((p) => p.resource))).sort();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roller & Yetkiler"
        description="SUPER_ADMIN rolü değiştirilemez ve tüm izinlere otomatik sahiptir."
      />

      {/* Rol kartları */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {roles.map((role) => (
          <div key={role.id} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <p className="font-semibold text-gray-900">{role.name}</p>
            <p className="mt-1 text-2xl font-bold text-gray-700">{role._count.staffUsers}</p>
            <p className="text-xs text-gray-400">personel</p>
            {role.name !== "SUPER_ADMIN" && (
              <p className="mt-1 text-xs text-gray-400">{role.rolePermissions.length} yetki</p>
            )}
          </div>
        ))}
      </div>

      {/* Her rol için yetki formu */}
      {roles.filter((r) => r.name !== "SUPER_ADMIN").map((role) => {
        const rolePermIds = new Set(role.rolePermissions.map((rp) => rp.permissionId));
        const saveAction = setRolePermissionsAction.bind(null, role.id);

        return (
          <SectionCard key={role.id} title={`${role.name} — Yetkiler`}>
            <form action={saveAction} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {resources.map((resource) => {
                  const perms = allPermissions.filter((p) => p.resource === resource);
                  return (
                    <div key={resource} className="rounded-lg bg-gray-50 p-3">
                      <p className="mb-2 text-xs font-semibold text-gray-600 uppercase">{resource}</p>
                      <div className="space-y-1">
                        {perms.map((perm) => (
                          <label key={perm.id} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                            <input
                              type="checkbox"
                              name="permissions"
                              value={perm.id}
                              defaultChecked={rolePermIds.has(perm.id)}
                              className="rounded border-gray-300 accent-gray-900"
                            />
                            {perm.action}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button type="submit" className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
                {role.name} Yetkilerini Kaydet
              </button>
            </form>
          </SectionCard>
        );
      })}
    </div>
  );
}
