"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const MARKET_COOKIE = "preferred_market_id";

/**
 * Kullanıcının pazar tercihini cookie'ye kaydeder ve aynı sayfaya döner.
 * URL'de herhangi bir ülke kodu geçmez — seçim tamamen cookie tabanlıdır.
 */
export async function switchMarketAction(formData: FormData): Promise<void> {
  const marketId = formData.get("marketId") as string;
  const returnTo = (formData.get("returnTo") as string) || "/";

  if (!marketId) redirect(returnTo);

  const market = await prisma.market.findFirst({
    where: { id: marketId, active: true },
  });

  if (market) {
    const cookieStore = await cookies();
    cookieStore.set(MARKET_COOKIE, market.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 gün
      sameSite: "lax",
      httpOnly: false, // client-side okuma için
    });
  }

  redirect(returnTo);
}
