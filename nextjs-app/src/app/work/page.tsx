import { client } from "@/sanity/client";
import { projectsListQuery, type ProjectListItem } from "@/sanity/queries";
import { ProjectCard } from "@/components/project-card";

export const revalidate = 60;

export default async function WorkPage() {
  const projects = await client.fetch<ProjectListItem[]>(projectsListQuery);

  return (
    <main className="px-2 pt-2 pb-32 sm:px-3 md:px-4">
      <div className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-3 md:gap-4">
        {projects.map((project) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>
    </main>
  );
}
