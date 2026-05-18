"use client"; // required for PortableText

import { PortableText } from "@portabletext/react";
import type { BlockCard, CardItem } from "@/sanity/queries";
import { Icon } from "@/components/primitives/Icon";

const ROTATIONS: Record<number, number[]> = {
  1: [0],
  2: [-1.5, 1.5],
  3: [-2.5, 0.5, 2],
};

const descComponents = {
  block: {
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="leading-normal">{children}</p>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => <em>{children}</em>,
  },
};

function CardItemComponent({ item }: { item: CardItem }) {
  const c = item.color ?? "stone";

  return (
    <div
      className={`bg-${c}-100 border-2 border-${c}-200 rounded-3xl gap-2 p-8 flex flex-col w-fit max-w-120`}
    >
      {item.icon && (
        <div className={`mb-4 text-${c}-600 opacity-60`}>
          <Icon name={item.icon} size={64} strokeWidth={1.6} />
        </div>
      )}

      {(item.value || item.unit) && (
        <div className={`flex items-baseline gap-1 text-${c}-600`}>
          {item.value && (
            <span className="text-3xl font-bold tracking-tight">
              {item.value}
            </span>
          )}
          {item.unit && (
            <span className="text-sm font-medium opacity-60">{item.unit}</span>
          )}
        </div>
      )}

      {item.title && (
        <p className={`text-xl font-semibold text-${c}-600 opacity-60`}>
          {item.title}
        </p>
      )}

      {item.description && (
        <div className={`text-base text-${c}-800 space-y-2`}>
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
  if (!items.length) return null;

  const n = Math.min(items.length, 3);
  const rotations = ROTATIONS[n] ?? ROTATIONS[3];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex justify-center items-end gap-8">
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
