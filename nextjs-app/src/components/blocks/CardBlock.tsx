"use client"; // required for PortableText

import { useRef, useLayoutEffect } from "react";
import { PortableText } from "@portabletext/react";
import type { BlockCard, CardItem } from "@/sanity/queries";
import { Icon } from "@/components/primitives/Icon";

const ROTATIONS: Record<number, number[]> = {
  1: [0],
  2: [-1, 1],
  3: [-1.5, 0, 1.5],
};

const descComponents = {
  block: {
    // Chaque bloc = une ligne — Enter dans Sanity = saut de ligne visuel
    normal: ({ children }: { children?: React.ReactNode }) => (
      <span className="block leading-[1.4] font-[580]">{children}</span>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-[680]">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="font-[480]">{children}</em>
    ),
  },
};

function CardItemComponent({ item }: { item: CardItem }) {
  const c = item.color ?? "stone";

  return (
    <div
      className={`
        w-fit
        bg-gradient-to-b from-${c}-50 to-${c}-100
        border border-${c}-200
        rounded-3xl p-8
        flex flex-col gap-2
      `}
      style={{
        boxShadow:
          "inset 0 0 0 4px rgba(255,255,255,0.5), 0 2px 6px rgba(80,70,60,0.07), 0 6px 20px rgba(80,70,60,0.05)",
        isolation: "isolate",
      }}
    >
      {item.icon && (
        <div className={`mb-2 text-${c}-600 mix-blend-multiply opacity-30`}>
          <Icon name={item.icon} size={48} strokeWidth={1.6} />
        </div>
      )}

      {(item.value || item.unit) && (
        <div
          className={`flex items-baseline gap-2 text-${c}-600 mix-blend-multiply`}
        >
          {item.value && (
            <span className="text-4xl font-bold tracking-tight opacity-80">
              {item.value}
            </span>
          )}
          {item.unit && (
            <span className="text-md font-medium opacity-60">{item.unit}</span>
          )}
        </div>
      )}

      {item.title && (
        <p
          className={`text-2xl font-semibold text-${c}-600 mix-blend-multiply opacity-80 whitespace-nowrap`}
        >
          {item.title.split("\n").map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </p>
      )}

      {item.description && (
        <div
          className={`text-md font-[200] text-${c}-700 mix-blend-multiply opacity-60 whitespace-nowrap`}
        >
          <PortableText
            value={
              item.description as Parameters<typeof PortableText>[0]["value"]
            }
            components={descComponents}
          />
        </div>
      )}
    </div>
  );
}

export function CardBlock({ block }: { block: BlockCard }) {
  const items = block.items ?? [];
  const n = Math.min(items.length, 3);
  const rotations = ROTATIONS[n] ?? ROTATIONS[3];
  const rowRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row || n <= 1) return;

    const update = () => {
      const wrappers = Array.from(row.children) as HTMLElement[];
      // Reset margins pour mesurer les largeurs naturelles
      wrappers.forEach((w, i) => { w.style.marginLeft = i === 0 ? "0" : "0"; });
      const totalCards = wrappers.reduce((sum, w) => sum + w.offsetWidth, 0);
      const available = row.offsetWidth;
      const gap = Math.min(24, (available - totalCards) / (n - 1));
      wrappers.forEach((w, i) => { if (i > 0) w.style.marginLeft = `${gap}px`; });
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [n]);

  if (!items.length) return null;

  return (
    <div className="flex flex-col gap-6">
      <div ref={rowRef} className="flex items-center justify-start w-full">
        {items.map((item, i) => (
          <div
            key={item._key}
            style={{
              transform: `rotate(${rotations[i % rotations.length]}deg)`,
              zIndex: i + 1,
            }}
            className="relative"
          >
            <CardItemComponent item={item} />
          </div>
        ))}
      </div>

      {block.caption && (
        <p className="text-sm text-stone-600 text-center">{block.caption}</p>
      )}
    </div>
  );
}
