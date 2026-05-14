import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ActionBar } from "@/components/ActionBar";
import { ActionBarProvider } from "@/contexts/ActionBarContext";
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
        <ActionBarProvider>
          <ScrollInit />
          {children}
          <ActionBar />
        </ActionBarProvider>
      </body>
    </html>
  );
}
