import type { ContentSection } from "@/sanity/queries";
import { BlockRenderer } from "./BlockRenderer";

export function SectionRenderer({ section }: { section: ContentSection }) {
  return (
    <section className="py-12 w-full">
      <h2 className="mb-8">{section.title}</h2>
      {section.blocks && section.blocks.length > 0 && (
        <div className="flex flex-col gap-8">
          {section.blocks.map((block) => (
            <BlockRenderer key={block._key} block={block} />
          ))}
        </div>
      )}
    </section>
  );
}
