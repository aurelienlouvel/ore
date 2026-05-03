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

export function ActionBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, projectData } = useActionBar();

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div
        className={cn(
          "flex items-center gap-3 rounded-full border border-border/60",
          "bg-background/80 px-4 py-2 shadow-lg backdrop-blur-md",
          "text-sm"
        )}
      >
        {mode === "nav" ? (
          <>
            <Link
              href="/work"
              className="font-semibold tracking-tight text-foreground"
            >
              oré ˖ ⊹
            </Link>

            <span className="h-4 w-px bg-border" aria-hidden="true" />

            <nav className="flex items-center gap-3" aria-label="Main">
              {NAV_LINKS.map(({ href, label }) => {
                const isActive = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "transition-colors hover:text-foreground",
                      isActive
                        ? "font-semibold text-foreground"
                        : "font-normal text-muted-foreground"
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            <span className="h-4 w-px bg-border" aria-hidden="true" />

            <a
              href="mailto:louvel.aurelien.pro@gmail.com"
              className="flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700 transition-colors hover:bg-sky-200"
            >
              <HugeiconsIcon icon={SendHorizontal} size={11} />
              contact
            </a>
          </>
        ) : (
          <>
            <button
              onClick={() => router.back()}
              className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Go back"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
            </button>

            <span className="h-4 w-px bg-border" aria-hidden="true" />

            <span className="max-w-[240px] truncate font-medium text-foreground">
              {projectData?.title}
            </span>

            {projectData?.redirectUrl && (
              <>
                <span className="h-4 w-px bg-border" aria-hidden="true" />
                <a
                  href={projectData.redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700 transition-colors hover:bg-sky-200"
                >
                  <HugeiconsIcon icon={PlayIcon} size={11} />
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
