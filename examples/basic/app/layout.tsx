import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FlowProvider } from "@/lib/flow/core/provider";
import { getFlowContext } from "@/lib/auth";
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
  title: "Flow Blog Example",
  description: "A minimal blog showcasing next-prisma-flow features",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get the Flow context for the current user
  const ctx = getFlowContext();
  
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FlowProvider ctx={ctx}>
          <div className="min-h-screen bg-background">
            <header className="border-b">
              <div className="container mx-auto px-4 py-4">
                <nav className="flex justify-between items-center">
                  <a href="/" className="text-2xl font-bold">Flow Blog</a>
                  <div className="flex gap-4">
                    <a href="/posts/new" className="text-sm hover:underline">Write</a>
                    <a href="/admin" className="text-sm hover:underline">Admin</a>
                  </div>
                </nav>
              </div>
            </header>
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </FlowProvider>
      </body>
    </html>
  );
}
