"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronRight, Search, User, Heart } from "lucide-react";

type Category = { name: string; slug: string };

export function MobileMenu({ categories, storeName }: { categories: Category[]; storeName: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center text-[#525252] transition-colors hover:text-[#0a0a0a] lg:hidden"
        aria-label="Menüyü aç"
      >
        <Menu className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {/* Arka plan örtüsü */}
      <div
        className={`fixed inset-0 z-[120] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`fixed left-0 top-0 z-[130] flex h-full w-full max-w-[360px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menü"
      >
        <div className="flex items-center justify-between border-b border-[#e5e5e5] px-6 py-5">
          <span className="font-serif text-[17px] font-semibold tracking-[0.16em] text-[#0a0a0a]">
            {storeName}
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-1 text-[#525252] transition-colors hover:text-[#0a0a0a]"
            aria-label="Menüyü kapat"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="divide-y divide-[#f0f0f0]">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/categories/${cat.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-6 py-4 text-[14px] font-medium uppercase tracking-[0.08em] text-[#0a0a0a] transition-colors hover:bg-[#f9f9f9]"
                >
                  {cat.name}
                  <ChevronRight className="h-4 w-4 text-[#a3a3a3]" strokeWidth={1.5} />
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/collections"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-6 py-4 text-[14px] font-medium uppercase tracking-[0.08em] text-[#0a0a0a] transition-colors hover:bg-[#f9f9f9]"
              >
                Koleksiyonlar
                <ChevronRight className="h-4 w-4 text-[#a3a3a3]" strokeWidth={1.5} />
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-6 py-4 text-[14px] font-medium uppercase tracking-[0.08em] text-[#0a0a0a] transition-colors hover:bg-[#f9f9f9]"
              >
                Tüm Ürünler
                <ChevronRight className="h-4 w-4 text-[#a3a3a3]" strokeWidth={1.5} />
              </Link>
            </li>
          </ul>
        </nav>

        <div className="border-t border-[#e5e5e5] px-6 py-5">
          <ul className="grid grid-cols-3 gap-2 text-center">
            {[
              { href: "/search", icon: Search, label: "Ara" },
              { href: "/account", icon: User, label: "Hesabım" },
              { href: "/account/favorites", icon: Heart, label: "Favoriler" },
            ].map(({ href, icon: Icon, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center gap-2 py-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#525252] transition-colors hover:text-[#0a0a0a]"
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}
