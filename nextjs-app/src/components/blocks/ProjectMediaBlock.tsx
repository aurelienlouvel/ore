import Image from "next/image";

export function ProjectMediaBlock({
  url,
  isVideo,
  title,
}: {
  url: string;
  isVideo: boolean;
  title: string;
}) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
      {isVideo ? (
        <video
          src={url}
          className="h-full w-full object-cover"
          controls
          playsInline
        />
      ) : (
        <Image
          src={url}
          alt={title}
          fill
          sizes="(max-width: 1024px) 100vw, 728px"
          className="object-cover"
          priority
        />
      )}
    </div>
  );
}
