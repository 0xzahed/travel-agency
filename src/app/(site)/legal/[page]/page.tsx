import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { company } from "@/lib/data/content";

const PAGES: Record<string, { title: string; sections: [string, string][] }> = {
  privacy: {
    title: "Privacy Policy",
    sections: [
      ["What we collect", "We collect the information you give us when booking or applying for a visa — names, contact details, passport data and travel preferences — plus basic technical data needed to keep the site secure."],
      ["How we use it", "Solely to deliver your trip or visa service, meet legal obligations (for example airline APIS and border requirements), and — with your consent — send travel inspiration."],
      ["Sharing", "We share only what is strictly necessary with hotels, airlines, ground handlers and embassies involved in your trip. We never sell personal data."],
      ["Your rights", "You can access, correct, export or delete your data at any time from your dashboard or by emailing our Data Protection Officer."],
    ],
  },
  terms: {
    title: "Terms & Conditions",
    sections: [
      ["Your contract", `Your contract is with ${company.legal}. A booking is confirmed once we issue a booking ID and receive payment.`],
      ["Prices", "Prices are per person, include taxes shown at checkout and are guaranteed once your booking is confirmed."],
      ["Changes by you", "One free date change is permitted, subject to availability. Further changes may incur supplier fees."],
      ["Travel documents", "You are responsible for holding a valid passport, visas and health documentation. Our visa desk can assist."],
    ],
  },
  refunds: {
    title: "Refund Policy",
    sections: [
      ["Timing", "Approved refunds are issued to the original payment method within 5–7 working days."],
      ["Visa fees", "Government visa fees are non-refundable once lodged. Our service fee is refundable if we haven't started processing."],
      ["Partial refunds", "Unused services after departure are not refundable unless covered by your travel insurance."],
    ],
  },
  cancellation: {
    title: "Cancellation Policy",
    sections: [
      ["30+ days before departure", "Full refund, no questions asked."],
      ["29–14 days before departure", "50% refund of the tour price. Add-ons refunded in full where suppliers allow."],
      ["13 days or fewer", "No refund. We strongly recommend comprehensive travel insurance."],
      ["How to cancel", "Cancel from Dashboard → My Bookings, or contact support. You'll receive written confirmation immediately."],
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map((page) => ({ page }));
}

export async function generateMetadata({ params }: PageProps<"/legal/[page]">): Promise<Metadata> {
  const { page } = await params;
  return { title: PAGES[page]?.title };
}

export default async function LegalPage({ params }: PageProps<"/legal/[page]">) {
  const { page } = await params;
  const p = PAGES[page];
  if (!p) notFound();
  return (
    <div className="pb-24 pt-28 md:pt-36">
      <div className="container-x max-w-3xl">
        <p className="text-sm text-muted">Last updated 1 September 2026</p>
        <h1 className="mt-2 text-4xl font-bold">{p.title}</h1>
        <div className="mt-10 space-y-8">
          {p.sections.map(([h, t], i) => (
            <section key={h}>
              <h2 className="text-xl font-bold">
                {i + 1}. {h}
              </h2>
              <p className="mt-2 leading-relaxed text-slate-700">{t}</p>
            </section>
          ))}
        </div>
        <p className="mt-12 rounded-xl bg-slate-50 p-5 text-sm text-muted">
          Questions? Email <a href={`mailto:${company.email}`} className="font-medium text-secondary">{company.email}</a>.
        </p>
      </div>
    </div>
  );
}
