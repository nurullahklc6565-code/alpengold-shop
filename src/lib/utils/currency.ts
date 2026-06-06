/**
 * Para birimi formatlama — hiçbir para birimi hardcode edilmez.
 * code, symbol ve decimalDigits her zaman DB'den gelir.
 */
export function formatCurrency(
  amount: number | string,
  symbol: string,
  decimalDigits: number,
  symbolPosition: "before" | "after" = "before"
): string {
  const n = Number(amount).toFixed(decimalDigits);
  return symbolPosition === "before" ? `${symbol}${n}` : `${n} ${symbol}`;
}

export function parseDecimal(value: unknown): number {
  if (typeof value === "object" && value !== null && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}
