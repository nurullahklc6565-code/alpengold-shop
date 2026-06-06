import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export type StaffSession = {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
};

/** Server component ve server action'larda geçerli oturumu döner, yoksa null */
export async function getCurrentUser(): Promise<StaffSession | null> {
  const session = await auth();
  if (!session?.user) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? "",
    role: session.user.role,
    permissions: session.user.permissions ?? [],
  };
}

/** Oturum yoksa login'e yönlendirir */
export async function requireAuth(): Promise<StaffSession> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** RBAC: kullanıcının yetkisi var mı? */
export function hasPermission(
  user: StaffSession,
  resource: string,
  action: string
): boolean {
  if (user.role === "SUPER_ADMIN") return true;
  return user.permissions.includes(`${resource}:${action}`);
}

/** Yetkisi yoksa 403 sayfasına yönlendirir */
export async function requirePermission(
  resource: string,
  action: string
): Promise<StaffSession> {
  const user = await requireAuth();
  if (!hasPermission(user, resource, action)) {
    redirect("/admin/forbidden");
  }
  return user;
}
