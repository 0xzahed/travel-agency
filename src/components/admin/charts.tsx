"use client";

import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Table2, BarChart3 } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { cn, formatMoney, formatNumber } from "@/lib/utils";

/**
 * Chart palette — validated with the dataviz validator (light mode, all checks pass):
 * slot 1 teal #0a83a0 · slot 2 orange #eb6834 · slot 3 violet #4a3aa7. Max 3 series.
 */
export const SERIES = ["#0a83a0", "#eb6834", "#4a3aa7"] as const;
const GRID = "#eef2f6";
const AXIS = "#64748b";

type Fmt = "money" | "number";
const fmt = (v: number, f: Fmt, compact = false) => (f === "money" ? formatMoney(v, { compact }) : formatNumber(v));

export function ChartCard({
  title,
  description,
  action,
  children,
  table,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  /** Accessible table alternative: header row + body rows. */
  table?: { head: string[]; rows: (string | number)[][] };
  className?: string;
}) {
  const [asTable, setAsTable] = useState(false);
  return (
    <section className={cn("rounded-2xl border border-line bg-white", className)} aria-label={title}>
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-2 pt-4">
        <div>
          <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
          {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {action}
          {table && (
            <button
              onClick={() => setAsTable(!asTable)}
              className="grid size-8 place-items-center rounded-lg border border-line text-muted hover:text-ink"
              aria-pressed={asTable}
              aria-label={asTable ? "Show chart" : "Show as table"}
              title={asTable ? "Show chart" : "Show as table"}
            >
              {asTable ? <BarChart3 className="size-4" /> : <Table2 className="size-4" />}
            </button>
          )}
        </div>
      </div>
      <div className="px-2 pb-4">
        {asTable && table ? (
          <div className="max-h-72 overflow-auto px-3">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                  {table.head.map((h) => (
                    <th key={h} className="py-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {table.rows.map((r, i) => (
                  <tr key={i}>
                    {r.map((c, j) => (
                      <td key={j} className={cn("py-2", j > 0 && "tabular-nums")}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

function TooltipBox({ active, payload, label, format, names }: { active?: boolean; payload?: { value: number; dataKey: string; color: string }[]; label?: string; format: Fmt; names: Record<string, string> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm shadow-[var(--shadow-lift)]">
      <p className="mb-1.5 text-xs font-medium text-muted">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2">
          <span className="size-2.5 rounded-sm" style={{ background: p.color }} aria-hidden />
          <span className="text-muted">{names[p.dataKey] ?? p.dataKey}</span>
          <span className="ml-auto pl-4 font-semibold tabular-nums text-ink">{fmt(p.value, format)}</span>
        </p>
      ))}
    </div>
  );
}

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 px-3 pb-2 text-xs text-muted">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: i.color }} aria-hidden />
          {i.label}
        </li>
      ))}
    </ul>
  );
}

export function TrendChart({
  data,
  x,
  series,
  format = "number",
  height = 260,
  area = true,
}: {
  data: Record<string, string | number>[];
  x: string;
  series: { key: string; label: string }[];
  format?: Fmt;
  height?: number;
  area?: boolean;
}) {
  const names = Object.fromEntries(series.map((s) => [s.key, s.label]));
  const axisProps = { tick: { fill: AXIS, fontSize: 12 }, axisLine: false, tickLine: false } as const;
  return (
    <>
      {series.length > 1 && <Legend items={series.map((s, i) => ({ label: s.label, color: SERIES[i] }))} />}
      <div style={{ height }} role="img" aria-label={`${series.map((s) => s.label).join(" and ")} over time`}>
        <ResponsiveContainer width="100%" height="100%">
          {area ? (
            <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                {series.map((s, i) => (
                  <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SERIES[i]} stopOpacity={0.16} />
                    <stop offset="100%" stopColor={SERIES[i]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey={x} {...axisProps} dy={6} />
              <YAxis {...axisProps} width={56} tickFormatter={(v) => fmt(v, format, true)} />
              <Tooltip content={<TooltipBox format={format} names={names} />} cursor={{ stroke: "#94a3b8", strokeDasharray: "3 3" }} />
              {series.map((s, i) => (
                <Area key={s.key} type="monotone" dataKey={s.key} stroke={SERIES[i]} strokeWidth={2} fill={`url(#fill-${s.key})`} isAnimationActive={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
              ))}
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey={x} {...axisProps} dy={6} />
              <YAxis {...axisProps} width={56} tickFormatter={(v) => fmt(v, format, true)} />
              <Tooltip content={<TooltipBox format={format} names={names} />} cursor={{ stroke: "#94a3b8", strokeDasharray: "3 3" }} />
              {series.map((s, i) => (
                <Line key={s.key} type="monotone" dataKey={s.key} stroke={SERIES[i]} strokeWidth={2} dot={false} isAnimationActive={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </>
  );
}

export function ColumnChart({
  data,
  x,
  series,
  format = "number",
  height = 260,
  stacked,
}: {
  data: Record<string, string | number>[];
  x: string;
  series: { key: string; label: string }[];
  format?: Fmt;
  height?: number;
  stacked?: boolean;
}) {
  const reduce = useReducedMotion();
  const names = Object.fromEntries(series.map((s) => [s.key, s.label]));
  const axisProps = { tick: { fill: AXIS, fontSize: 12 }, axisLine: false, tickLine: false } as const;
  return (
    <>
      {series.length > 1 && <Legend items={series.map((s, i) => ({ label: s.label, color: SERIES[i] }))} />}
      <div style={{ height }} role="img" aria-label={`${series.map((s) => s.label).join(" and ")} by ${x}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} barGap={2} barCategoryGap="28%">
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey={x} {...axisProps} dy={6} />
            <YAxis {...axisProps} width={44} tickFormatter={(v) => fmt(v, format, true)} allowDecimals={false} />
            <Tooltip content={<TooltipBox format={format} names={names} />} cursor={{ fill: "rgba(15,76,92,0.05)" }} />
            {series.map((s, i) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                fill={SERIES[i]}
                stackId={stacked ? "a" : undefined}
                radius={stacked ? (i === series.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]) : [4, 4, 0, 0]}
                maxBarSize={36}
                isAnimationActive={!reduce}
                animationDuration={500}
                stroke="#fff"
                strokeWidth={stacked ? 2 : 0}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

/** Ranked horizontal bars as HTML — crisp labels, values in text ink, hover tooltip via title. */
export function BarList({ items, format = "number", color = SERIES[0] }: { items: { label: string; value: number; sub?: string }[]; format?: Fmt; color?: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="space-y-3 px-3 pt-2">
      {items.map((i) => (
        <li key={i.label} className="group" title={`${i.label}: ${fmt(i.value, format)}`}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-medium text-ink">{i.label}</span>
            <span className="shrink-0 tabular-nums text-muted">
              <span className="font-semibold text-ink">{fmt(i.value, format)}</span>
              {i.sub && <span className="ml-1.5 text-xs">{i.sub}</span>}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-full rounded-full transition-[width,opacity] duration-500 group-hover:opacity-80" style={{ width: `${(i.value / max) * 100}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

const STATUS_COLOR: Record<string, string> = {
  Submitted: "#0a83a0",
  "Under Review": "#f59e0b",
  "Documents Required": "#eb6834",
  Processing: "#4a3aa7",
  Approved: "#16a34a",
  Rejected: "#dc2626",
  Completed: "#64748b",
};

/** Status distribution: one segmented bar + labelled legend (identity never by color alone). */
export function StatusBreakdown({ items }: { items: { status: string; count: number }[] }) {
  const total = items.reduce((s, i) => s + i.count, 0) || 1;
  return (
    <div className="px-3 pt-2">
      <div className="flex h-3 gap-0.5 overflow-hidden rounded-full" role="img" aria-label={items.map((i) => `${i.status} ${i.count}`).join(", ")}>
        {items
          .filter((i) => i.count)
          .map((i) => (
            <span key={i.status} title={`${i.status}: ${i.count}`} style={{ width: `${(i.count / total) * 100}%`, background: STATUS_COLOR[i.status] }} />
          ))}
      </div>
      <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        {items.map((i) => (
          <li key={i.status} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: STATUS_COLOR[i.status] }} aria-hidden />
            <span className="truncate text-muted">{i.status}</span>
            <span className="ml-auto font-semibold tabular-nums text-ink">{i.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
