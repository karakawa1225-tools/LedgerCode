import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LedgerProvider } from "@/context/ledger-context";
import { AppSidebar } from "@/components/app-sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "コード管理",
  description: "カテゴリー別のコード発行、バーコードPNG保存、PDF一覧出力",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-100 dark:bg-zinc-950">
        <LedgerProvider>
          <div className="flex min-h-screen">
            <AppSidebar />
            <main className="min-h-screen flex-1 overflow-x-auto pt-14 md:pt-0">{children}</main>
          </div>
        </LedgerProvider>
      </body>
    </html>
  );
}
