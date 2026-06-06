"use client";

import { useActionState } from "react";
import { createCollectionAction, updateCollectionAction, type CollectionActionState } from "@/server/actions/admin/collection";

type Collection = { id: string; name: string; slug: string; description: string | null; imageUrl: string | null; active: boolean };
type Props = { collection?: Collection | null };
const init: CollectionActionState = {};

export function CollectionForm({ collection }: Props) {
  const action = collection ? updateCollectionAction.bind(null, collection.id) : createCollectionAction;
  const [state, formAction, isPending] = useActionState(action, init);
  return (
    <form action={formAction} className="space-y-4">
      {state.error && <p className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{state.error}</p>}
      {state.success && <p className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{collection ? "Güncellendi." : "Oluşturuldu."}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
        <input name="name" required defaultValue={collection?.name} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Örn: Yaz Koleksiyonu, Öne Çıkanlar" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
        <input name="slug" defaultValue={collection?.slug} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Boş bırakılırsa otomatik" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
        <textarea name="description" rows={3} defaultValue={collection?.description ?? ""} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Görsel URL</label>
        <input name="imageUrl" type="url" defaultValue={collection?.imageUrl ?? ""} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="https://…" />
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <input type="checkbox" name="active" value="true" defaultChecked={collection?.active ?? true} className="rounded border-gray-300" /> Aktif
      </label>
      <button type="submit" disabled={isPending} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition-colors">
        {isPending ? "Kaydediliyor…" : collection ? "Güncelle" : "Oluştur"}
      </button>
    </form>
  );
}
