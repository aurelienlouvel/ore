import type { SectionIntegration as SectionIntegrationType } from "@/sanity/queries";

export function SectionIntegration({ section }: { section: SectionIntegrationType }) {
  if (!section.embedCode && !section.url) return null;

  return (
    <div className="py-12">
      {section.heading && <h2 className="mb-6">{section.heading}</h2>}
      <div className="overflow-hidden rounded-2xl">
        {section.embedCode ? (
          // Author-controlled content from Sanity studio
          <div dangerouslySetInnerHTML={{ __html: section.embedCode }} />
        ) : section.url ? (
          <iframe
            src={section.url}
            className="w-full h-[600px]"
            allowFullScreen
          />
        ) : null}
      </div>
    </div>
  );
}
