"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { customerService } from "@/server/services/storefront/customer.service";
import { createCustomerToken, customerCookieOptions } from "@/lib/customer-session";

export type AuthState = { error?: string; success?: boolean };

const registerSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
  firstName: z.string().min(1, "Ad zorunludur"),
  lastName: z.string().min(1, "Soyad zorunludur"),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };

  try {
    const customer = await customerService.register(parsed.data);
    const token = createCustomerToken(customer.id);
    const cookieStore = await cookies();
    cookieStore.set({ ...customerCookieOptions(), value: token });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Kayıt oluşturulamadı" };
  }

  redirect("/account");
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Geçersiz giriş bilgileri" };

  const customer = await customerService.login(parsed.data.email, parsed.data.password);
  if (!customer) return { error: "E-posta veya şifre hatalı" };

  const token = createCustomerToken(customer.id);
  const cookieStore = await cookies();
  cookieStore.set({ ...customerCookieOptions(), value: token });

  redirect("/account");
}

export async function logoutCustomerAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("customer_token");
  redirect("/");
}

const profileSchema = z.object({
  firstName: z.string().min(1, "Ad zorunludur"),
  lastName: z.string().min(1, "Soyad zorunludur"),
  phone: z.string().optional(),
});

export async function updateProfileAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const { getCustomerSession } = await import("@/lib/customer-session");
  const customerId = await getCustomerSession();
  if (!customerId) return { error: "Giriş yapmanız gerekiyor" };

  const parsed = profileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };

  try {
    await customerService.updateProfile(customerId, parsed.data);
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/account");
    revalidatePath("/account/profile");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Profil güncellenemedi" };
  }
}
