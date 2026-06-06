"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { TableSkeleton } from "./skeleton";
import { EmptyState } from "./empty-state";
import { Button } from "./button";
import type { ReactNode } from "react";

/* ─── Tipler ─────────────────────────────────────────────────────────────── */

export type Column<T> = {
  id: string;
  header: string | ReactNode;
  cell: (row: T, index: number) => ReactNode;
  width?: string | number;
  align?: "left" | "center" | "right";
  className?: string;
};

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  // Seçim
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  // Boş durum
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  // Sayfalama
  pagination?: {
    page: number;
    perPage: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  // Toplu işlem
  bulkActions?: (selected: T[], clearSelection: () => void) => ReactNode;
  className?: string;
}

/* ─── DataTable ──────────────────────────────────────────────────────────── */

export function DataTable<T>({
  data,
  columns,
  loading = false,
  rowKey,
  onRowClick,
  selectable = false,
  onSelectionChange,
  emptyTitle = "Kayıt bulunamadı",
  emptyDescription,
  emptyAction,
  pagination,
  bulkActions,
  className,
}: DataTableProps<T>) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSelected = data.length > 0 && data.every((row) => selected.has(rowKey(row)));
  const someSelected = data.some((row) => selected.has(rowKey(row)));

  function toggleAll() {
    const newSelected = new Set(selected);
    if (allSelected) {
      data.forEach((row) => newSelected.delete(rowKey(row)));
    } else {
      data.forEach((row) => newSelected.add(rowKey(row)));
    }
    setSelected(newSelected);
    onSelectionChange?.(data.filter((row) => newSelected.has(rowKey(row))));
  }

  function toggleRow(row: T) {
    const key = rowKey(row);
    const newSelected = new Set(selected);
    if (newSelected.has(key)) newSelected.delete(key);
    else newSelected.add(key);
    setSelected(newSelected);
    onSelectionChange?.(data.filter((r) => newSelected.has(rowKey(r))));
  }

  function clearSelection() {
    setSelected(new Set());
    onSelectionChange?.([]);
  }

  const selectedItems = data.filter((row) => selected.has(rowKey(row)));
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.perPage) : 0;

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Toplu işlem bar */}
      {selectable && someSelected && bulkActions && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-indigo-50 border border-indigo-200 rounded-t-xl mb-0 border-b-0">
          <span className="text-sm font-medium text-indigo-700">
            {selectedItems.length} kayıt seçildi
          </span>
          <div className="flex items-center gap-2">
            {bulkActions(selectedItems, clearSelection)}
          </div>
          <button
            type="button"
            onClick={clearSelection}
            className="ml-auto text-xs text-indigo-600 hover:text-indigo-800 underline"
          >
            Seçimi temizle
          </button>
        </div>
      )}

      {/* Tablo */}
      <div className={cn(
        "overflow-hidden bg-white border border-zinc-200 shadow-sm",
        selectable && someSelected && bulkActions ? "rounded-b-xl" : "rounded-xl"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80">
                {selectable && (
                  <th className="w-10 pl-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                      onChange={toggleAll}
                      className="rounded border-zinc-300 accent-zinc-950 cursor-pointer"
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.id}
                    className={cn(
                      "px-4 py-3 text-left",
                      "text-xs font-semibold text-zinc-500 uppercase tracking-wide",
                      "whitespace-nowrap",
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right",
                      col.className
                    )}
                    style={col.width ? { width: col.width } : undefined}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <TableSkeleton rows={8} cols={columns.length + (selectable ? 1 : 0)} />
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0)}>
                    <EmptyState
                      title={emptyTitle}
                      description={emptyDescription}
                      action={emptyAction}
                      size="sm"
                    />
                  </td>
                </tr>
              ) : (
                data.map((row, index) => {
                  const key = rowKey(row);
                  const isSelected = selected.has(key);
                  return (
                    <tr
                      key={key}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      className={cn(
                        "group transition-colors",
                        onRowClick && "cursor-pointer",
                        isSelected ? "bg-indigo-50/60" : onRowClick ? "hover:bg-zinc-50" : ""
                      )}
                    >
                      {selectable && (
                        <td
                          className="w-10 pl-4 py-3.5"
                          onClick={(e) => { e.stopPropagation(); toggleRow(row); }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(row)}
                            className="rounded border-zinc-300 accent-zinc-950 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td
                          key={col.id}
                          className={cn(
                            "px-4 py-3.5 text-sm text-zinc-700",
                            col.align === "center" && "text-center",
                            col.align === "right" && "text-right",
                            col.className
                          )}
                        >
                          {col.cell(row, index)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sayfalama */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-sm text-zinc-500">
            Toplam <span className="font-medium text-zinc-700">{pagination.total}</span> kayıt
            · Sayfa <span className="font-medium text-zinc-700">{pagination.page}</span> / {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              size="sm"
              icon={<ChevronLeft className="h-4 w-4" />}
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            />
            {/* Sayfa numaraları */}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let p: number;
              if (totalPages <= 5) p = i + 1;
              else if (pagination.page <= 3) p = i + 1;
              else if (pagination.page >= totalPages - 2) p = totalPages - 4 + i;
              else p = pagination.page - 2 + i;

              return (
                <button
                  key={p}
                  onClick={() => pagination.onPageChange(p)}
                  className={cn(
                    "h-8 w-8 rounded-lg text-sm font-medium transition-colors",
                    p === pagination.page
                      ? "bg-zinc-950 text-white"
                      : "text-zinc-600 hover:bg-zinc-100"
                  )}
                >
                  {p}
                </button>
              );
            })}
            <Button
              variant="secondary"
              size="sm"
              icon={<ChevronRight className="h-4 w-4" />}
              disabled={pagination.page >= totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
