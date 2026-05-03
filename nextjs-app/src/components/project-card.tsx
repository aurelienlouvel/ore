import Link from "next/link";
import Image from "next/image";
import { fileRefToUrl, isVideoRef } from "@/lib/sanity-utils";
import type { ProjectListItem } from "@/sanity/queries";

interface ProjectCardProps {
  project: ProjectListItem;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const mediaUrl = fileRefToUrl(project.thumbnailRef);
  const isVideo = isVideoRef(project.thumbnailRef);

  return (
    <Link
      href={`/work/${project.slug}`}
      className="group relative block aspect-[4/3] overflow-hidden rounded-xl bg-muted"
    >
      {mediaUrl && isVideo ? (
        <video
          src={mediaUrl}
          className="h-full w-full object-cover"
          muted
          loop
          playsInline
          autoPlay
        />
      ) : mediaUrl ? (
        <Image
          src={mediaUrl}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="h-full w-full bg-muted" />
      )}

      <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
        <div className="flex flex-col gap-2 bg-gradient-to-t from-black/80 to-transparent p-4 pt-8">
          <h2 className="text-sm font-semibold text-white">{project.title}</h2>
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.tags.map((tag) => (
                <span
                  key={tag._id}
                  className="rounded-full bg-white/20 px-2 py-0.5 text-xs text-white backdrop-blur-sm"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
