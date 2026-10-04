"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, CloudUpload, FileText, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Reveal on scroll ─────────────────────────────────── */

export function Reveal({ children, delay = 0, className, y = 16 }: { children: React.ReactNode; delay?: number; className?: string; y?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── Number counter ───────────────────────────────────── */

export function Counter({ to, suffix = "", prefix = "", decimals = 0, className }: { to: number; suffix?: string; prefix?: string; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const fmt = (v: number) => `${prefix}${v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
    if (reduce) {
      el.textContent = fmt(to);
      return;
    }
    const c = animate(0, to, { duration: 1.4, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => (el.textContent = fmt(v)) });
    return () => c.stop();
  }, [inView, to, suffix, prefix, decimals, reduce]);
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}0{suffix}
    </span>
  );
}

/* ── Step indicator ───────────────────────────────────── */

export function StepIndicator({ steps, current, className }: { steps: string[]; current: number; className?: string }) {
  return (
    <nav aria-label="Progress" className={className}>
      <p className="mb-3 text-sm font-medium text-muted md:hidden">
        Step {current + 1} of {steps.length} · <span className="text-ink">{steps[current]}</span>
      </p>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 md:hidden">
        <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${((current + 1) / steps.length) * 100}%` }} />
      </div>
      <ol className="hidden items-center md:flex">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s} className={cn("flex items-center", i < steps.length - 1 && "flex-1")} aria-current={active ? "step" : undefined}>
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors",
                    done && "border-primary bg-primary text-white",
                    active && "border-primary bg-white text-primary ring-4 ring-primary/10",
                    !done && !active && "border-line bg-white text-muted",
                  )}
                >
                  {done ? <Check className="size-4" /> : i + 1}
                </span>
                <span className={cn("whitespace-nowrap text-sm font-medium", active ? "text-ink" : done ? "text-ink/80" : "text-muted")}>{s}</span>
              </div>
              {i < steps.length - 1 && <span className={cn("mx-3 h-px flex-1 transition-colors", done ? "bg-primary" : "bg-line")} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ── Vertical timeline ────────────────────────────────── */

export interface TimelineItem {
  id: string;
  title: React.ReactNode;
  meta?: React.ReactNode;
  body?: React.ReactNode;
  state?: "done" | "current" | "upcoming" | "failed";
}

export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <ol className={cn("relative", className)}>
      {items.map((it, i) => {
        const st = it.state ?? "done";
        return (
          <li key={it.id} className="relative flex gap-4 pb-6 last:pb-0">
            {i < items.length - 1 && <span className={cn("absolute left-[11px] top-7 bottom-0 w-px", st === "done" ? "bg-primary/40" : "bg-line")} aria-hidden />}
            <span
              className={cn(
                "relative z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2",
                st === "done" && "border-primary bg-primary text-white",
                st === "current" && "border-accent bg-white",
                st === "upcoming" && "border-line bg-white",
                st === "failed" && "border-danger bg-danger text-white",
              )}
            >
              {st === "done" && <Check className="size-3" strokeWidth={3} />}
              {st === "failed" && <X className="size-3" strokeWidth={3} />}
              {st === "current" && <span className="size-2 animate-pulse rounded-full bg-accent" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn("text-sm font-semibold", st === "upcoming" ? "text-muted" : "text-ink")}>{it.title}</p>
              {it.meta && <p className="mt-0.5 text-xs text-muted">{it.meta}</p>}
              {it.body && <div className="mt-2 text-sm text-muted">{it.body}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ── Pagination ───────────────────────────────────────── */

export function Pagination({ page, pages, onChange, className }: { page: number; pages: number; onChange: (p: number) => void; className?: string }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  const btn = "grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-sm font-medium transition-colors";
  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-center gap-1.5", className)}>
      <button className={cn(btn, "border-line bg-white hover:bg-slate-50 disabled:opacity-40")} onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Previous page">
        <ChevronLeft className="size-4" />
      </button>
      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-1.5">
          {i > 0 && n - nums[i - 1] > 1 && <span className="px-1 text-muted">…</span>}
          <button
            onClick={() => onChange(n)}
            aria-current={n === page ? "page" : undefined}
            className={cn(btn, n === page ? "border-primary bg-primary text-white" : "border-line bg-white hover:bg-slate-50")}
          >
            {n}
          </button>
        </span>
      ))}
      <button className={cn(btn, "border-line bg-white hover:bg-slate-50 disabled:opacity-40")} onClick={() => onChange(page + 1)} disabled={page === pages} aria-label="Next page">
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}

/* ── Calendar / date picker ───────────────────────────── */

const WEEK = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const toKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function Calendar({
  value,
  onChange,
  minDate,
  availability,
  className,
}: {
  value?: string;
  onChange: (v: string) => void;
  minDate?: string;
  /** Optional: returns seats left for a date, or null if unavailable. */
  availability?: (key: string) => number | null;
  className?: string;
}) {
  const initial = value ? new Date(value) : minDate ? new Date(minDate) : new Date();
  const [cursor, setCursor] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1));
  const min = minDate ? new Date(minDate) : undefined;
  const days = useMemo(() => {
    const first = new Date(cursor);
    const offset = (first.getDay() + 6) % 7;
    const count = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length: count }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1))];
  }, [cursor]);
  const canPrev = !min || new Date(cursor.getFullYear(), cursor.getMonth(), 0) >= new Date(min.getFullYear(), min.getMonth(), 1);

  return (
    <div className={cn("select-none", className)}>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" disabled={!canPrev} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="grid size-9 place-items-center rounded-lg hover:bg-slate-100 disabled:opacity-30" aria-label="Previous month">
          <ChevronLeft className="size-4" />
        </button>
        <p className="text-sm font-semibold" aria-live="polite">
          {cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
        </p>
        <button type="button" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="grid size-9 place-items-center rounded-lg hover:bg-slate-100" aria-label="Next month">
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center" role="grid">
        {WEEK.map((w) => (
          <span key={w} className="py-1 text-xs font-medium text-muted">
            {w}
          </span>
        ))}
        {days.map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const key = toKey(d);
          const seats = availability ? availability(key) : 99;
          const disabled = (min && d < new Date(min.toDateString())) || seats === null;
          const selected = value === key;
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onChange(key)}
              aria-pressed={selected}
              aria-label={d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) + (seats !== null && seats < 6 ? `, ${seats} seats left` : "")}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-colors",
                selected ? "bg-primary font-semibold text-white" : "hover:bg-primary-50",
                disabled && "cursor-not-allowed text-slate-300 line-through hover:bg-transparent",
              )}
            >
              {d.getDate()}
              {!disabled && seats !== null && seats < 6 && <span className={cn("absolute bottom-1 size-1 rounded-full", selected ? "bg-white" : "bg-accent")} aria-hidden />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Range slider (dual thumb) ────────────────────────── */

export function RangeSlider({ min, max, step = 10, value, onChange, format = (n) => String(n) }: { min: number; max: number; step?: number; value: [number, number]; onChange: (v: [number, number]) => void; format?: (n: number) => string }) {
  const pct = (n: number) => ((n - min) / (max - min)) * 100;
  const thumb =
    "pointer-events-none absolute inset-0 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-white";
  return (
    <div>
      <div className="relative h-5">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-slate-200" />
        <div className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary" style={{ left: `${pct(value[0])}%`, right: `${100 - pct(value[1])}%` }} />
        <input type="range" aria-label="Minimum price" min={min} max={max} step={step} value={value[0]} onChange={(e) => onChange([Math.min(Number(e.target.value), value[1] - step), value[1]])} className={thumb} />
        <input type="range" aria-label="Maximum price" min={min} max={max} step={step} value={value[1]} onChange={(e) => onChange([value[0], Math.max(Number(e.target.value), value[0] + step)])} className={thumb} />
      </div>
      <div className="mt-3 flex justify-between text-sm">
        <span className="rounded-md border border-line px-2 py-1 font-medium tabular-nums">{format(value[0])}</span>
        <span className="rounded-md border border-line px-2 py-1 font-medium tabular-nums">{format(value[1])}</span>
      </div>
    </div>
  );
}

/* ── File uploader (mock progress) ────────────────────── */

export interface UploadedFile {
  name: string;
  size: string;
  status: "uploading" | "done" | "error";
  progress: number;
}

const fmtSize = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

export function FileUploader({
  label,
  hint = "PDF, JPG or PNG up to 10 MB",
  file,
  onChange,
  accept = ".pdf,.jpg,.jpeg,.png",
  required,
  compact,
}: {
  label: string;
  hint?: string;
  file?: UploadedFile | null;
  onChange: (f: UploadedFile | null) => void;
  accept?: string;
  required?: boolean;
  compact?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => void (timer.current && clearInterval(timer.current)), []);

  const start = (f: File) => {
    if (f.size > 10 * 1024 * 1024) {
      onChange({ name: f.name, size: fmtSize(f.size), status: "error", progress: 0 });
      return;
    }
    let p = 0;
    const base = { name: f.name, size: fmtSize(f.size) };
    onChange({ ...base, status: "uploading", progress: 0 });
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      p = Math.min(100, p + 18 + Math.random() * 22);
      onChange({ ...base, status: p >= 100 ? "done" : "uploading", progress: p });
      if (p >= 100 && timer.current) clearInterval(timer.current);
    }, 180);
  };

  if (file) {
    return (
      <div className={cn("flex items-center gap-3 rounded-xl border bg-white p-3.5", file.status === "error" ? "border-red-200 bg-danger-50/40" : "border-line")}>
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", file.status === "error" ? "bg-danger-50 text-danger" : "bg-primary-50 text-primary")}>
          <FileText className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium text-ink">{file.name}</p>
            <span className="shrink-0 text-xs text-muted">{file.size}</span>
          </div>
          {file.status === "uploading" && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-secondary transition-[width] duration-150" style={{ width: `${file.progress}%` }} />
              </div>
              <Loader2 className="size-3.5 animate-spin text-muted" aria-label="Uploading" />
            </div>
          )}
          {file.status === "done" && (
            <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-success">
              <Check className="size-3.5" /> {label} uploaded
            </p>
          )}
          {file.status === "error" && <p className="mt-0.5 text-xs font-medium text-danger">File exceeds 10 MB. Please compress and try again.</p>}
        </div>
        <button type="button" onClick={() => onChange(null)} className="grid size-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-slate-100 hover:text-ink" aria-label={`Remove ${file.name}`}>
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => (e.preventDefault(), setDrag(true))}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f) start(f);
      }}
      className={cn(
        "flex items-center gap-4 rounded-xl border border-dashed bg-white transition-colors",
        compact ? "p-3.5" : "flex-col p-6 text-center sm:flex-row sm:text-left",
        drag ? "border-secondary bg-primary-50" : "border-slate-300 hover:border-secondary",
      )}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-muted">
        <CloudUpload className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </p>
        <p className="text-xs text-muted">{hint}</p>
      </div>
      <button type="button" onClick={() => input.current?.click()} className="h-9 shrink-0 rounded-lg border border-line bg-white px-3.5 text-sm font-medium hover:bg-slate-50">
        Browse
      </button>
      <input
        ref={input}
        type="file"
        accept={accept}
        className="sr-only"
        aria-label={`Upload ${label}`}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) start(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/** Creates a fake completed upload — handy for demo "use sample file" actions. */
export const sampleUpload = (name: string, size = "1.1 MB"): UploadedFile => ({ name, size, status: "done", progress: 100 });
