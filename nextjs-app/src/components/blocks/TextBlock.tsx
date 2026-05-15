"use client";

import { PortableText } from "@portabletext/react";
import type { BlockText } from "@/sanity/queries";

export function TextBlock({ block }: { block: BlockText }) {
  if (!block.body) return null;
  return (
    <div className="prose prose-zinc max-w-none dark:prose-invert text-block">
      <PortableText
        value={block.body as Parameters<typeof PortableText>[0]["value"]}
      />
    </div>
  );
}
