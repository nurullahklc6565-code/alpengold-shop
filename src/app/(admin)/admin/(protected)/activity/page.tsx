import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Aktivite Kayıtları" };

const ACTION_LABELS: Record<string, string> = {
  order_status_changed: "Sipariş durumu değiştirildi",
  payment_status_changed: "Ödeme durumu değiştirildi",
};

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ resource?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1");
  const perPage = 50;
  const where = sp.resource ? { resource: sp.resource } : {};

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        staff: { select: { email: true, firstName: true, lastName: true, role: { select: { name: true } } } },
      },
    }),
    prisma.activityLog.count({ where }),
  ]);

  const resources = await prisma.activityLog.groupBy({ by: ["resource"] });

  return (
    <div>
      <PageHeader title="Aktivite Kayıtları" description={`${total} kayıt`} />

      <div className="mb-4 flex flex-wrap gap-2">
        {[{ value: "", label: "Tümü" }, ...resources.map((r) => ({ value: r.resource, label: r.resource }))].map((opt) => (
          <a key={opt.value} href={`/admin/activity?resource=${opt.value}`}
            className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${(sp.resource ?? "") === opt.value ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            {opt.label}
          </a>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Personel</th>
              <th className="px-4 py-3 text-left">İşlem</th>
              <th className="px-4 py-3 text-left">Kaynak</th>
              <th className="px-4 py-3 text-left">Detay</th>
              <th className="px-4 py-3 text-left">Tarih</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-sm text-gray-400">Kayıt bulunamadı.</td></tr>
            ) : logs.map((log) => {
              const payload = log.payload as Record<string, unknown> | null;
              return (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900">{log.staff.firstName} {log.staff.lastName}</p>
                    <p className="text-xs text-gray-400">{log.staff.role.name}</p>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-600">
                    {ACTION_LABELS[log.action] ?? log.action}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {log.resource}
                    {log.resourceId && <span className="ml-1 font-mono text-gray-400">#{log.resourceId.slice(0, 8)}</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-xs">
                    {payload && (
                      <span>
                        {Boolean(payload.from) && Boolean(payload.to) && `${String(payload.from ?? "")} → ${String(payload.to ?? "")}`}
                        {Boolean(payload.reason) && <span className="ml-1 italic text-gray-400">&quot;{String(payload.reason ?? "").slice(0, 40)}&quot;</span>}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(log.createdAt).toLocaleString("tr-TR")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
