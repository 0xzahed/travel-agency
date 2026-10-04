"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/states";
import { Button, ButtonLink } from "@/components/ui/button";
import { ERRORS } from "@/components/shared/error-catalog";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const e = ERRORS["500"];
  return (
    <main id="main" className="grid min-h-dvh place-items-center">
      <ErrorState
        {...e}
        actions={
          <>
            <Button onClick={reset}>Try again</Button>
            <ButtonLink href="/" variant="outline">
              Go home
            </ButtonLink>
          </>
        }
      />
      {error.digest && <p className="pb-6 text-xs text-muted">Reference: {error.digest}</p>}
    </main>
  );
}
