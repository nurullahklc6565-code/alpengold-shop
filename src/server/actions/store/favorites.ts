"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-session";
import { favoritesService } from "@/server/services/storefront/favorites.service";

export async function toggleFavoriteAction(
  productId: string,
  productSlug: string
): Promise<{ added: boolean } | void> {
  const customerId = await getCustomerSession();
  if (!customerId) redirect(`/account/login?callbackUrl=/products/${productSlug}`);

  const added = await favoritesService.toggle(customerId, productId);
  revalidatePath(`/products/${productSlug}`);
  revalidatePath("/account/favorites");
  return { added };
}

/** Header favori sayacı ve FavoritesProvider için güncel favori ürün ID listesini döner */
export async function getFavoriteProductIdsAction(): Promise<string[]> {
  const customerId = await getCustomerSession();
  if (!customerId) return [];
  return favoritesService.getProductIds(customerId);
}
