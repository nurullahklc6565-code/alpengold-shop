import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export const staffService = {
  async list() {
    return prisma.staffUser.findMany({
      orderBy: { createdAt: "desc" },
      include: { role: true },
    });
  },

  async get(id: string) {
    return prisma.staffUser.findUnique({
      where: { id },
      include: { role: true, activityLogs: { orderBy: { createdAt: "desc" }, take: 10 } },
    });
  },

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    roleId: string;
  }) {
    const existing = await prisma.staffUser.findUnique({ where: { email: data.email } });
    if (existing) throw new Error("Bu e-posta zaten kayıtlı.");
    const passwordHash = await hash(data.password, 12);
    return prisma.staffUser.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        roleId: data.roleId,
        active: true,
      },
    });
  },

  async update(id: string, data: { firstName?: string; lastName?: string; roleId?: string; active?: boolean }) {
    return prisma.staffUser.update({ where: { id }, data });
  },

  async resetPassword(id: string, newPassword: string) {
    const passwordHash = await hash(newPassword, 12);
    return prisma.staffUser.update({ where: { id }, data: { passwordHash } });
  },

  async delete(id: string, requesterId: string) {
    if (id === requesterId) throw new Error("Kendinizi silemezsiniz.");
    return prisma.staffUser.delete({ where: { id } });
  },
};
