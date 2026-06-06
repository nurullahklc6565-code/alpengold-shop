import { formatPrice } from "@/lib/utils/pricing";
import type { ResolvedPrice } from "@/lib/utils/pricing";

type Props = {
  resolved: ResolvedPrice | null;
  fallbackBehavior: "BLOCK" | "USE_BASE_PRICE" | "USE_DEFAULT";
  size?: "sm" | "md" | "lg";
};

export function PriceDisplay({ resolved, fallbackBehavior, size = "md" }: Props) {
  if (!resolved) {
    if (fallbackBehavior === "BLOCK") {
      return (
        <span className="store-eyebrow text-[#a3a3a3]">Bu bölgede satışa kapalı</span>
      );
    }
    return null;
  }

  const hasDiscount = resolved.compareAtPrice && resolved.compareAtPrice > resolved.price;

  const sizeMap = {
    sm: "text-[14px]",
    md: "text-[16px]",
    lg: "text-[22px]",
  };

  return (
    <div className="flex items-baseline gap-2">
      <span className={`store-price ${sizeMap[size]}`}>
        {formatPrice(resolved.price, resolved.currency)}
      </span>

      {hasDiscount && (
        <>
          <span className="store-price-compare">
            {formatPrice(resolved.compareAtPrice!, resolved.currency)}
          </span>
          <span className="store-price-badge">İndirim</span>
        </>
      )}

      {!resolved.isExactMarketPrice && (
        <span className="text-[11px] text-[#a3a3a3]">~</span>
      )}
    </div>
  );
}
