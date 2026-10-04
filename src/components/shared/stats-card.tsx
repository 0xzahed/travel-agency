import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatsCard({
  label,
  value,
  icon,
  delta,
  hint,
  href,
  tone = "primary",
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  delta?: number;
  hint?: string;
  href?: string;
  tone?: "primary" | "accent" | "success" | "info" | "warning" | "violet";
}) {
  const tones = {
    primary: "bg-primary-50 text-primary",
    accent: "bg-accent-50 text-accent-600",
    success: "bg-success-50 text-success",
    info: "bg-sky-50 text-sky-700",
    warning: "bg-warning-50 text-amber-600",
    violet: "bg-violet-50 text-violet-700",
  };
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        <span className={cn("grid size-10 place-items-center rounded-xl [&_svg]:size-[18px]", tones[tone])}>{icon}</span>
      </div>
      <p className="mt-2 font-display text-[28px] font-bold leading-none tracking-tight text-ink tabular-nums">{value}</p>
      {(delta !== undefined || hint) && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
          {delta !== undefined && (
            <span className={cn("inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold", delta >= 0 ? "bg-success-50 text-green-700" : "bg-danger-50 text-red-700")}>
              {delta >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              {Math.abs(delta)}%
            </span>
          )}
          {hint}
        </p>
      )}
    </>
  );
  const cls = "block rounded-2xl border border-line bg-white p-5 transition-shadow";
  return href ? (
    <Link href={href} className={cn(cls, "hover:shadow-[var(--shadow-soft)]")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
