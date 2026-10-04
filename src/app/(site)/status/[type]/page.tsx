import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ErrorState } from "@/components/ui/states";
import { ButtonLink } from "@/components/ui/button";
import { ERRORS, type ErrorKind } from "@/components/shared/error-catalog";
import { cn } from "@/lib/utils";

const ACTIONS: Record<ErrorKind, [string, string][]> = {
  "404": [["Back to home", "/"], ["Browse tours", "/tours"]],
  "500": [["Try again", "/"], ["Contact support", "/contact"]],
  network: [["Retry", "/"], ["View saved trips", "/dashboard/saved"]],
  "booking-failed": [["Choose another date", "/tours/dubai-luxury-escape/book"], ["Talk to a specialist", "/contact"]],
  "payment-failed": [["Try another method", "/tours/dubai-luxury-escape/book"], ["Contact support", "/dashboard/messages"]],
  unauthorized: [["Back to dashboard", "/admin"], ["Request access", "/admin/settings/roles"]],
  "session-expired": [["Log in again", "/login?reason=expired"], ["Go home", "/"]],
  locked: [["Reset password", "/forgot-password"], ["Contact support", "/contact"]],
};

export function generateStaticParams() {
  return Object.keys(ERRORS).map((type) => ({ type }));
}

export async function generateMetadata({ params }: PageProps<"/status/[type]">): Promise<Metadata> {
  const { type } = await params;
  return { title: ERRORS[type as ErrorKind]?.title ?? "Status" };
}

export default async function StatusPage({ params }: PageProps<"/status/[type]">) {
  const { type } = await params;
  const e = ERRORS[type as ErrorKind];
  if (!e) notFound();
  const actions = ACTIONS[type as ErrorKind];
  return (
    <div className="pb-20 pt-28 md:pt-32">
      <ErrorState
        {...e}
        actions={actions.map(([label, href], i) => (
          <ButtonLink key={href} href={href} variant={i === 0 ? "primary" : "outline"}>
            {label}
          </ButtonLink>
        ))}
      />
      <nav aria-label="Other states" className="container-x mt-6 flex flex-wrap justify-center gap-2">
        {Object.keys(ERRORS).map((k) => (
          <Link key={k} href={`/status/${k}`} className={cn("rounded-lg border px-3 py-1.5 text-xs font-medium", k === type ? "border-primary bg-primary-50 text-primary" : "border-line bg-white text-muted hover:text-ink")}>
            {k}
          </Link>
        ))}
      </nav>
    </div>
  );
}
