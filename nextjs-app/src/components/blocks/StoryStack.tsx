"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GithubIcon,
  Image02Icon,
  MusicNote01Icon,
  Video01Icon,
  WorkoutRunIcon,
  GitCommitIcon,
} from "@hugeicons/core-free-icons";
import { EASE_IN_OUT } from "@/lib/easings";

const STORY_DURATION = 4; // seconds

export type StorySlide =
  | { type: "photo"; imageUrl: string | null; alt: string | null; caption: string | null }
  | { type: "video"; videoUrl: string | null; caption: string | null }
  | { type: "appleMusic"; url: string | null }
  | { type: "strava"; profileUrl: string | null }
  | {
      type: "github";
      repo: string | null;
      message: string | null;
      date: string | null;
      url: string | null;
    };

function slideLink(slide: StorySlide): string | null {
  switch (slide.type) {
    case "appleMusic":
      return slide.url;
    case "strava":
      return slide.profileUrl;
    case "github":
      return slide.url;
    default:
      return null;
  }
}

function PlaceholderSlide({
  icon,
  label,
}: {
  icon: Parameters<typeof HugeiconsIcon>[0]["icon"];
  label: string;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-stone-50 text-stone-300">
      <HugeiconsIcon icon={icon} size={28} strokeWidth={1.5} />
      <span className="text-xs font-medium text-stone-400">{label}</span>
    </div>
  );
}

function SlideContent({ slide }: { slide: StorySlide }) {
  switch (slide.type) {
    case "photo":
      if (!slide.imageUrl) {
        return <PlaceholderSlide icon={Image02Icon} label="photo à venir" />;
      }
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slide.imageUrl}
          alt={slide.alt ?? ""}
          className="h-full w-full object-cover"
        />
      );
    case "video":
      if (!slide.videoUrl) {
        return <PlaceholderSlide icon={Video01Icon} label="vidéo à venir" />;
      }
      return (
        <video
          src={slide.videoUrl}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      );
    case "appleMusic":
      return (
        <div className="flex h-full w-full flex-col justify-end bg-gradient-to-br from-rose-500 to-fuchsia-600 p-5 text-white">
          <HugeiconsIcon
            icon={MusicNote01Icon}
            size={26}
            strokeWidth={2}
            className="mb-auto opacity-90"
          />
          <span className="text-xs font-medium uppercase tracking-wide text-white/70">
            Apple Music
          </span>
          <span className="text-sm font-semibold">Now playing</span>
        </div>
      );
    case "strava":
      return (
        <div className="flex h-full w-full flex-col justify-end bg-[#FC4C02] p-5 text-white">
          <HugeiconsIcon
            icon={WorkoutRunIcon}
            size={26}
            strokeWidth={2}
            className="mb-auto opacity-90"
          />
          <span className="text-xs font-medium uppercase tracking-wide text-white/70">
            Strava
          </span>
          <span className="text-sm font-semibold">Latest activity</span>
        </div>
      );
    case "github":
      if (!slide.repo) {
        return <PlaceholderSlide icon={GithubIcon} label="GitHub" />;
      }
      return (
        <div className="flex h-full w-full flex-col justify-end bg-stone-800 p-4 text-white">
          <div className="mb-1 flex items-center gap-1.5 text-white/70">
            <HugeiconsIcon icon={GithubIcon} size={12} strokeWidth={2} />
            <span className="text-xs font-medium">{slide.repo}</span>
          </div>
          <div className="flex items-start gap-1.5">
            <HugeiconsIcon
              icon={GitCommitIcon}
              size={14}
              strokeWidth={2}
              className="mt-0.5 shrink-0"
            />
            <span className="text-sm leading-snug">{slide.message}</span>
          </div>
          {slide.date && (
            <span className="mt-1 text-xs text-white/50">{slide.date}</span>
          )}
        </div>
      );
  }
}

function CountdownRing({ trigger }: { trigger: number }) {
  const r = 9;
  const circumference = 2 * Math.PI * r;
  return (
    <div className="pointer-events-none absolute right-3 top-3 z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
      <svg width="24" height="24" viewBox="0 0 24 24" className="-rotate-90">
        <circle
          cx="12"
          cy="12"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="2.5"
        />
        <motion.circle
          key={trigger}
          cx="12"
          cy="12"
          r={r}
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: circumference }}
          transition={{ duration: STORY_DURATION, ease: "linear" }}
        />
      </svg>
    </div>
  );
}

export function StoryStack({ slides }: { slides: StorySlide[] }) {
  const [index, setIndex] = useState(0);

  const hasMultiple = slides.length > 1;

  useEffect(() => {
    if (!hasMultiple) return;
    const timer = setTimeout(
      () => setIndex((i) => (i + 1) % slides.length),
      STORY_DURATION * 1000,
    );
    return () => clearTimeout(timer);
  }, [index, slides.length, hasMultiple]);

  if (slides.length === 0) return null;

  const current = slides[index];
  const link = slideLink(current);

  return (
    <div className="relative aspect-[6/7] w-full">
      {hasMultiple && (
        <div className="absolute inset-0 translate-x-3 -translate-y-3 rotate-2 rounded-3xl bg-stone-100" />
      )}
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={index}
          initial={{ scale: 0.9, x: 14, y: -14, opacity: 0 }}
          animate={{ scale: 1, x: 0, y: 0, opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: EASE_IN_OUT }}
          className="absolute inset-0 overflow-hidden rounded-3xl shadow-sm"
        >
          <SlideContent slide={current} />
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              aria-label="Open story link"
              className="absolute inset-0 z-[5]"
            />
          )}
        </motion.div>
      </AnimatePresence>
      {hasMultiple && <CountdownRing trigger={index} />}
    </div>
  );
}
