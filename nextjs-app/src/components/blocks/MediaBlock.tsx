import type { BlockMedia, MediaItem } from "@/sanity/queries";

function getVideoEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

function MediaItemComponent({ item, fill }: { item: MediaItem; fill?: boolean }) {
  if (item.mediaType === "video") {
    const embedUrl = item.videoUrl ? getVideoEmbedUrl(item.videoUrl) : null;
    return (
      <figure>
        {embedUrl ? (
          <div className="relative aspect-video rounded-2xl overflow-hidden">
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        ) : item.videoFileUrl ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={item.videoFileUrl} controls className="w-full rounded-2xl" />
        ) : null}
        {item.caption && (
          <figcaption className="mt-2 text-xs text-muted-foreground px-1">
            {item.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (!item.imageUrl) return null;
  return (
    <figure className={fill ? "h-full flex flex-col" : undefined}>
      <div className={`overflow-hidden rounded-2xl${fill ? " flex-1" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.imageUrl} alt={item.imageAlt ?? ""} className={`w-full object-cover${fill ? " h-full" : ""}`} />
      </div>
      {item.caption && (
        <figcaption className="mt-2 text-xs text-muted-foreground px-1">
          {item.caption}
        </figcaption>
      )}
    </figure>
  );
}

export function MediaBlock({ block }: { block: BlockMedia }) {
  const items = block.items ?? [];
  if (!items.length) return null;

  if (items.length === 3) {
    return (
      <div className="flex gap-4">
        <div className="flex-1">
          {items[0].imageUrl && (
            <img
              src={items[0].imageUrl}
              alt={items[0].imageAlt ?? ""}
              className="w-full rounded-2xl block"
            />
          )}
          {items[0].caption && (
            <p className="mt-2 text-xs text-muted-foreground px-1">{items[0].caption}</p>
          )}
        </div>
        <div className="flex-1 self-stretch flex flex-col gap-4">
          <div className="flex-1 min-h-0 overflow-hidden rounded-2xl">
            {items[1].imageUrl && (
              <img
                src={items[1].imageUrl}
                alt={items[1].imageAlt ?? ""}
                className="w-full h-full object-cover block"
              />
            )}
          </div>
          <div className="flex-1 min-h-0 overflow-hidden rounded-2xl">
            {items[2].imageUrl && (
              <img
                src={items[2].imageUrl}
                alt={items[2].imageAlt ?? ""}
                className="w-full h-full object-cover block"
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  const cols = items.length === 1 ? "grid-cols-1" : "grid-cols-2";
  return (
    <div className={`grid gap-4 ${cols}`}>
      {items.map((item) => (
        <MediaItemComponent key={item._key} item={item} />
      ))}
    </div>
  );
}
