import { getActiveMarket } from "@/server/services/storefront/market-detect.service";
import { StoreHeader } from "@/components/store/layout/StoreHeader";
import { StoreFooter } from "@/components/store/layout/StoreFooter";
import { CartProvider } from "@/components/store/cart/CartProvider";
import { MiniCartDrawer } from "@/components/store/cart/MiniCartDrawer";
import { FavoritesProvider } from "@/components/store/favorites/FavoritesProvider";
import { QuickViewProvider } from "@/components/store/product/QuickViewProvider";
import { QuickViewModal } from "@/components/store/product/QuickViewModal";
import { getCartSummaryAction } from "@/server/actions/store/cart";
import { getFavoriteProductIdsAction } from "@/server/actions/store/favorites";
import { Toaster } from "sonner";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [market, initialCart, initialFavoriteIds] = await Promise.all([
    getActiveMarket(),
    getCartSummaryAction(),
    getFavoriteProductIdsAction(),
  ]);
  const marketId = market?.id ?? "";

  return (
    <div className="store-body min-h-screen bg-white">
      <CartProvider initialCart={initialCart}>
        <FavoritesProvider initialIds={initialFavoriteIds}>
          <QuickViewProvider>
            <StoreHeader currentMarketId={marketId} />
            <main>{children}</main>
            <StoreFooter />
            <MiniCartDrawer />
            <QuickViewModal />
            <Toaster position="bottom-right" richColors />
          </QuickViewProvider>
        </FavoritesProvider>
      </CartProvider>
    </div>
  );
}
