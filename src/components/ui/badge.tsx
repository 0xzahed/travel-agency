import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  primary: "bg-primary-50 text-primary ring-primary-100",
  accent: "bg-accent-50 text-[#9a4a12] ring-accent/30",
  success: "bg-success-50 text-green-700 ring-green-200",
  warning: "bg-warning-50 text-amber-700 ring-amber-200",
  danger: "bg-danger-50 text-red-700 ring-red-200",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
} as const;

export type Tone = keyof typeof tones;

export function Badge({ tone = "neutral", className, dot, children }: { tone?: Tone; className?: string; dot?: boolean; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset", tones[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

const statusTone: Record<string, Tone> = {
  Confirmed: "success",
  Paid: "success",
  Completed: "success",
  Approved: "success",
  Verified: "success",
  Active: "success",
  Resolved: "success",
  published: "success",
  Published: "success",
  Pending: "warning",
  "Under Review": "warning",
  "In Progress": "info",
  Processing: "info",
  Submitted: "primary",
  Open: "primary",
  Waiting: "violet",
  "Documents Required": "accent",
  "Re-upload Requested": "accent",
  "Partially Refunded": "accent",
  Refunded: "neutral",
  Closed: "neutral",
  draft: "neutral",
  Draft: "neutral",
  Invited: "info",
  Cancelled: "danger",
  Rejected: "danger",
  Failed: "danger",
  Suspended: "danger",
  Expired: "danger",
  Disabled: "neutral",
  Low: "neutral",
  Medium: "info",
  High: "accent",
  Urgent: "danger",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const label = status === "published" ? "Published" : status === "draft" ? "Draft" : status;
  return (
    <Badge tone={statusTone[status] ?? "neutral"} dot className={className}>
      {label}
    </Badge>
  );
}
