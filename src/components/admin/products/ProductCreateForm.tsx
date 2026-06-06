"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createProductAction, type ProductActionState } from "@/server/actions/admin/product";
import { Plus, Trash2 } from "lucide-react";

type Category = { id: string; name: string; parentId: string | null };
type Market = { id: string; name: string; defaultCurrency: { id: string; code: string; symbol: string } };

type Props = { categories: Category[]; markets: Market[] };
const init: ProductActionState = {};

const TAX_CLASSES = [
  { value: "standard", label: "Standart" },
  { value: "reduced", label: "İndirimli" },
  { value: "zero", label: "Sıfır Oranlı" },
  { value: "exempt", label: "Muaf" },
];

export function ProductCreateForm({ categories, markets }: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createProductAction, init);

  // Görsel URL'leri
  const [imageUrls, setImageUrls] = useState<{ url: string; alt: string }[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Etiketler
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // İlk varyant
  const [hasVariant, setHasVariant] = useState(true);

  useEffect(() => {
    if (state.success && state.id) {
      router.push(`/admin/products/${state.id}`);
    }
  }, [state, router]);

  function addImage() {
    if (!newImageUrl.trim()) return;
    setImageUrls((prev) => [...prev, { url: newImageUrl.trim(), alt: "" }]);
    setNewImageUrl("");
  }

  function addTag(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const t = tagInput.trim().toLowerCase();
      if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
      setTagInput("");
    }
  }

  return (
    <form action={formAction} className="space-y-0">
      {state.error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Görsel URL'leri hidden inputs */}
      {imageUrls.map((img, i) => (
        <span key={i}>
          <input type="hidden" name={`image_url_${i}`} value={img.url} />
          <input type="hidden" name={`image_alt_${i}`} value={img.alt} />
        </span>
      ))}
      <input type="hidden" name="image_count" value={imageUrls.length} />

      {/* Etiket hidden inputs */}
      {tags.map((tag, i) => (
        <input key={i} type="hidden" name="tags" value={tag} />
      ))}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Ana içerik */}
        <div className="lg:col-span-2 space-y-5">
          {/* Temel Bilgiler */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Temel Bilgiler</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı *</label>
              <input name="name" required placeholder="Ürün adını girin"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input name="slug" placeholder="ürün-adi (boş bırakılırsa otomatik)"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
              <textarea name="description" rows={4} placeholder="Ürün açıklaması…"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marka / Vendor</label>
                <input name="vendor" placeholder="Örn: Nike, Apple"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Tipi</label>
                <input name="productType" placeholder="Örn: Giyim, Elektronik"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
            </div>
            {/* Etiketler */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Etiketler</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                    {tag}
                    <button type="button" onClick={() => setTags((p) => p.filter((t) => t !== tag))} className="text-gray-400 hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="Etiket yazın, Enter veya virgül ile ekleyin"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          {/* Görseller */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900">Görseller</h2>
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <button type="button" onClick={addImage}
                className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {imageUrls.map((img, i) => (
                  <div key={i} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="aspect-square rounded-lg object-cover border border-gray-200 w-full" />
                    <button type="button" onClick={() => setImageUrls((p) => p.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white">
                      <Trash2 className="h-3 w-3" />
                    </button>
                    {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-gray-900 px-1 py-0.5 text-[10px] text-white">Ana</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* İlk Varyant */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">İlk Varyant</h2>
              <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                <input type="checkbox" checked={hasVariant} onChange={(e) => setHasVariant(e.target.checked)} className="rounded border-gray-300" />
                Varyant ekle
              </label>
            </div>
            {hasVariant && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">SKU *</label>
                    <input name="variant_sku" required placeholder="URUN-001"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Barkod / GTIN</label>
                    <input name="variant_barcode" placeholder="1234567890123"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Temel Fiyat *</label>
                    <input name="variant_basePrice" type="number" step="0.01" min="0" required placeholder="0.00"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Karşılaştırma Fiyatı</label>
                    <input name="variant_compareAtPrice" type="number" step="0.01" min="0" placeholder="0.00"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Ağırlık (kg)</label>
                    <input name="variant_weight" type="number" step="0.001" min="0" placeholder="0.500"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Başlangıç Stok</label>
                    <input name="variant_stock" type="number" min="0" defaultValue="0"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Düşük Stok Uyarı Eşiği</label>
                    <input name="variant_lowStock" type="number" min="0" placeholder="5"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Seçenekler</label>
                  <input name="variant_options" placeholder="Renk:Mavi,Beden:M  (Anahtar:Değer formatı)"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono" />
                </div>
              </div>
            )}
          </div>

          {/* SEO */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900">SEO</h2>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">SEO Başlığı</label>
              <input name="seoTitle" placeholder="Sayfa başlığı (boş ise ürün adı kullanılır)"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">SEO Açıklaması</label>
              <textarea name="seoDescription" rows={2} placeholder="Arama motorları için açıklama (max 160 karakter)"
                maxLength={160}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
            </div>
          </div>
        </div>

        {/* Sağ panel */}
        <div className="space-y-5">
          {/* Yayın Durumu */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900">Yayın Durumu</h2>
            <select name="status" defaultValue="DRAFT"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
              <option value="DRAFT">Taslak</option>
              <option value="ACTIVE">Yayında</option>
              <option value="ARCHIVED">Arşiv</option>
            </select>
            <p className="text-xs text-gray-400">Taslak olarak kayıt edilirse storefrontta görünmez.</p>
          </div>

          {/* Organizasyon */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900">Organizasyon</h2>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kategori</label>
              <select name="categoryId" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
                <option value="">— Seçin —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.parentId ? `  └ ${c.name}` : c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vergi Sınıfı</label>
              <select name="taxClass" defaultValue="standard"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
                {TAX_CLASSES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button type="submit" disabled={isPending}
          className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60 transition-colors">
          {isPending ? "Oluşturuluyor…" : "Ürün Oluştur"}
        </button>
      </div>
    </form>
  );
}
