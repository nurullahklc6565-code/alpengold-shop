"use client";

import { useState, useTransition } from "react";
import { upsertVariantPriceAction, deleteVariantPriceAction } from "@/server/actions/admin/product";
import { X } from "lucide-react";

type Market = { id: string; name: string; defaultCurrency: { id: string; code: string; symbol: string; decimalDigits: number } };
type PriceRecord = { marketId: string; currencyId: string; price: string | number; compareAtPrice: string | number | null };
type Variant = {
  id: string;
  sku: string;
  options: Record<string, string>;
  basePrice: string | number;
  prices: PriceRecord[];
};

type Props = { productId: string; variants: Variant[]; markets: Market[] };

export function PricingGrid({ productId, variants, markets }: Props) {
  if (variants.length === 0) {
    return <p className="text-sm text-gray-500">Önce en az bir varyant ekleyin.</p>;
  }
  if (markets.length === 0) {
    return <p className="text-sm text-amber-600">Aktif pazar bulunamadı. Önce bir pazar oluşturun.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="pb-3 pr-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Varyant</th>
            {markets.map((m) => (
              <th key={m.id} className="pb-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                {m.name}
                <span className="ml-1 text-gray-400 normal-case font-normal">({m.defaultCurrency.code})</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {variants.map((variant) => (
            <tr key={variant.id} className="align-top">
              <td className="py-3 pr-4 whitespace-nowrap">
                <div className="font-mono text-xs text-gray-700">{variant.sku}</div>
                <div className="text-xs text-gray-400">
                  Temel: {Number(variant.basePrice).toFixed(2)}
                </div>
              </td>
              {markets.map((market) => {
                const existing = variant.prices.find((p) => p.marketId === market.id);
                return (
                  <td key={market.id} className="py-3 px-4">
                    <PriceCell
                      productId={productId}
                      variantId={variant.id}
                      market={market}
                      existing={existing}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PriceCell({
  productId,
  variantId,
  market,
  existing,
}: {
  productId: string;
  variantId: string;
  market: Market;
  existing?: PriceRecord;
}) {
  const [isPending, startTransition] = useTransition();
  const [price, setPrice] = useState(existing ? Number(existing.price).toFixed(market.defaultCurrency.decimalDigits) : "");
  const [compare, setCompare] = useState(existing?.compareAtPrice ? Number(existing.compareAtPrice).toFixed(market.defaultCurrency.decimalDigits) : "");
  const [saved, setSaved] = useState(!!existing);
  const [error, setError] = useState<string>();

  function handleSave() {
    if (!price) return;
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) return;
    setError(undefined);
    startTransition(async () => {
      const result = await upsertVariantPriceAction(productId, {
        variantId,
        marketId: market.id,
        currencyId: market.defaultCurrency.id,
        price: priceNum,
        compareAtPrice: compare ? parseFloat(compare) : null,
      });
      if (result.error) setError(result.error);
      else setSaved(true);
    });
  }

  function handleRemove() {
    setError(undefined);
    startTransition(async () => {
      await deleteVariantPriceAction(productId, variantId, market.id);
      setPrice("");
      setCompare("");
      setSaved(false);
    });
  }

  return (
    <div className="space-y-1.5 min-w-[140px]">
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-400 w-4 shrink-0">{market.defaultCurrency.symbol}</span>
        <input
          type="number"
          step={`0.${"0".repeat(market.defaultCurrency.decimalDigits - 1)}1`}
          min="0"
          value={price}
          onChange={(e) => { setPrice(e.target.value); setSaved(false); }}
          onBlur={handleSave}
          placeholder="Fiyat"
          disabled={isPending}
          className={`w-full rounded border px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:opacity-50 ${
            saved ? "border-green-300 bg-green-50" : "border-gray-300"
          }`}
        />
        {saved && (
          <button type="button" onClick={handleRemove} disabled={isPending} className="shrink-0 text-gray-300 hover:text-red-500 transition-colors">
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      {price && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-300 w-4 shrink-0">{market.defaultCurrency.symbol}</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={compare}
            onChange={(e) => { setCompare(e.target.value); setSaved(false); }}
            onBlur={handleSave}
            placeholder="Karşılaştırma"
            disabled={isPending}
            className="w-full rounded border border-gray-200 px-2 py-1 text-xs text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:opacity-50"
          />
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
