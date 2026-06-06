"use client";

import { useActionState } from "react";
import { createCategoryAction, updateCategoryAction, type CategoryActionState } from "@/server/actions/admin/category";

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageUrl: string | null;
  description?: string | null;
  featured?: boolean;
  active: boolean;
  position?: number;
};
type FlatCategory = { id: string; name: string; parentId: string | null };

type Props = {
  category?: Category | null;
  categories: FlatCategory[];
};

const init: CategoryActionState = {};

export function CategoryForm({ category, categories }: Props) {
  const action = category
    ? updateCategoryAction.bind(null, category.id)
    : createCategoryAction;

  const [state, formAction, isPending] = useActionState(action, init);

  const eligible = categories.filter((c) => c.id !== category?.id);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {category ? "Güncellendi." : "Oluşturuldu."}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
        <input
          name="name"
          required
          defaultValue={category?.name}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          placeholder="Örn: Elektronik, Giyim"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
        <input
          name="slug"
          defaultValue={category?.slug}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          placeholder="Boş bırakılırsa otomatik oluşturulur"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={category?.description ?? ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
          placeholder="Kısa kategori açıklaması (storefront'ta gösterilir)"
          maxLength={500}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Üst Kategori</label>
        <select
          name="parentId"
          defaultValue={category?.parentId ?? ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">— Yok (Kök Kategori) —</option>
          {eligible.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Görsel Yolu / URL</label>
        <input
          name="imageUrl"
          defaultValue={category?.imageUrl ?? ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          placeholder="/uploads/2026/06/kategori.jpg veya https://…"
        />
        <p className="mt-1 text-xs text-gray-400">Medya kütüphanesinden yüklenen görseller için /uploads/… yolu kullanın.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Sıralama (Küçük = Önce)</label>
        <input
          name="position"
          type="number"
          min={0}
          defaultValue={category?.position ?? 0}
          className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2.5 text-sm font-medium text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            name="featured"
            value="true"
            defaultChecked={category?.featured ?? false}
            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
          />
          <span>Öne Çıkarılan Kategori</span>
          <span className="text-xs font-normal text-gray-400">(Ana sayfada büyük görünür)</span>
        </label>

        <label className="flex items-center gap-2.5 text-sm font-medium text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            name="active"
            value="true"
            defaultChecked={category?.active ?? true}
            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
          />
          <span>Aktif</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition-colors"
      >
        {isPending ? "Kaydediliyor…" : category ? "Güncelle" : "Oluştur"}
      </button>
    </form>
  );
}
