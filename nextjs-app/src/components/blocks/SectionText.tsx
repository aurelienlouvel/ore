"use client";

import { PortableText } from "@portabletext/react";
import type { SectionText as SectionTextType } from "@/sanity/queries";

export function SectionText({ section }: { section: SectionTextType }) {
  return (
    <div className="py-12">
      {section.heading && (
        <h2 className="mb-6">{section.heading}</h2>
      )}
      {section.body && (
        <div className="prose prose-zinc max-w-none dark:prose-invert">
          <PortableText value={section.body as Parameters<typeof PortableText>[0]["value"]} />
        </div>
      )}
    </div>
  );
}
