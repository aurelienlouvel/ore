import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";
import { ActionBar } from "@/components/ActionBar";
import { ScrollInit } from "@/components/ScrollInit";

const neueMontreal = localFont({
  src: "./fonts/PPNeueMontreal-Variable.ttf",
  variable: "--font-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "oré ˖ ࣪⊹) product designer",
  description: "aurélien louvel's internet space",
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
        {children}
        <Suspense fallback={null}>
          <ActionBar />
        </Suspense>
      </body>
    </html>
  );
}
