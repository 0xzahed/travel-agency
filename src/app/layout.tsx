import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Voyara — Tours, Visas & Unforgettable Journeys", template: "%s · Voyara" },
  description: "Discover unforgettable destinations, carefully designed tours, and hassle-free visa services.",
};

export const viewport: Viewport = { themeColor: "#0F4C5C" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full">
        <StoreProvider>
          <ToastProvider>{children}</ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
