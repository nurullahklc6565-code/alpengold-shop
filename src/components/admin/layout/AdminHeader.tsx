"use client";

import { useTransition } from "react";
import { Bell, LogOut, Search, Settings } from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/server/actions/admin/auth";
import { cn } from "@/lib/utils/cn";
import type { StaffSession } from "@/lib/auth-helpers";

export function AdminHeader({ user }: { user: StaffSession }) {
  const [isPending, startTransition] = useTransition();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-100 bg-white px-5">
      {/* Sol: Hızlı arama */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/orders"
          className="hidden sm:flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-300 hover:bg-white transition-all w-56"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs">Siparişlerde ara…</span>
          <kbd className="ml-auto hidden lg:flex items-center gap-0.5 text-[10px] text-zinc-300 font-mono">
            <span>⌘</span><span>K</span>
          </kbd>
        </Link>
      </div>

      {/* Sağ: Aksiyonlar */}
      <div className="flex items-center gap-1">
        {/* Bildirimler */}
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
          title="Bildirimler"
        >
          <Bell className="h-4 w-4" />
        </button>

        {/* Ayarlar */}
        <Link
          href="/admin/settings"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
          title="Site Ayarları"
        >
          <Settings className="h-4 w-4" />
        </Link>

        {/* Separator */}
        <div className="mx-1 h-5 w-px bg-zinc-200" />

        {/* Kullanıcı + çıkış */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-semibold text-zinc-700 leading-none">{user.name}</span>
            <span className="text-[10px] text-zinc-400 leading-none mt-0.5">{user.role}</span>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                "text-zinc-400 hover:bg-red-50 hover:text-red-500",
                isPending && "opacity-50 cursor-not-allowed"
              )}
              title="Çıkış Yap"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
