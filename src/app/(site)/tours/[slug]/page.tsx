import type { Metadata } from "next";
import { tours } from "@/lib/data/tours";
import { TourDetail } from "./tour-detail";

export function generateStaticParams() {
  return tours.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/tours/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const t = tours.find((x) => x.slug === slug);
  return t ? { title: t.title, description: t.shortDescription } : { title: "Tour" };
}

export default async function TourPage({ params }: PageProps<"/tours/[slug]">) {
  const { slug } = await params;
  return <TourDetail slug={slug} />;
}
