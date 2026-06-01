"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { fileRefToUrl, isVideoRef } from "@/lib/sanity-utils";
import type { ProjectListItem } from "@/sanity/queries";

interface ProjectCardProps {
  project: ProjectListItem;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const mediaUrl = fileRefToUrl(project.thumbnailRef);
  const isVideo = isVideoRef(project.thumbnailRef);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isVideo || !videoRef.current) return;
    const video = videoRef.current;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(video);
    return () => obs.disconnect();
  }, [isVideo]);

  return (
    <Link
      href={`/work/${project.slug}`}
      className="group block transition-transform duration-300 hover:scale-[0.97]"
    >
      <div className="relative overflow-hidden rounded-xl bg-muted">
        {mediaUrl && isVideo ? (
          <video
            ref={videoRef}
            src={mediaUrl}
            className="block h-auto w-full"
            muted
            loop
            playsInline
            preload="none"
          />
        ) : mediaUrl ? (
          <img
            src={mediaUrl}
            alt={project.title}
            className="block h-auto w-full"
            loading="lazy"
          />
        ) : (
          <div className="aspect-video bg-muted" />
        )}

        <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 overflow-hidden p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-lg border border-zinc-100 bg-white px-2.5 py-2 text-sm text-zinc-800">
            {project.title}
          </span>
          {project.organisation && (
            <span className="inline-flex min-w-0 items-center gap-1.5 overflow-hidden rounded-lg border border-zinc-100 bg-white px-2.5 py-2 text-sm text-zinc-800">
              {project.organisation.logoUrl && (
                <img
                  src={project.organisation.logoUrl}
                  alt=""
                  className="h-3.5 w-3.5 shrink-0 rounded-sm object-contain"
                />
              )}
              <span className="truncate">{project.organisation.name}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
