"use client";

import { useState, useTransition } from "react";
import { X, Plus } from "lucide-react";
import Link from "next/link";
import { assignProductToCollectionAction, removeProductFromCollectionAction } from "@/server/actions/admin/collection";
import { ProductStatusBadge } from "@/components/admin/ui/ProductStatusBadge";

type Product = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

type AssignedProduct = { productId: string; product: Product };
type AvailableProduct = Product;

type Props = {
  collectionId: string;
  assignedProducts: AssignedProduct[];
  availableProducts: AvailableProduct[];
};

export function CollectionProductManager({ collectionId, assignedProducts, availableProducts }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");

  const assignedIds = new Set(assignedProducts.map((ap) => ap.productId));
  const filtered = availableProducts.filter(
    (p) =>
      !assignedIds.has(p.id) &&
      (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  function handleAdd() {
    if (!selectedId) return;
    setError(undefined);
    startTransition(async () => {
      const result = await assignProductToCollectionAction(collectionId, selectedId);
      if (result.error) setError(result.error);
      else setSelectedId("");
    });
  }

  function handleRemove(productId: string) {
    startTransition(() => removeProductFromCollectionAction(collectionId, productId));
  }

  return (
    <div className="space-y-4">
      {/* Arama + seçim */}
      <div className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ürün ara…"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          disabled={filtered.length === 0 || isPending}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
        >
          <option value="">{filtered.length === 0 ? "Eklenecek ürün yok" : "Ürün seçin…"}</option>
          {filtered.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!selectedId || isPending}
          className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          <Plus className="h-4 w-4" /> Ekle
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* Atanmış ürünler */}
      {assignedProducts.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
          Bu koleksiyona henüz ürün eklenmedi.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-2.5 text-left">Ürün</th>
                <th className="px-4 py-2.5 text-left">Durum</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assignedProducts.map(({ productId, product }) => (
                <tr key={productId} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5">
                    <Link href={`/admin/products/${productId}`} className="font-medium text-gray-900 hover:underline">
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <ProductStatusBadge status={product.status as "DRAFT" | "ACTIVE" | "ARCHIVED"} />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemove(productId)}
                      disabled={isPending}
                      className="inline-flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
