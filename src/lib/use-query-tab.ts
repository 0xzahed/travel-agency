"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Keeps a tab value in the URL (?key=value) so sidebar links and shares stay in sync. */
export function useQueryTab<T extends string>(key: string, allowed: readonly T[], fallback: T): [T, (v: T) => void] {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = params.get(key) as T | null;
  const value = raw && allowed.includes(raw) ? raw : fallback;
  const set = (v: T) => {
    const p = new URLSearchParams(params.toString());
    if (v === fallback) p.delete(key);
    else p.set(key, v);
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  return [value, set];
}
