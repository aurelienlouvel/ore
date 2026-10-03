import type { Metadata } from "next";
import { HugeiconsIcon } from "@hugeicons/react";
import { CursorMagicSelection04Icon } from "@hugeicons/core-free-icons";
import { NOTION_PAGE_URL, WIP_SITE_URL } from "@/lib/landing";

// Reprend le titre et la description de la page Notion, pour que l'onglet et
// les aperçus de lien restent ceux du portfolio actuel.
export const metadata: Metadata = {
  title: "oré ˖ ࣪⊹ product designer",
  description: "product designer — paris, france",
};

/**
 * Landing de prod : la page Notion du portfolio actuel en plein écran, et un
 * bouton flottant (même pastille que l'ActionBar) vers le site WIP. Statique :
 * rien ici ne dépend de la requête.
 */
export default function NotionLandingPage() {
  return (
    <main className="fixed inset-0 bg-white">
      <iframe
        src={NOTION_PAGE_URL}
        title="oré — portfolio"
        className="block size-full border-0"
        allow="fullscreen; clipboard-write; autoplay; picture-in-picture"
      />

      <div className="pointer-events-none fixed inset-x-0 bottom-12 z-50 flex justify-center px-3">
        <div className="pointer-events-auto flex h-16 items-center rounded-3xl border border-border/60 bg-white px-2 shadow-md">
          <a
            href={WIP_SITE_URL}
            className="flex h-10 items-center gap-1.5 rounded-xl bg-main-50 px-3 text-base font-medium text-main-500 outline-none transition-transform duration-200 ease-out focus-visible:ring-3 focus-visible:ring-main-500/30 motion-safe:hover:-rotate-[1.5deg] motion-safe:hover:scale-[0.95] motion-safe:active:-rotate-2 motion-safe:active:scale-[0.87]"
          >
            <HugeiconsIcon
              icon={CursorMagicSelection04Icon}
              size={15}
              strokeWidth={2}
            />
            visit the wip site
          </a>
        </div>
      </div>
    </main>
  );
}
