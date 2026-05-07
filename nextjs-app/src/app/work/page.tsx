import { client } from "@/sanity/client";
import { projectsListQuery, type ProjectListItem } from "@/sanity/queries";
import { ProjectCard } from "@/components/ProjectCard";

export const revalidate = 60;

function toColumns<T>(items: T[], n: number): T[][] {
  return Array.from({ length: n }, (_, col) =>
    items.filter((_, i) => i % n === col),
  );
}

export default async function WorkPage() {
  const projects = await client.fetch<ProjectListItem[]>(projectsListQuery);

  return (
    <main className="p-4">
      {/* Mobile — 1 col */}
      <div className="flex flex-col gap-4 md:hidden">
        {projects.map((p) => (
          <ProjectCard key={p._id} project={p} />
        ))}
      </div>

      {/* Tablet — 2 cols */}
      <div className="hidden gap-4 md:flex lg:hidden">
        {toColumns(projects, 2).map((col, i) => (
          <div key={i} className="flex flex-1 flex-col gap-4">
            {col.map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
        ))}
      </div>

      {/* Desktop — 3 cols */}
      <div className="hidden gap-4 lg:flex">
        {toColumns(projects, 3).map((col, i) => (
          <div key={i} className="flex flex-1 flex-col gap-4">
            {col.map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
