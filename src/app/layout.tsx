import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "BeautyMart - متجر مستحضرات التجميل",
  description:
    "وجهتك الأولى لمستحضرات التجميل والعناية بالبشرة والشعر. أفضل المنتجات بأسعار الجملة.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-cream text-gray-900 antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
