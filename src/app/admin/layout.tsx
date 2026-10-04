import type { Metadata } from "next";
import { AdminShell } from "./admin-shell";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Voyara Admin" }, robots: { index: false } };

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <AdminShell>{children}</AdminShell>;
}
