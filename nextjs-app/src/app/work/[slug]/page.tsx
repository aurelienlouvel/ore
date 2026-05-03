import { notFound } from "next/navigation";
import Image from "next/image";
import { client } from "@/sanity/client";
import {
  projectDetailQuery,
  allProjectSlugsQuery,
  type ProjectDetail,
} from "@/sanity/queries";
import { ProjectPageClient } from "./project-page-client";
import { fileRefToUrl, isVideoRef } from "@/lib/sanity-utils";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await client.fetch<Array<{ slug: string }>>(allProjectSlugsQuery);
  return slugs.map((s) => ({ slug: s.slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await client.fetch<ProjectDetail | null>(projectDetailQuery, { slug });

  if (!project) notFound();

  const mediaUrl = fileRefToUrl(project.thumbnailRef);
  const isVideo = isVideoRef(project.thumbnailRef);

  return (
    <>
      <ProjectPageClient
        title={project.title}
        redirectUrl={project.redirectUrl ?? null}
      />

      <main className="mx-auto max-w-4xl px-4 pb-32 pt-8 sm:px-6 lg:px-8">
        {mediaUrl && (
          <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl bg-muted">
            {isVideo ? (
              <video
                src={mediaUrl}
                className="h-full w-full object-cover"
                controls
                playsInline
              />
            ) : (
              <Image
                src={mediaUrl}
                alt={project.title}
                fill
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
                priority
              />
            )}
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            {project.title}
          </h1>

          {project.description && (
            <p className="mt-2 text-muted-foreground">{project.description}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {project.organisation && (
              <span className="font-medium text-foreground">
                {project.organisation.name}
              </span>
            )}
            {project.startDate && (
              <span>
                {project.startDate.slice(0, 7)}
                {project.endDate
                  ? ` – ${project.endDate.slice(0, 7)}`
                  : " – present"}
              </span>
            )}
          </div>

          {project.tags && project.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag._id}
                  className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* TODO: render content sections */}
      </main>
    </>
  );
}
