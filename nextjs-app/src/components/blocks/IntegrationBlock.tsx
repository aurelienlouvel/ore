import type { BlockIntegration } from "@/sanity/queries";

function toEmbedUrl(provider: string, url: string): string | null {
  switch (provider) {
    case "figma": {
      const isProto = url.includes("/proto/");
      const params = new URLSearchParams({ embed_host: "share", url });
      params.set("hide-ui", "1");
      if (isProto) params.set("scaling", "scale-down-width");
      return `https://www.figma.com/embed?${params.toString()}`;
    }
    case "youtube": {
      const m = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
      );
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
  const isFigma = provider === "figma";
  const embedUrl =
    provider !== "other" && provider !== "lottie"
      ? toEmbedUrl(provider, block.url)
      : null;

  return (
    <figure>
      {embedUrl ? (
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-border">
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full"
            // For Figma: extend iframe 48px below the container so the
            // bottom attribution bar gets clipped by overflow-hidden.
            // The top bar is hidden via hide-ui=1 in the embed URL.
            style={isFigma ? { height: "calc(100% + 48px)" } : { height: "100%" }}
            allow="fullscreen"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : (
        <a
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 underline underline-offset-2 hover:text-stone-900"
        >
          {provider !== "other" && (
            <span className="capitalize font-medium text-stone-700">
              {provider}
            </span>
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
