import type { BlockIntegration } from "@/sanity/queries";

function toEmbedUrl(provider: string, url: string): string | null {
  switch (provider) {
    case "figma":
      return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`;
    case "youtube": {
      const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      return m ? `https://www.youtube.com/embed/${m[1]}` : null;
    }
    case "vimeo": {
      const m = url.match(/vimeo\.com\/(\d+)/);
      return m ? `https://player.vimeo.com/video/${m[1]}` : null;
    }
    case "codesandbox":
      return url.replace("/s/", "/embed/");
    default:
      return null;
  }
}

export function IntegrationBlock({ block }: { block: BlockIntegration }) {
  if (!block.url) return null;

  const provider = block.provider ?? "other";
  const embedUrl = provider !== "other" && provider !== "lottie"
    ? toEmbedUrl(provider, block.url)
    : null;

  return (
    <figure>
      {embedUrl ? (
        <div className="relative aspect-video rounded-2xl overflow-hidden border border-border">
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : (
        <a
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-900"
        >
          {provider !== "other" && (
            <span className="capitalize font-medium text-zinc-700">{provider}</span>
          )}
          <span className="truncate max-w-[400px]">{block.url}</span>
        </a>
      )}
      {block.caption && (
        <figcaption className="mt-2 text-xs text-muted-foreground px-1">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}
