"use client";

import { useState } from "react";
import { PortableText } from "@portabletext/react";
import type { BlockCard, CardItem } from "@/sanity/queries";
import { Icon } from "@/components/primitives/Icon";

// ─── Rotation presets per card count (subtle) ─────────────────────────────────
const ROTATIONS: Record<number, number[]> = {
  1: [0],
  2: [-1.5, 1.5],
  3: [-2.5, 0.5, 2],
};

// ─── Color → CSS variables (avoids Tailwind purge) ───────────────────────────
function cardColors(color: string | null) {
  const c = color ?? "stone";
  return {
    bg: `var(--color-${c}-100)`,
    border: `var(--color-${c}-200)`,
    icon: `var(--color-${c}-400)`,
    title: `var(--color-${c}-900)`,
    desc: `var(--color-${c}-800)`,
  };
}

// ─── Description: portable text with bold/italic only ─────────────────────────
const descComponents = {
  block: {
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="leading-snug">{children}</p>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em>{children}</em>
    ),
  },
};

// ─── Individual card ──────────────────────────────────────────────────────────
function CardItemComponent({ item }: { item: CardItem }) {
  const col = cardColors(item.color);

  return (
    <div
      style={{ backgroundColor: col.bg, borderColor: col.border }}
      className="border rounded-2xl p-6 flex flex-col gap-2 w-fit min-w-44 max-w-64"
    >
      {item.icon && (
        <div className="mb-1" style={{ color: col.icon }}>
          <Icon name={item.icon} size={56} strokeWidth={1.6} />
        </div>
      )}

      {(item.value || item.unit) && (
        <div className="flex items-baseline gap-1" style={{ color: col.title }}>
          {item.value && (
            <span className="text-3xl font-bold tracking-tight">{item.value}</span>
          )}
          {item.unit && (
            <span className="text-sm font-medium opacity-60">{item.unit}</span>
          )}
        </div>
      )}

      {item.title && (
        <p className="text-xl font-semibold" style={{ color: col.title }}>
          {item.title}
        </p>
      )}

      {item.description && (
        <div className="text-base" style={{ color: col.desc }}>
          <PortableText
            value={item.description as Parameters<typeof PortableText>[0]["value"]}
            components={descComponents}
          />
        </div>
      )}
    </div>
  );
}

// ─── Wrapper with rotation + hover lift ───────────────────────────────────────
function CardWrapper({
  item,
  rotation,
  zBase,
  overlap,
}: {
  item: CardItem;
  rotation: number;
  zBase: number;
  overlap: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        transform: `rotate(${hovered ? 0 : rotation}deg) scale(${hovered ? 1.04 : 1})`,
        zIndex: hovered ? 100 : zBase,
        marginLeft: overlap ? "-1.5rem" : undefined,
        transition: "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      className="relative cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CardItemComponent item={item} />
    </div>
  );
}

// ─── Block ────────────────────────────────────────────────────────────────────
export function CardBlock({ block }: { block: BlockCard }) {
  const items = block.items ?? [];
  if (!items.length) return null;

  const n = Math.min(items.length, 3);
  const rotations = ROTATIONS[n] ?? ROTATIONS[3];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex justify-center items-end">
        {items.map((item, i) => (
          <CardWrapper
            key={item._key}
            item={item}
            rotation={rotations[i % rotations.length]}
            zBase={i + 1}
            overlap={i > 0}
          />
        ))}
      </div>

      {block.caption && (
        <p className="text-sm text-stone-600 text-center">{block.caption}</p>
      )}
    </div>
  );
}
