import { requireAuth } from "@/lib/auth-helpers";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import { AdminToaster } from "@/components/admin/ui/toast";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <div
      className="flex h-screen overflow-hidden bg-zinc-50"
      style={{ colorScheme: "light" }}
    >
      <AdminSidebar user={user} />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <AdminHeader user={user} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="px-6 py-6 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      <AdminToaster />
    </div>
  );
}
