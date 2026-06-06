import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { verifyCustomerToken } from "@/lib/customer-session";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin rotaları ────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const isPublicAdmin = pathname === "/admin/login" || pathname === "/admin/forbidden";
    const adminToken = await getToken({ req, secret: process.env.AUTH_SECRET });

    if (!isPublicAdmin && !adminToken) {
      const url = new URL("/admin/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (pathname === "/admin/login" && adminToken) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // ── Müşteri hesabı rotaları ───────────────────────────────────────────────
  const isAccountRoute = pathname.startsWith("/account");
  const isPublicAccount =
    pathname === "/account/login" || pathname === "/account/register";

  if (isAccountRoute && !isPublicAccount) {
    const customerToken = req.cookies.get("customer_token")?.value;
    const customerId = customerToken ? verifyCustomerToken(customerToken) : null;

    if (!customerId) {
      const url = new URL("/account/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  // ── Bakım modu (storefront) ───────────────────────────────────────────────
  // API rotaları ve admin etkilenmez
  const isApiRoute = pathname.startsWith("/api");
  const isAdminRoute = pathname.startsWith("/admin");
  if (!isApiRoute && !isAdminRoute) {
    const maintenanceCookie = req.cookies.get("maintenance_bypass")?.value;
    const maintenanceMode = process.env.MAINTENANCE_MODE === "true";

    if (maintenanceMode && !maintenanceCookie) {
      // Bakım sayfasına yönlendir (admin bu rotayı oluşturabilir)
      const res = NextResponse.next();
      res.headers.set("X-Maintenance-Mode", "true");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
