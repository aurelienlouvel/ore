import type { SectionImages as SectionImagesType } from "@/sanity/queries";

export function SectionImages({ section }: { section: SectionImagesType }) {
  if (!section.images?.length) return null;

  const isSingle = section.images.length === 1;

  return (
    <div className="py-12">
      {section.heading && <h2 className="mb-6">{section.heading}</h2>}
      <div className={`grid gap-4 ${isSingle ? "grid-cols-1" : "grid-cols-2"}`}>
        {section.images.map((item) =>
          item.url ? (
            <figure key={item._key} className="overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.alt ?? ""}
                className="w-full object-cover"
              />
              {item.caption && (
                <figcaption className="mt-2 text-xs text-muted-foreground px-1">
                  {item.caption}
                </figcaption>
              )}
            </figure>
          ) : null
        )}
      </div>
    </div>
  );
}
