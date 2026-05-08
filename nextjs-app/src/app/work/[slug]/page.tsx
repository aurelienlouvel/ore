import { notFound } from "next/navigation";
import { client } from "@/sanity/client";
import {
  projectDetailQuery,
  allProjectSlugsQuery,
  type ProjectDetail,
} from "@/sanity/queries";
import { fileRefToUrl, isVideoRef } from "@/lib/sanity-utils";
import { formatMonth, calcDuration } from "@/lib/date-utils";
import { Tag } from "@/components/primitives/Tag";
import { Role } from "@/components/primitives/Role";
import { ProjectMediaBlock } from "@/components/blocks/ProjectMediaBlock";
import { MatesBlock } from "@/components/blocks/MatesBlock";
import { SectionRenderer } from "@/components/blocks/SectionRenderer";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CapIcon,
  UserMultipleIcon,
  Calendar02Icon,
  Clock04Icon,
} from "@hugeicons/core-free-icons";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs =
    await client.fetch<Array<{ slug: string }>>(allProjectSlugsQuery);
  return slugs.map((s) => ({ slug: s.slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await client.fetch<ProjectDetail | null>(projectDetailQuery, {
    slug,
  });

  if (!project) notFound();

  const mediaUrl = fileRefToUrl(project.thumbnailRef);
  const isVideo = isVideoRef(project.thumbnailRef);

  return (
    <main className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 sm:py-16">
      <div className="px-12 py-12">
        <h1 className="max-w-3xl mb-8">{project.title}</h1>

        <div className="flex flex-row items-center gap-6 px-1.5">
          {/* Organisation */}
          {project.organisation && (
            <div className="flex items-center gap-2">
              {project.organisation.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={project.organisation.logoUrl}
                  alt=""
                  className="h-5 w-5 rounded-sm object-contain"
                />
              )}
              <span className="text-sm font-medium text-zinc-600">
                {project.organisation.name}
              </span>
            </div>
          )}

          {/* Tags — colored */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <Tag
                  key={tag._id}
                  name={tag.name}
                  color={tag.color}
                  icon={tag.icon}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {mediaUrl && (
        <ProjectMediaBlock
          url={mediaUrl}
          isVideo={isVideo}
          title={project.title}
        />
      )}

      {/* Metadata sections below media */}
      <div className="px-12 py-12 flex flex-wrap gap-20">
        {/* Role */}
        {project.roles && project.roles.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-zinc-400 mb-3">
              <HugeiconsIcon icon={CapIcon} size={12} strokeWidth={2} />
              role
            </div>
            <div className="flex flex-wrap gap-1 max-w-[320]">
              {project.roles.map((role, i) => (
                <Role
                  key={role._id}
                  name={role.name}
                  icon={role.icon}
                  comma={i < project.roles!.length - 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* Mates */}
        {project.mates && project.mates.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-zinc-400 mb-3">
              <HugeiconsIcon
                icon={UserMultipleIcon}
                size={12}
                strokeWidth={2}
              />
              mates
            </div>
            <MatesBlock mates={project.mates} />
          </div>
        )}

        {/* Timeline */}
        {project.startDate && (
          <div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-zinc-400 mb-3">
              <HugeiconsIcon icon={Calendar02Icon} size={12} strokeWidth={2} />
              timeline
            </div>
            <p className="text-lg font-semibold text-zinc-700">
              {formatMonth(project.startDate)}
              {" → "}
              {project.endDate ? formatMonth(project.endDate) : "Present"}
            </p>
          </div>
        )}

        {/* Duration */}
        {project.startDate && (
          <div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-zinc-400 mb-3">
              <HugeiconsIcon icon={Clock04Icon} size={12} strokeWidth={2} />
              duration
            </div>
            <p className="text-lg font-semibold text-zinc-700">
              {calcDuration(project.startDate, project.endDate)}
            </p>
          </div>
        )}
      </div>

      {/* Content sections */}
      {project.sections && project.sections.length > 0 && (
        <div className="px-12 mt-4 divide-y divide-border">
          {project.sections.map((section) => (
            <SectionRenderer key={section._key} section={section} />
          ))}
        </div>
      )}
    </main>
  );
}
