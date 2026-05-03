import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ActionBarProvider } from "@/contexts/action-bar-context";
import { ActionBar } from "@/components/action-bar";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "oré",
  description: "Portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} antialiased`}>
      <body className="min-h-dvh bg-background text-foreground">
        <ActionBarProvider>
          {children}
          <Suspense fallback={null}>
            <ActionBar />
          </Suspense>
        </ActionBarProvider>
      </body>
    </html>
  );
}
