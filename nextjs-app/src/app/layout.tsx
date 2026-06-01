import type { Metadata } from "next";
import localFont from "next/font/local";
import { unstable_cache } from "next/cache";
import "./globals.css";
import { ActionBar } from "@/components/ActionBar";
import { ActionBarProvider } from "@/contexts/ActionBarContext";
import { ClientAnimationProvider } from "@/components/ClientAnimationProvider";
import { ScrollInit } from "@/components/ScrollInit";
import { PlayCanvasMount } from "@/components/play/PlayCanvasMount";
import { client } from "@/sanity/client";
import { artifactsCanvasQuery, type ArtifactCanvasItem } from "@/sanity/queries";

const neueMontreal = localFont({
  src: "./fonts/PPNeueMontreal-Variable.ttf",
  variable: "--font-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "oré ˖ ࣪⊹) product designer",
  description: "aurélien louvel's internet space",
};

// Fetch les artifacts pour le canvas /play — mis en cache 5 min.
const getCachedArtifacts = unstable_cache(
  async (): Promise<ArtifactCanvasItem[]> =>
    client.fetch<ArtifactCanvasItem[]>(artifactsCanvasQuery),
  ["play-artifacts"],
  { revalidate: 300 },
);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ne bloque jamais le rendu — si Sanity est down le canvas est juste vide
  const artifacts = await getCachedArtifacts().catch(() => [] as ArtifactCanvasItem[]);

  return (
    <html lang="en" className={`${neueMontreal.variable} antialiased`}>
      <body className="min-h-dvh bg-background text-foreground">
        <ActionBarProvider>
          {/* Canvas persistant — monté au premier passage sur /play, jamais démonté après */}
          <PlayCanvasMount artifacts={artifacts} />
          <ScrollInit />
          <ClientAnimationProvider>
            {children}
          </ClientAnimationProvider>
          <ActionBar />
        </ActionBarProvider>
      </body>
    </html>
  );
}
