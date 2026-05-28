import type { Metadata } from "next";
import localFont from "next/font/local";
import { unstable_cache } from "next/cache";
import "./globals.css";
import { ActionBar } from "@/components/ActionBar";
import { ActionBarProvider } from "@/contexts/ActionBarContext";
import { ScrollInit } from "@/components/ScrollInit";
import { ArtifactImagePrefetch } from "@/components/play/ArtifactImagePrefetch";
import { PlayCanvas } from "@/components/play/PlayCanvas";
import { client } from "@/sanity/client";
import { artifactsCanvasQuery, type ArtifactCanvasItem } from "@/sanity/queries";
import { getArtifactImageUrl } from "@/lib/artifact-utils";

const neueMontreal = localFont({
  src: "./fonts/PPNeueMontreal-Variable.ttf",
  variable: "--font-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "oré ˖ ࣪⊹) product designer",
  description: "aurélien louvel's internet space",
};

// Fetch les artifacts complets — mis en cache 5 min.
// Utilisés à la fois pour le prefetch des images et pour le canvas persistant.
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
  const imageUrls = artifacts
    .map(getArtifactImageUrl)
    .filter((url): url is string => url !== null);

  return (
    <html lang="en" className={`${neueMontreal.variable} antialiased`}>
      <body className="min-h-dvh bg-background text-foreground">
        <ActionBarProvider>
          {/* Prefetch des images dès le 1er chargement de l'app */}
          <ArtifactImagePrefetch urls={imageUrls} />
          {/* Canvas persistant — monté une fois, jamais démonté */}
          <PlayCanvas artifacts={artifacts} />
          <ScrollInit />
          {children}
          <ActionBar />
        </ActionBarProvider>
      </body>
    </html>
  );
}
