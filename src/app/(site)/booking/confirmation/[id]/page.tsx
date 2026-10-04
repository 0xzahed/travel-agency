import type { Metadata } from "next";
import { Confirmation } from "./confirmation";

export const metadata: Metadata = { title: "Booking confirmed" };

export default async function ConfirmationPage({ params }: PageProps<"/booking/confirmation/[id]">) {
  const { id } = await params;
  return <Confirmation id={decodeURIComponent(id)} />;
}
