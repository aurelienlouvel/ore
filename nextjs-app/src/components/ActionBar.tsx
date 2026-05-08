"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  MessageMultiple02Icon,
  ArrowLeft02Icon,
  CursorMagicSelection04Icon,
} from "@hugeicons/core-free-icons";
import { motion, AnimatePresence } from "motion/react";
import { client } from "@/sanity/client";
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

type ProjectBarData = {
  title: string;
  redirectUrl: string | null;
};

export function ActionBar() {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();

  const [toast, setToast] = useState<ToastState | null>(null);
  const [mode, setMode] = useState<"nav" | "project">("nav");
  const [projectData, setProjectData] = useState<ProjectBarData | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRotateRef = useRef<number>(2);

  const slug = typeof params?.slug === "string" ? params.slug : null;

  useEffect(() => {
    if (!slug) {
      setMode("nav");
      setProjectData(null);
      return;
    }
    client
      .fetch<ProjectBarData>(
        `*[_type == "project" && slug.current == $slug][0]{ title, redirectUrl }`,
        { slug },
      )
      .then((data) => {
        if (data) {
          setProjectData(data);
          setMode("project");
        }
      });
  }, [slug]);

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
    <div className="fixed bottom-12 inset-x-0 z-50 flex justify-center pointer-events-none px-6">
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 60, damping: 12, mass: 1 }}
        className="relative pointer-events-auto h-16 overflow-hidden rounded-3xl border border-border/60 bg-background/80 shadow-lg backdrop-blur-md"
      >
        {/* Nav content — in normal flow when active (sets container width), absolutely positioned when inactive */}
        <motion.div
          layout
          animate={{ opacity: mode === "nav" ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className={cn(
            "flex h-full items-center px-2",
            mode === "project" && "pointer-events-none absolute top-0 left-0",
          )}
        >
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
              <HugeiconsIcon icon={MessageMultiple02Icon} size={15} strokeWidth={2} />
              let&apos;s chat
            </motion.button>
          </div>
        </motion.div>

        {/* Project content — in normal flow when active, absolutely positioned when inactive */}
        <motion.div
          layout
          animate={{ opacity: mode === "project" ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className={cn(
            "flex h-full items-center px-2",
            mode === "nav" && "pointer-events-none absolute top-0 left-0",
          )}
        >
          <motion.button
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-10 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-zinc-600"
            whileHover={{ scale: 0.93 }}
            whileTap={{ scale: 0.87 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} size={16} strokeWidth={2} />
          </motion.button>

          {projectData?.title && (
            <span className="whitespace-nowrap px-3 text-base font-medium text-zinc-950">
              {projectData.title}
            </span>
          )}

          {projectData?.redirectUrl && (
            <>
              {sep}
              <motion.a
                href={projectData.redirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-sky-50 px-3 text-base font-medium text-sky-500"
                whileHover={{ scale: 0.95, rotate: -1.5 }}
                whileTap={{ scale: 0.87, rotate: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <HugeiconsIcon icon={CursorMagicSelection04Icon} size={15} strokeWidth={2} />
                visit
              </motion.a>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
