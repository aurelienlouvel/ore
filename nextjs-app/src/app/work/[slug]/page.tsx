import { notFound } from "next/navigation";
import { client } from "@/sanity/client";
import {
  projectDetailQuery,
  allProjectSlugsQuery,
  type ProjectDetail,
} from "@/sanity/queries";
import { fileRefToUrl, isVideoRef } from "@/lib/sanity-utils";
import { Tag } from "@/components/Tag";
import { ProjectMeta } from "@/components/ProjectMeta";
import { ProjectMediaBlock } from "@/components/ProjectMediaBlock";

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
    <main className="mx-auto max-w-5xl px-4 pb-32 pt-10 sm:px-6 sm:pt-12">
      <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-14">
        {/* ── Main column ── */}
        <div>
          {project.tags && project.tags.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-1.5">
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

          <h1 className="text-3xl font-semibold tracking-tight">
            {project.title}
          </h1>

          {project.description && (
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          )}

          {(project.organisation ||
            project.startDate ||
            project.roles?.length ||
            project.mates?.length) && (
            <div className="mt-8 border-t pt-6 lg:hidden">
              <ProjectMeta project={project} />
            </div>
          )}

          {mediaUrl && (
            <ProjectMediaBlock
              url={mediaUrl}
              isVideo={isVideo}
              title={project.title}
            />
          )}

          <div className="mt-12">{/* TODO: render sections */}</div>
        </div>

        {/* ── Sticky sidebar ── */}
        <aside className="hidden lg:block">
          <div className="sticky top-10">
            <ProjectMeta project={project} />
          </div>
        </aside>
      </div>
    </main>
  );
}
