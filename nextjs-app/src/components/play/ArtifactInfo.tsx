"use client";

import { useEffect, useRef, useState } from "react";
import type { ArtifactCanvasItem } from "@/sanity/queries";
import { Tag } from "@/components/primitives/Tag";
import { formatMonth } from "@/lib/date-utils";

// ─── Scramble text ────────────────────────────────────────────────────────────
//  Grows the displayed string from "" to the full text over `durationMs`,
//  starting only after `delayMs` (so the text starts revealing when the panel
//  becomes visible, not when the component silently mounts).
//  Settled characters show their real value; the leading character cycles
//  through random glyphs until it settles — mirrors motion.dev scramble-text.

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function useScramble(text: string, durationMs = 1200, delayMs = 0): string {
  const [display, setDisplay] = useState("");
  const rafRef   = useRef<number | null>(null);
  const startRef = useRef<number | null>(null); // null = not started yet
  const mountRef = useRef<number | null>(null); // time of first rAF tick

  useEffect(() => {
    if (!text) { setDisplay(""); return; }

    let cancelled = false;
    const N = text.length;

    const tick = (now: number) => {
      if (cancelled) return;

      // Track mount time so we can honour the initial delay
      if (mountRef.current === null) mountRef.current = now;

      // Wait out the delay before starting
      if (startRef.current === null) {
        if (now - mountRef.current < delayMs) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        startRef.current = now;
      }

      const t        = Math.min(1, (now - startRef.current) / durationMs);
      const settled  = Math.floor(t * N);
      const showing  = Math.min(N, settled + (t < 1 ? 1 : 0));

      let result = "";
      for (let i = 0; i < showing; i++) {
        if (i < settled) {
          result += text[i];
        } else {
          const ch = text[i];
          result += ch === " " || ch === "→" || ch === "·"
            ? ch
            : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      }

      setDisplay(result);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(text);
      }
    };

    mountRef.current = null;
    startRef.current = null;
    setDisplay("");
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [text, durationMs, delayMs]);

  return display;
}

// ─── ArtifactInfo ─────────────────────────────────────────────────────────────
export function ArtifactInfo({
  artifact,
  scrambleDelayMs = 0,
}: {
  artifact:         ArtifactCanvasItem;
  scrambleDelayMs?: number;
}) {
  const dateLabel = artifact.startDate
    ? `${formatMonth(artifact.startDate)}${artifact.endDate ? ` → ${formatMonth(artifact.endDate)}` : " → now"}`
    : null;

  const title       = useScramble(artifact.title,             1200, scrambleDelayMs);
  const description = useScramble(artifact.description ?? "", 1200, scrambleDelayMs);

  return (
    <div className="w-64 flex flex-col gap-2">
      <h3 className="leading-snug font-mono">{title || " "}</h3>

      {dateLabel && (
        <p className="text-md text-stone-400 font-medium">{dateLabel}</p>
      )}

      {artifact.description && (
        <p className="text-base text-stone-500 leading-relaxed line-clamp-5 font-mono">
          {description || " "}
        </p>
      )}

      {artifact.tags && artifact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {artifact.tags.map((tag) => (
            <Tag key={tag._id} name={tag.name} color={tag.color} icon={tag.icon} />
          ))}
        </div>
      )}
    </div>
  );
}
