"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCustomerSession } from "@/lib/customer-session";
import { customerService } from "@/server/services/storefront/customer.service";
import { prisma } from "@/lib/prisma";

const addressSchema = z.object({
  firstName: z.string().min(1, "Ad zorunludur"),
  lastName: z.string().min(1, "Soyad zorunludur"),
  company: z.string().optional(),
  line1: z.string().min(1, "Adres zorunludur"),
  line2: z.string().optional(),
  city: z.string().min(1, "Şehir zorunludur"),
  province: z.string().optional(),
  zip: z.string().optional(),
  countryId: z.string().min(1, "Ülke zorunludur"),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type AddressActionState = { error?: string; success?: boolean };

export async function addAddressAction(
  _prev: AddressActionState,
  formData: FormData
): Promise<AddressActionState> {
  const customerId = await getCustomerSession();
  if (!customerId) return { error: "Oturum açmanız gerekiyor." };

  const parsed = addressSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    company: formData.get("company") || undefined,
    line1: formData.get("line1"),
    line2: formData.get("line2") || undefined,
    city: formData.get("city"),
    province: formData.get("province") || undefined,
    zip: formData.get("zip") || undefined,
    countryId: formData.get("countryId"),
    phone: formData.get("phone") || undefined,
    isDefault: formData.get("isDefault") === "true",
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };

  try {
    await customerService.addAddress(customerId, parsed.data);
    revalidatePath("/account/addresses");
    revalidatePath("/account");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Hata oluştu" };
  }
}

export async function deleteAddressAction(addressId: string): Promise<void> {
  const customerId = await getCustomerSession();
  if (!customerId) return;
  await customerService.deleteAddress(customerId, addressId);
  revalidatePath("/account/addresses");
  revalidatePath("/account");
}

export async function setDefaultAddressAction(addressId: string): Promise<void> {
  const customerId = await getCustomerSession();
  if (!customerId) return;

  await prisma.$transaction([
    prisma.address.updateMany({ where: { customerId }, data: { isDefault: false } }),
    prisma.address.updateMany({ where: { id: addressId, customerId }, data: { isDefault: true } }),
  ]);
  revalidatePath("/account/addresses");
}
