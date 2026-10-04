import { Suspense } from "react";
import type { Metadata } from "next";
import { VisaTracker } from "./visa-tracker";

export const metadata: Metadata = { title: "Track visa application" };

export default function TrackPage() {
  return (
    <div className="bg-canvas pb-24 pt-28 md:pt-36">
      <div className="container-x max-w-3xl">
        <div className="text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-secondary">Visa tracking</p>
          <h1 className="mt-3 text-3xl font-bold md:text-[42px]">Track your application</h1>
          <p className="mt-3 text-muted">Enter your application ID and passport number to see live status.</p>
        </div>
        <Suspense>
          <VisaTracker />
        </Suspense>
      </div>
    </div>
  );
}
