import { client } from "@/sanity/client";
import { projectsListQuery, type ProjectListItem } from "@/sanity/queries";
import { ProjectCard } from "@/components/project-card";

export const revalidate = 60;

export default async function WorkPage() {
  const projects = await client.fetch<ProjectListItem[]>(projectsListQuery);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-32 pt-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>
    </main>
  );
}
