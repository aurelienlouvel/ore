import type { SectionVideo as SectionVideoType } from "@/sanity/queries";

export function SectionVideo({ section }: { section: SectionVideoType }) {
  const src = section.fileUrl ?? section.url;
  if (!src) return null;

  const isEmbed =
    src.includes("youtube.com") ||
    src.includes("youtu.be") ||
    src.includes("vimeo.com") ||
    src.includes("loom.com");

  return (
    <div className="py-12">
      {section.heading && <h2 className="mb-6">{section.heading}</h2>}
      <div className="overflow-hidden rounded-2xl aspect-video">
        {isEmbed ? (
          <iframe
            src={toEmbedUrl(src)}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen"
          />
        ) : (
          <video src={src} controls className="w-full h-full object-cover" />
        )}
      </div>
    </div>
  );
}

function toEmbedUrl(url: string): string {
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes("youtube.com/watch")) {
    const id = new URL(url).searchParams.get("v");
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes("vimeo.com/")) {
    const id = url.split("vimeo.com/")[1]?.split("?")[0];
    return `https://player.vimeo.com/video/${id}`;
  }
  return url;
}
