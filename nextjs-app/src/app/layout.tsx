import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";
import { ActionBarProvider } from "@/contexts/action-bar-context";
import { ActionBar } from "@/components/action-bar";
import { ScrollInit } from "@/components/scroll-init";

const neueMontreal = localFont({
  src: "./fonts/PPNeueMontreal-Variable.ttf",
  variable: "--font-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "oré ˖ ࣪⊹ product designer · paris, fr",
  description: "Portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${neueMontreal.variable} antialiased`}>
      <body className="min-h-dvh bg-background text-foreground">
        <ScrollInit />
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
