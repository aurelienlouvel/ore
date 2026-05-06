"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SendHorizontal,
  ArrowLeft01Icon,
  PlayIcon,
} from "@hugeicons/core-free-icons";
import { useActionBar } from "@/contexts/action-bar-context";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/work", label: "work" },
  { href: "/play", label: "play" },
  { href: "/info", label: "info" },
] as const;

const sep = <span className="h-5 w-px shrink-0 bg-border" aria-hidden="true" />;

export function ActionBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, projectData } = useActionBar();

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex h-13 items-center gap-1 rounded-2xl border border-border/60 bg-background/80 px-2 shadow-lg backdrop-blur-md">
        {mode === "nav" ? (
          <>
            <Link
              href="/work"
              className="flex h-9 items-center px-3 text-base font-semibold text-zinc-950"
            >
              oré ˖ ⊹
            </Link>

            {sep}

            <nav className="flex items-center" aria-label="Main">
              {NAV_LINKS.map(({ href, label }) => {
                const isActive = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex h-9 items-center rounded-md px-3 text-base transition-colors",
                      isActive
                        ? "bg-zinc-50 font-semibold text-zinc-950"
                        : "text-zinc-600 hover:text-zinc-950",
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {sep}

            <a
              href="mailto:louvel.aurelien.pro@gmail.com"
              className="flex h-9 items-center gap-1.5 rounded-2xl bg-sky-100 px-3 text-base font-medium text-sky-700 transition-colors hover:bg-sky-200"
            >
              <HugeiconsIcon icon={SendHorizontal} size={14} />
              contact
            </a>
          </>
        ) : (
          <>
            <button
              onClick={() => router.back()}
              className="flex h-9 items-center px-3 text-zinc-600 transition-colors hover:text-zinc-950"
              aria-label="Go back"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
            </button>

            {sep}

            <span className="flex h-9 items-center truncate px-3 text-base font-medium text-zinc-950">
              {projectData?.title}
            </span>

            {projectData?.redirectUrl && (
              <>
                {sep}
                <a
                  href={projectData.redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 items-center gap-1.5 rounded-2xl bg-sky-100 px-3 text-base font-medium text-sky-700 transition-colors hover:bg-sky-200"
                >
                  <HugeiconsIcon icon={PlayIcon} size={14} />
                  launch
                </a>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
