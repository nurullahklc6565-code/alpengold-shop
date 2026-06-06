import { prisma } from "@/lib/prisma";
import { hash, compare } from "bcryptjs";
import { emailService } from "@/server/services/email.service";

export const customerService = {
  async findById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: {
          include: { country: { select: { name: true, codeIso2: true } } },
          orderBy: { isDefault: "desc" },
        },
      },
    });
  },

  async findByEmail(email: string) {
    return prisma.customer.findUnique({ where: { email } });
  },

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    const existing = await prisma.customer.findUnique({ where: { email: data.email } });
    if (existing) throw new Error("Bu e-posta adresi zaten kayıtlı.");

    const passwordHash = await hash(data.password, 12);
    const customer = await prisma.customer.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone ?? null,
        emailVerified: false,
        active: true,
      },
    });
    // Hoş geldin e-postası (async — hata kayıt akışını durdurmaz)
    emailService.sendWelcome(customer.id).catch(console.error);
    return customer;
  },

  async login(email: string, password: string) {
    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer || !customer.active || !customer.passwordHash) return null;
    const valid = await compare(password, customer.passwordHash);
    return valid ? customer : null;
  },

  async updateProfile(id: string, data: { firstName: string; lastName: string; phone?: string }) {
    return prisma.customer.update({
      where: { id },
      data: { firstName: data.firstName, lastName: data.lastName, phone: data.phone ?? null },
    });
  },

  // Konuk checkout için e-posta ile müşteri bul veya oluştur
  async findOrCreateGuest(email: string, firstName: string, lastName: string) {
    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) return existing;
    return prisma.customer.create({
      data: { email, firstName, lastName, active: true },
    });
  },

  async addAddress(
    customerId: string,
    data: {
      firstName: string; lastName: string; company?: string;
      line1: string; line2?: string; city: string;
      province?: string; zip?: string; countryId: string;
      phone?: string; isDefault?: boolean;
    }
  ) {
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { customerId },
        data: { isDefault: false },
      });
    }
    return prisma.address.create({ data: { customerId, ...data } });
  },

  async deleteAddress(customerId: string, addressId: string) {
    return prisma.address.deleteMany({ where: { id: addressId, customerId } });
  },

  async getOrders(customerId: string) {
    return prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      include: {
        currency: true,
        market: { select: { name: true } },
        items: {
          include: {
            variant: {
              include: { product: { select: { name: true, slug: true } } },
            },
          },
        },
      },
    });
  },
};
