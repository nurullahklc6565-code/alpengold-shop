"use client";

import { useActionState, useState, useTransition } from "react";
import {
  createVariantAction,
  createVariantBatchAction,
  deleteVariantAction,
  type ProductActionState,
} from "@/server/actions/admin/product";
import { Trash2, Plus, ChevronDown, ChevronUp, Zap, X } from "lucide-react";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { cn } from "@/lib/utils/cn";

type Variant = {
  id: string;
  sku: string;
  options: Record<string, string>;
  basePrice: string | number;
  weight: string | number | null;
  active: boolean;
  inventory: { quantity: number; reserved: number; trackQuantity: boolean } | null;
};

type Props = { productId: string; variants: Variant[] };
const init: ProductActionState = {};

// ─── Seçenek Matrisi ────────────────────────────────────────────────────────

type OptionGroup = { name: string; values: string };
type ComboVariant = { sku: string; options: Record<string, string>; basePrice: string; stock: string; barcode: string };

function generateCombinations(groups: OptionGroup[]): Record<string, string>[] {
  const parsed = groups
    .filter((g) => g.name.trim() && g.values.trim())
    .map((g) => ({
      name: g.name.trim(),
      values: g.values.split(",").map((v) => v.trim()).filter(Boolean),
    }));

  if (parsed.length === 0) return [];

  const combos: Record<string, string>[] = [{}];
  for (const group of parsed) {
    const newCombos: Record<string, string>[] = [];
    for (const combo of combos) {
      for (const value of group.values) {
        newCombos.push({ ...combo, [group.name]: value });
      }
    }
    combos.length = 0;
    combos.push(...newCombos);
  }
  return combos;
}

function buildSku(skuPrefix: string, options: Record<string, string>): string {
  const suffix = Object.values(options)
    .map((v) => v.toUpperCase().replace(/\s+/g, "-").substring(0, 6))
    .join("-");
  return `${skuPrefix.trim().toUpperCase() || "URUN"}-${suffix}`;
}

