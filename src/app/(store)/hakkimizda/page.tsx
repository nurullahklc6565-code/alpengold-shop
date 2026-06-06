import type { Metadata } from "next";
import { getSettings } from "@/lib/utils/settings";

export const metadata: Metadata = { title: "Hakkımızda" };

export default async function HakkimizdaPage() {
  const s = await getSettings(["store_name", "about_full", "about_short"]);

  const storeName = s.store_name || "Mağaza";
  const content = s.about_full || s.about_short || "";

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-bold text-gray-900">Hakkımızda</h1>
      <p className="mt-2 text-sm text-gray-400">{storeName}</p>

      <div className="mt-8">
        {content ? (
          <div className="prose prose-gray max-w-none text-sm leading-relaxed text-gray-600 whitespace-pre-line">
            {content}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
            <p className="text-sm text-gray-400">
              Hakkımızda içeriği henüz eklenmedi.
            </p>
            <p className="mt-1 text-xs text-gray-300">
              Admin → Site Ayarları → <strong>about_full</strong> ayarından ekleyebilirsiniz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
