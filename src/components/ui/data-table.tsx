"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pagination } from "./widgets";
import { TableSkeleton } from "./states";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  sort?: (row: T) => string | number;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  /** Rendered instead of the table below the md breakpoint. */
  mobileCard?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  empty?: React.ReactNode;
  pageSize?: number;
  loading?: boolean;
  caption?: string;
  initialSort?: { key: string; dir: "asc" | "desc" };
}

export function DataTable<T>({ rows, columns, rowKey, mobileCard, onRowClick, empty, pageSize = 10, loading, caption, initialSort }: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(initialSort ?? null);
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sort) return rows;
    const get = col.sort;
    return [...rows].sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      const r = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? r : -r;
    });
  }, [rows, sort, columns]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages);
  const slice = sorted.slice((current - 1) * pageSize, current * pageSize);

  if (loading) return <TableSkeleton cols={Math.min(columns.length, 6)} />;
  if (!rows.length) return <>{empty}</>;

  return (
    <div>
      {mobileCard && <div className="divide-y divide-line md:hidden">{slice.map((r) => <div key={rowKey(r)}>{mobileCard(r)}</div>)}</div>}
      <div className={cn("overflow-x-auto", mobileCard && "hidden md:block")}>
        <table className="w-full min-w-[720px] text-left text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-line bg-slate-50/70">
              {columns.map((c) => {
                const active = sort?.key === c.key;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : undefined}
                    className={cn("whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted", c.headerClassName)}
                  >
                    {c.sort ? (
                      <button
                        type="button"
                        onClick={() => setSort(active && sort!.dir === "desc" ? { key: c.key, dir: "asc" } : { key: c.key, dir: active ? "desc" : "asc" })}
                        className="inline-flex items-center gap-1 uppercase hover:text-ink"
                      >
                        {c.header}
                        {active ? sort!.dir === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" /> : <ChevronsUpDown className="size-3.5 opacity-50" />}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {slice.map((r) => (
              <tr
                key={rowKey(r)}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                className={cn("bg-white transition-colors", onRowClick && "cursor-pointer hover:bg-slate-50/80")}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn("whitespace-nowrap px-5 py-3.5 align-middle text-ink", c.className)}>
                    {c.cell(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-5 py-3.5 sm:flex-row">
          <p className="text-sm text-muted">
            Showing <span className="font-medium text-ink">{(current - 1) * pageSize + 1}</span>–<span className="font-medium text-ink">{Math.min(current * pageSize, sorted.length)}</span> of{" "}
            <span className="font-medium text-ink">{sorted.length}</span>
          </p>
          <Pagination page={current} pages={pages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
