"use client";

import { switchMarketAction } from "@/server/actions/store/market";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { useState } from "react";

type Market = {
  id: string;
  name: string;
  defaultCurrency: { code: string; symbol: string };
};

type Props = {
  markets: Market[];
  currentMarketId: string;
};

export function MarketSwitcher({ markets, currentMarketId }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = markets.find((m) => m.id === currentMarketId);

  if (markets.length <= 1) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{current?.defaultCurrency.code ?? "—"}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-xl border border-gray-200 bg-white shadow-lg">
            <div className="border-b border-gray-100 px-3 py-2 text-xs font-medium text-gray-500 uppercase">
              Pazar Seç
            </div>
            {markets.map((m) => (
              <form key={m.id} action={switchMarketAction}>
                <input type="hidden" name="marketId" value={m.id} />
                <input type="hidden" name="returnTo" value={pathname} />
                <button
                  type="submit"
                  onClick={() => setOpen(false)}
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${m.id === currentMarketId ? "text-gray-900 font-medium" : "text-gray-600"}`}
                >
                  <span>{m.name}</span>
                  <span className="text-xs text-gray-400">
                    {m.defaultCurrency.code} {m.defaultCurrency.symbol}
                  </span>
                </button>
              </form>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
