"use client";

import { useActionState, useState } from "react";
import { createProductAction, updateProductAction, type ProductActionState } from "@/server/actions/admin/product";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Category = { id: string; name: string; parentId: string | null };
type Product = {
  id: string; name: string; slug: string; description: string | null;
  categoryId: string | null; status: string; taxClass: string;
  vendor?: string | null; productType?: string | null; tags?: string[];
  seoTitle?: string | null; seoDescription?: string | null;
};
type Props = { product?: Product | null; categories: Category[] };
const init: ProductActionState = {};

const DURUM_SECENEKLERI = [
  { value: "DRAFT",    label: "Taslak — Storefrontta görünmez" },
  { value: "ACTIVE",   label: "Aktif — Yayında" },
  { value: "ARCHIVED", label: "Arşiv — Gizli" },
];

const VERGI_SINIFLARI = [
  { value: "standard", label: "Standart" },
  { value: "reduced",  label: "İndirimli" },
  { value: "zero",     label: "Sıfır Oranlı" },
  { value: "exempt",   label: "Muaf" },
];

export function ProductInfoForm({ product, categories }: Props) {
  const router = useRouter();
  const action = product ? updateProductAction.bind(null, product.id) : createProductAction;
  const [state, formAction, isPending] = useActionState(action, init);

  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(product?.tags ?? []);

  useEffect(() => {
    if (state.success && state.id && !product) {
      router.push(`/admin/products/${state.id}`);
    }
  }, [state, product, router]);

  function handleTagKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const t = tagInput.trim().toLowerCase();
      if (t && !tags.includes(t)) setTags((p) => [...p, t]);
      setTagInput("");
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}
      {state.success && product && (
        <p className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">Güncellendi.</p>
      )}

      {/* Tag hidden inputs */}
      {tags.map((tag, i) => <input key={i} type="hidden" name="tags" value={tag} />)}

      {/* Temel */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı *</label>
        <input name="name" required defaultValue={product?.name}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          placeholder="Ürün adını girin" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
        <input name="slug" defaultValue={product?.slug}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono"
          placeholder="ürün-slug (boş = otomatik)" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
        <textarea name="description" rows={4} defaultValue={product?.description ?? ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
          placeholder="Ürün açıklaması…" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marka / Vendor</label>
          <input name="vendor" defaultValue={product?.vendor ?? ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="Örn: Nike, Apple, Samsung" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Tipi</label>
          <input name="productType" defaultValue={product?.productType ?? ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="Örn: Giyim, Elektronik, Aksesuar" />
        </div>
      </div>

      {/* Etiketler */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Etiketler</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
              {tag}
              <button type="button" onClick={() => setTags((p) => p.filter((t) => t !== tag))}
                className="text-gray-400 hover:text-red-500 ml-0.5">×</button>
            </span>
          ))}
        </div>
        <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKey}
          placeholder="Etiket yazın, Enter veya virgül ile ekleyin"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
      </div>

      {/* Organizasyon */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
          <select name="categoryId" defaultValue={product?.categoryId ?? ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
            <option value="">— Seçin —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.parentId ? `  └ ${c.name}` : c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
          <select name="status" defaultValue={product?.status ?? "DRAFT"}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
            {DURUM_SECENEKLERI.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Sınıfı</label>
          <select name="taxClass" defaultValue={product?.taxClass ?? "standard"}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
            {VERGI_SINIFLARI.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      {/* SEO - inlined to avoid separate tab for basic info */}
      <div className="border-t border-gray-100 pt-4 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">SEO</p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SEO Başlığı</label>
          <input name="seoTitle" defaultValue={product?.seoTitle ?? ""}
            placeholder={product?.name ?? "Boş ise ürün adı kullanılır"}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SEO Açıklaması</label>
          <textarea name="seoDescription" rows={2} defaultValue={product?.seoDescription ?? ""}
            maxLength={160} placeholder="Arama sonuçlarında görünecek açıklama (max 160 karakter)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
      </div>

      <button type="submit" disabled={isPending}
        className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60 transition-colors">
        {isPending ? "Kaydediliyor…" : product ? "Güncelle" : "Ürün Oluştur"}
      </button>
    </form>
  );
}