function VariantMatrix({ productId, onClose }: { productId: string; onClose: () => void }) {
  const [groups, setGroups] = useState<OptionGroup[]>([
    { name: "", values: "" },
  ]);
  const [skuPrefix, setSkuPrefix] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [stock, setStock] = useState("0");
  const [combos, setCombos] = useState<ComboVariant[]>([]);
  const [step, setStep] = useState<"define" | "preview">("define");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error?: string; success?: boolean }>();

  function preview() {
    const opts = generateCombinations(groups);
    if (opts.length === 0) return;
    setCombos(
      opts.map((o) => ({
        sku: buildSku(skuPrefix, o),
        options: o,
        basePrice,
        stock,
        barcode: "",
      }))
    );
    setStep("preview");
  }

  function saveAll() {
    const variants = combos
      .filter((c) => c.sku.trim())
      .map((c) => ({
        sku: c.sku.trim(),
        options: c.options,
        basePrice: parseFloat(c.basePrice) || 0,
        stock: parseInt(c.stock) || 0,
        barcode: c.barcode || null,
      }));

    startTransition(async () => {
      const r = await createVariantBatchAction(productId, variants);
      setResult(r);
      if (r.success) setTimeout(() => onClose(), 1000);
    });
  }

  if (step === "preview") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">{combos.length} varyant oluşturulacak</p>
          <button type="button" onClick={() => setStep("define")} className="text-xs text-gray-500 hover:text-gray-700">← Geri</button>
        </div>

        {result?.error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{result.error}</p>}
        {result?.success && <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2">Tüm varyantlar oluşturuldu!</p>}

        <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-gray-500">SKU</th>
                <th className="px-3 py-2 text-left text-gray-500">Seçenekler</th>
                <th className="px-3 py-2 text-left text-gray-500">Fiyat</th>
                <th className="px-3 py-2 text-left text-gray-500">Stok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {combos.map((c, i) => (
                <tr key={i}>
                  <td className="px-3 py-2">
                    <input value={c.sku} onChange={(e) => setCombos((p) => p.map((x, j) => j === i ? { ...x, sku: e.target.value } : x))}
                      className="w-full rounded border border-gray-200 px-2 py-1 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-gray-900" />
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {Object.entries(c.options).map(([k, v]) => `${k}: ${v}`).join(", ")}
                  </td>
                  <td className="px-3 py-2">
                    <input value={c.basePrice} type="number" step="0.01" min="0"
                      onChange={(e) => setCombos((p) => p.map((x, j) => j === i ? { ...x, basePrice: e.target.value } : x))}
                      className="w-20 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900" />
                  </td>
                  <td className="px-3 py-2">
                    <input value={c.stock} type="number" min="0"
                      onChange={(e) => setCombos((p) => p.map((x, j) => j === i ? { ...x, stock: e.target.value } : x))}
                      className="w-16 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button type="button" onClick={saveAll} disabled={isPending}
          className="w-full rounded-lg bg-gray-900 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60 transition-colors">
          {isPending ? "Oluşturuluyor…" : `${combos.length} Varyantı Kaydet`}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">SKU Öneki *</label>
          <input value={skuPrefix} onChange={(e) => setSkuPrefix(e.target.value)}
            placeholder="TSHIRT veya PHONE"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Varsayılan Fiyat</label>
          <input value={basePrice} onChange={(e) => setBasePrice(e.target.value)} type="number" step="0.01" min="0"
            placeholder="0.00"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Varsayılan Başlangıç Stok</label>
        <input value={stock} onChange={(e) => setStock(e.target.value)} type="number" min="0"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-600">Seçenek Grupları</label>
          <button type="button" onClick={() => setGroups((p) => [...p, { name: "", values: "" }])}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <Plus className="h-3 w-3" /> Grup Ekle
          </button>
        </div>
        {groups.map((g, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input value={g.name} onChange={(e) => setGroups((p) => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
              placeholder="Seçenek adı (ör: Renk)"
              className="w-1/3 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            <input value={g.values} onChange={(e) => setGroups((p) => p.map((x, j) => j === i ? { ...x, values: e.target.value } : x))}
              placeholder="Değerler (ör: Kırmızı, Mavi, Yeşil)"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            {groups.length > 1 && (
              <button type="button" onClick={() => setGroups((p) => p.filter((_, j) => j !== i))}
                className="text-gray-400 hover:text-red-500">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400">
        Oluşturulacak varyant sayısı: <strong>
          {generateCombinations(groups).length > 0 ? generateCombinations(groups).length : "—"}
        </strong>
      </p>

      <button type="button" onClick={preview}
        disabled={generateCombinations(groups).length === 0 || !skuPrefix.trim() || !basePrice}
        className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
        Önizle ve Düzenle →
      </button>
    </div>
  );
}

// ─── Tek Varyant Formu ────────────────────────────────────────────────────

function SingleVariantForm({ productId }: { productId: string }) {
  const boundCreate = createVariantAction.bind(null, productId);
  const [state, formAction, isPending] = useActionState(boundCreate, init);
  return (
    <form action={formAction} className="space-y-3">
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state.success && <p className="text-xs text-green-600">Varyant eklendi.</p>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">SKU *</label>
          <input name="sku" required placeholder="URUN-KIRMIZI-M"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Barkod / GTIN</label>
          <input name="barcode" placeholder="8680000000000"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Temel Fiyat *</label>
          <input name="basePrice" type="number" step="0.01" min="0" required placeholder="0.00"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Karşılaştırma Fiyatı</label>
          <input name="compareAtPrice" type="number" step="0.01" min="0" placeholder="0.00"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Ağırlık (kg)</label>
          <input name="weight" type="number" step="0.001" min="0" placeholder="0.500"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Seçenekler <span className="text-gray-400 font-normal">(Anahtar:Değer, virgülle ayır)</span>
        </label>
        <input name="options" placeholder="Renk:Kırmızı,Beden:M"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900" />
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" name="active" value="true" defaultChecked className="rounded border-gray-300" />
          Aktif
        </label>
        <button type="submit" disabled={isPending}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition-colors">
          {isPending ? "Ekleniyor…" : "Varyant Ekle"}
        </button>
      </div>
    </form>
  );
}

// ─── Ana Bileşen ─────────────────────────────────────────────────────────

export function VariantManager({ productId, variants }: Props) {
  const [mode, setMode] = useState<"none" | "single" | "matrix">("none");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      {/* Mevcut varyantlar */}
      {variants.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2.5 text-left">SKU</th>
                <th className="px-3 py-2.5 text-left">Seçenekler</th>
                <th className="px-3 py-2.5 text-left">Fiyat</th>
                <th className="px-3 py-2.5 text-left">Stok</th>
                <th className="px-3 py-2.5 text-left">Durum</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {variants.map((v) => {
                const opts = v.options as Record<string, string>;
                const available = v.inventory
                  ? v.inventory.quantity - v.inventory.reserved
                  : null;
                return (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-700">{v.sku}</td>
                    <td className="px-3 py-2.5">
                      {Object.entries(opts).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(opts).map(([k, val]) => (
                            <span key={k} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                              {k}: {val}
                            </span>
                          ))}
                        </div>
                      ) : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-sm">{Number(v.basePrice).toFixed(2)}</td>
                    <td className="px-3 py-2.5">
                      {v.inventory?.trackQuantity ? (
                        <span className={cn("text-xs font-semibold", (available ?? 0) > 0 ? "text-green-700" : "text-red-600")}>
                          {available} mevcut
                        </span>
                      ) : <span className="text-xs text-gray-400">Takip yok</span>}
                    </td>
                    <td className="px-3 py-2.5"><StatusBadge active={v.active} /></td>
                    <td className="px-3 py-2.5 text-right">
                      <button type="button" disabled={isPending}
                        onClick={() => startTransition(() => deleteVariantAction(productId, v.id))}
                        className="inline-flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Ekleme seçenekleri */}
      {mode === "none" ? (
        <div className="flex gap-2">
          <button type="button" onClick={() => setMode("single")}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Plus className="h-4 w-4" /> Tek Varyant Ekle
          </button>
          <button type="button" onClick={() => setMode("matrix")}
            className="flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm text-blue-700 hover:bg-blue-100 transition-colors">
            <Zap className="h-4 w-4" /> Seçenek Matrisi ile Oluştur
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-200">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="text-sm font-medium text-gray-700">
              {mode === "single" ? "Tek Varyant" : "Seçenek Matrisi"}
            </span>
            <button type="button" onClick={() => setMode("none")} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4">
            {mode === "single" && <SingleVariantForm productId={productId} />}
            {mode === "matrix" && <VariantMatrix productId={productId} onClose={() => setMode("none")} />}
          </div>
        </div>
      )}
    </div>
  );
}
