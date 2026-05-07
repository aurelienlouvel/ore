"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  MessageMultiple02Icon,
  ArrowLeft01Icon,
  PlayIcon,
} from "@hugeicons/core-free-icons";
import { motion, AnimatePresence } from "motion/react";
import { useActionBar } from "@/contexts/action-bar-context";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/work", label: "work" },
  { href: "/play", label: "play" },
  { href: "/info", label: "info" },
] as const;

const sep = (
  <span className="mx-3 h-5 w-px shrink-0 bg-border" aria-hidden="true" />
);

const TOAST_COLORS = [
  { bg: "bg-sky-50", text: "text-sky-500" },
  { bg: "bg-violet-50", text: "text-violet-500" },
  { bg: "bg-rose-50", text: "text-rose-500" },
  { bg: "bg-amber-50", text: "text-amber-500" },
  { bg: "bg-emerald-50", text: "text-emerald-500" },
  { bg: "bg-pink-50", text: "text-pink-500" },
  { bg: "bg-indigo-50", text: "text-indigo-500" },
] as const;

type ToastState = {
  id: number;
  color: (typeof TOAST_COLORS)[number];
  rotate: number;
};

export function ActionBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, projectData } = useActionBar();
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRotateRef = useRef<number>(2);

  const handleCopy = () => {
    navigator.clipboard.writeText("louvel.aurelien.pro@gmail.com");
    if (timerRef.current) clearTimeout(timerRef.current);
    const rotate = lastRotateRef.current === -2 ? 2 : -2;
    lastRotateRef.current = rotate;
    const color = TOAST_COLORS[Math.floor(Math.random() * TOAST_COLORS.length)];
    setToast({ id: Date.now(), color, rotate });
    timerRef.current = setTimeout(() => setToast(null), 1100);
  };

  return (
    <div className="fixed bottom-12 left-1/2 z-50 w-max -translate-x-1/2 max-w-[calc(100vw-48px)]">
      <div className="flex h-16 items-center rounded-3xl border border-border/60 bg-background/80 px-2 shadow-lg backdrop-blur-md">
        {mode === "nav" ? (
          <>
            <Link href="/work" className="flex h-11 items-center pl-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="oré" className="h-5 w-auto" />
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
                      "flex h-11 items-center rounded-xl px-3 text-base transition-colors",
                      isActive
                        ? "bg-zinc-50 text-zinc-950"
                        : "text-zinc-600 hover:text-zinc-950",
                    )}
                    style={isActive ? { fontWeight: 540 } : undefined}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {sep}

            <div className="relative">
              <AnimatePresence>
                {toast !== null && (
                  <motion.span
                    key={toast.id}
                    className={cn(
                      "pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-xs",
                      toast.color.bg,
                      toast.color.text,
                    )}
                    initial={{ opacity: 0, y: 18, rotate: toast.rotate }}
                    animate={{ opacity: 1, y: -22, rotate: toast.rotate }}
                    exit={{
                      opacity: 0,
                      y: -32,
                      x: toast.rotate > 0 ? 10 : -10,
                      rotate: toast.rotate,
                      transition: { duration: 0.26, ease: "easeOut" },
                    }}
                    transition={{ type: "spring", stiffness: 460, damping: 28 }}
                  >
                    email copied ;)
                  </motion.span>
                )}
              </AnimatePresence>

              <motion.button
                onClick={handleCopy}
                className="flex h-10 items-center gap-1.5 rounded-xl bg-sky-50 px-3 text-base font-medium text-sky-500"
                whileHover={{ scale: 0.95, rotate: -1.5 }}
                whileTap={{ scale: 0.87, rotate: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span className="text-sky-500">
                  <HugeiconsIcon icon={MessageMultiple02Icon} size={15} />
                </span>
                let&apos;s chat
              </motion.button>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => router.back()}
              className="flex h-11 items-center px-3 text-zinc-600 transition-colors hover:text-zinc-950"
              aria-label="Go back"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
            </button>

            {sep}

            <span className="flex h-11 items-center truncate px-3 text-base font-medium text-zinc-950">
              {projectData?.title}
            </span>

            {projectData?.redirectUrl && (
              <>
                {sep}
                <a
                  href={projectData.redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 items-center gap-1.5 rounded-xl bg-sky-100 px-3 text-base font-medium text-sky-900 transition-colors hover:bg-sky-200"
                >
                  <HugeiconsIcon icon={PlayIcon} size={15} />
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
