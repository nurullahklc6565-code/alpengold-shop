import { cookies } from "next/headers";

const COOKIE = "cart_data";
const TTL_S = 60 * 60 * 24 * 30; // 30 gün

export type CartLineItem = {
  variantId: string;
  quantity: number;
};

export async function readCartCookie(): Promise<CartLineItem[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CartLineItem =>
        typeof item?.variantId === "string" && typeof item?.quantity === "number"
    );
  } catch {
    return [];
  }
}

export function encodeCartCookie(items: CartLineItem[]): string {
  return Buffer.from(JSON.stringify(items), "utf8").toString("base64");
}

export function cartCookieOptions() {
  return {
    name: COOKIE,
    maxAge: TTL_S,
    path: "/",
    httpOnly: false, // client JS okuyabilsin (cart count için)
    sameSite: "lax" as const,
  };
}
