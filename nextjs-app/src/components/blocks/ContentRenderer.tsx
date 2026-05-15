import type { ContentSection } from "@/sanity/queries";
import { SectionRenderer } from "./SectionRenderer";

export function ContentRenderer({ content }: { content: ContentSection[] | null }) {
  if (!content?.length) return null;
  return (
    <div>
      {content.map((section) => (
        <SectionRenderer key={section._key} section={section} />
      ))}
    </div>
  );
}
