import { prisma } from "@/lib/prisma";

export const roleService = {
  async listWithPermissions() {
    return prisma.role.findMany({
      include: {
        rolePermissions: { include: { permission: true } },
        _count: { select: { staffUsers: true } },
      },
      orderBy: { name: "asc" },
    });
  },

  async listAllPermissions() {
    return prisma.permission.findMany({
      orderBy: [{ resource: "asc" }, { action: "asc" }],
    });
  },

  async togglePermission(roleId: string, permissionId: string): Promise<boolean> {
    const exists = await prisma.rolePermission.findUnique({
      where: { roleId_permissionId: { roleId, permissionId } },
    });
    if (exists) {
      await prisma.rolePermission.delete({
        where: { roleId_permissionId: { roleId, permissionId } },
      });
      return false;
    } else {
      await prisma.rolePermission.create({ data: { roleId, permissionId } });
      return true;
    }
  },

  async setRolePermissions(roleId: string, permissionIds: string[]) {
    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { roleId } }),
      prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
        skipDuplicates: true,
      }),
    ]);
  },
};
