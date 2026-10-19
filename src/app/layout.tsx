import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

import "./globals.css";

export const metadata: Metadata = {
  title: "Sales Intelligence",
  description: "Dashboard untuk memantau pipeline dan peluang penjualan.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>
        <div className="min-h-screen bg-[#fbfdff] text-[#081738] lg:grid lg:grid-cols-[234px_1fr]">
          <Sidebar />
          <div className="min-w-0">
            <Header />
            <main className="dashboard-background min-h-[calc(100vh-65px)] px-5 py-10 sm:px-10 lg:px-12 lg:py-[80px]">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
