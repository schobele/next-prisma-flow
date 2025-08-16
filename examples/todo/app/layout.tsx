import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flow Todo - Multi-Tenant Demo",
  description: "A production-ready multi-tenant todo application built with Next.js, Prisma, and next-prisma-flow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <AuthGuard>
            {children}
          </AuthGuard>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
