import Image from "next/image";
import { Star } from "lucide-react";
import { cn, initials } from "@/lib/utils";

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action, className }: { title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4", className)}>
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Avatar({ src, name, size = 40, className }: { src?: string; name: string; size?: number; className?: string }) {
  return (
    <span
      className={cn("relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-primary-100 font-semibold text-primary", className)}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.36) }}
    >
      {src ? <Image src={src} alt={name} fill sizes={`${size * 2}px`} className="object-cover" /> : <span aria-hidden>{initials(name)}</span>}
      {!src && <span className="sr-only">{name}</span>}
    </span>
  );
}

export function Rating({ value, count, size = "sm", className }: { value: number; count?: number; size?: "sm" | "md"; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", size === "sm" ? "text-[13px]" : "text-sm", className)}>
      <Star className={cn("fill-accent text-accent", size === "sm" ? "size-3.5" : "size-4")} aria-hidden />
      <span className="font-semibold text-ink">{value.toFixed(value % 1 ? (String(value).length > 3 ? 2 : 1) : 1)}</span>
      {count !== undefined && <span className="text-muted">({count.toLocaleString()} reviews)</span>}
      <span className="sr-only">out of 5</span>
    </span>
  );
}

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} aria-label={`${value} out of 5 stars`} role="img">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn("size-4", i < Math.round(value) ? "fill-accent text-accent" : "fill-slate-200 text-slate-200")} aria-hidden />
      ))}
    </span>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("mb-10 flex flex-col gap-4 md:mb-12", align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between", className)}>
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-secondary">{eyebrow}</p>}
        <h2 className="text-3xl font-bold leading-tight text-ink md:text-[40px]">{title}</h2>
        {description && <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, description, actions, breadcrumb }: { title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; breadcrumb?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {breadcrumb && <div className="mb-2 text-sm text-muted">{breadcrumb}</div>}
        <h1 className="text-2xl font-bold text-ink md:text-[28px]">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted md:text-[15px]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} aria-hidden />;
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-line", className)} />;
}

export function KeyValue({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

export function ProgressBar({ value, className, tone = "primary" }: { value: number; className?: string; tone?: "primary" | "accent" | "success" }) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-slate-100", className)} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", tone === "primary" && "bg-primary", tone === "accent" && "bg-accent", tone === "success" && "bg-success")}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
