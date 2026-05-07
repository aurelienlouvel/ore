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
    "organisation": organisation->{ name, "logoUrl": logo.asset->url },
    startDate,
    endDate,
    "tags": tags[]->{ _id, name, color, icon },
    "roles": roles[]->{ _id, name, color, icon },
    "mates": contributors[]->{
      _id,
      firstName,
      lastName,
      "avatarUrl": avatar.asset->url,
      "roles": roles[]->{ _id, name }
    },
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
  organisation: { name: string; logoUrl: string | null } | null;
  startDate: string | null;
  endDate: string | null;
  tags: Array<{ _id: string; name: string; color: string | null; icon: string | null }> | null;
  roles: Array<{ _id: string; name: string; color: string | null; icon: string | null }> | null;
  mates: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    roles: Array<{ _id: string; name: string }> | null;
  }> | null;
  redirectUrl: string | null;
  sections: unknown[] | null;
};

export const allProjectSlugsQuery = defineQuery(`
  *[_type == "project"] { "slug": slug.current }
`);
