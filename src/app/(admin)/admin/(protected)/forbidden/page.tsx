import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Erişim Reddedildi" };

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 text-5xl font-bold text-gray-200">403</div>
      <h1 className="mb-2 text-xl font-semibold text-gray-900">
        Erişim Reddedildi
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Bu sayfayı görüntülemek için gerekli yetkiye sahip değilsiniz.
      </p>
      <Link
        href="/admin/dashboard"
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
      >
        Dashboard&apos;a Dön
      </Link>
    </div>
  );
}
