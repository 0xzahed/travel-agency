import type { Metadata } from "next";
import { PortalShell } from "./portal-shell";

export const metadata: Metadata = { title: { default: "My Dashboard", template: "%s · My Voyara" } };

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return <PortalShell>{children}</PortalShell>;
}
