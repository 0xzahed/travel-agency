import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className, light }: { className?: string; light?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <rect width="32" height="32" rx="9" fill={light ? "#fff" : "#0F4C5C"} />
      <path d="M8 10.5 15.2 23a1 1 0 0 0 1.74 0L24 10.5" fill="none" stroke={light ? "#0F4C5C" : "#fff"} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="10.5" r="2.4" fill="#F4A261" />
    </svg>
  );
}

export function Logo({ href = "/", light, className, suffix }: { href?: string; light?: boolean; className?: string; suffix?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)} aria-label="Voyara home">
      <LogoMark light={light} />
      <span className={cn("font-display text-[19px] font-extrabold tracking-tight", light ? "text-white" : "text-ink")}>
        voyara
        {suffix && <span className={cn("ml-1.5 align-middle text-[11px] font-semibold uppercase tracking-widest", light ? "text-white/60" : "text-muted")}>{suffix}</span>}
      </span>
    </Link>
  );
}
