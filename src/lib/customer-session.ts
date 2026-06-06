import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "customer_token";
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 gün

type Payload = { sub: string; iat: number; exp: number };

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET tanımlı değil");
  return s;
}

export function createCustomerToken(customerId: string): string {
  const payload: Payload = { sub: customerId, iat: Date.now(), exp: Date.now() + TTL_MS };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyCustomerToken(token: string): string | null {
  try {
    const [encoded, sig] = token.split(".");
    if (!encoded || !sig) return null;
    const expected = crypto.createHmac("sha256", secret()).update(encoded).digest("base64url");
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString()) as Payload;
    if (payload.exp < Date.now()) return null;
    return payload.sub;
  } catch {
    return null;
  }
}

export async function getCustomerSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  return verifyCustomerToken(token);
}

export function customerCookieOptions() {
  return {
    name: COOKIE,
    maxAge: TTL_MS / 1000,
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}
