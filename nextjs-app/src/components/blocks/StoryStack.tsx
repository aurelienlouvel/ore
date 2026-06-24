"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE_IN_OUT } from "@/lib/easings";
import { cn } from "@/lib/utils";
import { SlideContent, type StorySlide } from "./StoryCard";

export type { StorySlide };

const STORY_DURATION = 4; // seconds

const POS_FRONT = { x: 0,   y: 0,   scale: 1,    rotate: 0,  opacity: 1, zIndex: 20 };
const POS_BACK  = { x: 30,  y: -12, scale: 0.92, rotate: 3,  opacity: 1, zIndex: 10 };
const POS_EXIT  = { x: -20, y: 4,   scale: 0.88, rotate: 0,  opacity: 0, zIndex: 5  };
const POS_ENTER = { x: 56,  y: -12, scale: 0.85, rotate: 4,  opacity: 0, zIndex: 10 };

function CountdownRing({ active }: { active: boolean }) {
  const r = 9;
  const circumference = 2 * Math.PI * r;
  return (
    <div className="pointer-events-none absolute right-4 top-4 z-30 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
      <svg width="22" height="22" viewBox="0 0 24 24" className="-rotate-90">
        <circle
          cx="12" cy="12" r={r}
          fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5"
        />
        <motion.circle
          cx="12" cy="12" r={r}
          fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: active ? circumference : 0 }}
          transition={{ duration: active ? STORY_DURATION : 0, ease: "linear" }}
        />
      </svg>
    </div>
  );
}

export function StoryStack({ slides }: { slides: StorySlide[] }) {
  const [step, setStep] = useState(0);
  const total = slides.length;
  const hasMultiple = total > 1;
  const advance = useCallback(() => setStep((s) => s + 1), []);

  useEffect(() => {
    if (!hasMultiple) return;
    const timer = setTimeout(advance, STORY_DURATION * 1000);
    return () => clearTimeout(timer);
  }, [step, hasMultiple, advance]);

  if (total === 0) return null;

  if (!hasMultiple) {
    return (
      <div className="relative aspect-[6/7] w-full">
        <div className="absolute inset-0 overflow-hidden rounded-3xl shadow-md">
          <SlideContent slide={slides[0]} />
        </div>
      </div>
    );
  }

  const visible = [step + 1, step];

  return (
    <div className="relative aspect-[6/7] w-full">
      <AnimatePresence initial={false}>
        {visible.map((s) => {
          const isFront = s === step;
          return (
            <motion.div
              key={s}
              role={isFront ? "button" : undefined}
              tabIndex={isFront ? 0 : -1}
              aria-label={isFront ? "Next story" : undefined}
              onClick={isFront ? advance : undefined}
              onKeyDown={
                isFront
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        advance();
                      }
                    }
                  : undefined
              }
              initial={isFront ? false : POS_ENTER}
              animate={isFront ? POS_FRONT : POS_BACK}
              exit={POS_EXIT}
              transition={{ duration: 0.55, ease: EASE_IN_OUT }}
              className={cn(
                "absolute inset-0 overflow-hidden rounded-3xl shadow-md outline-none",
                isFront && "cursor-pointer",
              )}
            >
              <SlideContent slide={slides[s % total]} />
              <CountdownRing active={isFront} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
