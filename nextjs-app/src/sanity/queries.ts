import { defineQuery } from "next-sanity";

export const projectsListQuery = defineQuery(`
  *[_type == "project"] | order(orderRank) {
    _id,
    title,
    "slug": slug.current,
    "thumbnailRef": thumbnail.asset._ref,
    "tags": tags[]->{ _id, name, color, icon },
    "organisation": organisation->{ name, "logoUrl": logo.asset->url }
  }
`);

export type ProjectListItem = {
  _id: string;
  title: string;
  slug: string;
  thumbnailRef: string | null;
  tags: Array<{
    _id: string;
    name: string;
    color: string | null;
    icon: string | null;
  }> | null;
  organisation: { name: string; logoUrl: string | null } | null;
};

export const projectDetailQuery = defineQuery(`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    "thumbnailRef": thumbnail.asset._ref,
    description,
    "organisation": organisation->{ name },
    startDate,
    endDate,
    "tags": tags[]->{ _id, name, color, icon },
    "roles": roles[]->{ _id, name, color, icon },
    redirectUrl,
    sections
  }
`);

export type ProjectDetail = {
  _id: string;
  title: string;
  slug: string;
  thumbnailRef: string | null;
  description: string | null;
  organisation: { name: string } | null;
  startDate: string | null;
  endDate: string | null;
  tags: Array<{ _id: string; name: string; color: string | null; icon: string | null }> | null;
  roles: Array<{ _id: string; name: string; color: string | null; icon: string | null }> | null;
  redirectUrl: string | null;
  sections: unknown[] | null;
};

export const allProjectSlugsQuery = defineQuery(`
  *[_type == "project"] { "slug": slug.current }
`);
