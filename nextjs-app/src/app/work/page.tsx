import { ViewTransition } from "react";
import { client } from "@/sanity/client";
import { projectsListQuery, type ProjectListItem } from "@/sanity/queries";
import { WorkGrid } from "@/components/blocks/WorkGrid";
import { WorkScrollRestore } from "@/components/WorkScrollRestore";

export const revalidate = 60;

export default async function WorkPage() {
  const projects = await client.fetch<ProjectListItem[]>(projectsListQuery);
  return (
    <>
      <WorkScrollRestore />
      <ViewTransition
        exit={{ "nav-forward": "view-transition-exit-fwd", default: "none" }}
        enter={{ "nav-back": "view-transition-enter-back", default: "none" }}
        default="none"
      >
        <WorkGrid projects={projects} />
      </ViewTransition>
    </>
  );
}
