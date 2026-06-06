"use client";

import { useTransition } from "react";
import { setRolePermissionsAction } from "@/server/actions/admin/role";
import { cn } from "@/lib/utils/cn";

type Permission = { id: string; resource: string; action: string };
type Role = { id: string; name: string; rolePermissions: Array<{ permissionId: string }> };
type Props = { roles: Role[]; permissions: Permission[] };

const ACTION_LABELS: Record<string, string> = {
  create: "Oluştur", read: "Oku", update: "Düzenle", delete: "Sil",
};

export function PermissionsMatrix({ roles, permissions }: Props) {
  const resources = Array.from(new Set(permissions.map((p) => p.resource))).sort();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="pb-3 pr-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide w-48">
              İzin
            </th>
            {roles.map((role) => (
              <th key={role.id} className="pb-3 px-3 text-center text-xs font-medium uppercase tracking-wide">
                <span className={cn(
                  "rounded-full px-2 py-1",
                  role.name === "SUPER_ADMIN" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"
                )}>
                  {role.name}
                </span>
                {role.name !== "SUPER_ADMIN" && (
                  <p className="mt-1 text-xs text-gray-400 font-normal normal-case">
                    (form ile toplu kaydet)
                  </p>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resources.map((resource) => {
            const resourcePerms = permissions.filter((p) => p.resource === resource);
            return (
              <tr key={resource}>
                <td colSpan={roles.length + 1} className="pt-4 pb-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{resource}</p>
                </td>
              </tr>
            ).type === "string" ? null : (
              <tr key={resource} className="contents">
                {resourcePerms.map((perm) => (
                  <tr key={perm.id} className="hover:bg-gray-50">
                    <td className="py-1 pr-4 text-xs text-gray-600 pl-3">
                      {ACTION_LABELS[perm.action] ?? perm.action}
                    </td>
                    {roles.map((role) => {
                      const hasPermission = role.rolePermissions.some((rp) => rp.permissionId === perm.id);
                      return (
                        <td key={role.id} className="py-1 px-3 text-center">
                          {role.name === "SUPER_ADMIN" ? (
                            <span className="text-amber-500 text-base">★</span>
                          ) : (
                            <RolePermCheckbox roleId={role.id} permissionId={perm.id} defaultChecked={hasPermission} />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RolePermCheckbox({ roleId, permissionId, defaultChecked }: { roleId: string; permissionId: string; defaultChecked: boolean }) {
  return (
    <input
      type="checkbox"
      name={`${roleId}_${permissionId}`}
      defaultChecked={defaultChecked}
      className="h-4 w-4 rounded border-gray-300 accent-gray-900"
    />
  );
}
