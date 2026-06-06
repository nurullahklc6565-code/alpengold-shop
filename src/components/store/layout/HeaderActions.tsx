"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/store/cart/CartProvider";
import { useFavorites } from "@/components/store/favorites/FavoritesProvider";

function CountBadge({ count }: { count: number }) {
  if (count <= 0) {
    return (
      <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border border-[#e5e5e5] bg-white px-1 text-[9px] font-semibold leading-none text-[#a3a3a3]">
        0
      </span>
    );
  }
  return (
    <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#0a0a0a] px-1 text-[9px] font-semibold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function HeaderActions() {
  const { cart, openDrawer } = useCart();
  const { count: favoriteCount } = useFavorites();

  return (
    <>
      <Link
        href="/account/favorites"
        className="relative flex h-9 w-9 items-center justify-center text-[#525252] transition-colors hover:text-[#0a0a0a]"
        aria-label="Favorilerim"
      >
        <Heart className="h-[18px] w-[18px]" strokeWidth={1.75} />
        <CountBadge count={favoriteCount} />
      </Link>

      <button
        type="button"
        onClick={openDrawer}
        className="relative flex h-9 w-9 items-center justify-center text-[#525252] transition-colors hover:text-[#0a0a0a]"
        aria-label="Sepetim"
      >
        <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.75} />
        <CountBadge count={cart.itemCount} />
      </button>
    </>
  );
}
