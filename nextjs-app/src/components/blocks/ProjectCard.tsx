"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fileRefToUrl, isVideoRef } from "@/lib/sanity-utils";
import { thumbnailRatio } from "@/lib/thumbnail-ratios";
import type { ProjectListItem } from "@/sanity/queries";
import { SCROLL_KEY } from "@/components/WorkScrollRestore";

interface ProjectCardProps {
  project: ProjectListItem;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const mediaUrl = fileRefToUrl(project.thumbnailRef);
  const isVideo = isVideoRef(project.thumbnailRef);
  const ratio = thumbnailRatio(project.thumbnailRef);
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
      transitionTypes={['nav-forward']}
      onClick={() => sessionStorage.setItem(SCROLL_KEY, String(window.scrollY))}
    >
      {/* Ratio réservé (bg-muted gris) avant chargement → zéro layout shift,
          scroll/animations robustes. Le média remplit la boîte (object-cover ;
          ratio = ratio natif mesuré, donc aucun crop). */}
      <div
        className="relative overflow-hidden rounded-xl bg-muted"
        style={{ aspectRatio: ratio }}
      >
        {mediaUrl && isVideo ? (
          <video
            ref={videoRef}
            src={mediaUrl}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            loop
            playsInline
            preload="none"
          />
        ) : mediaUrl ? (
          <Image
            src={mediaUrl}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        ) : null}

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
