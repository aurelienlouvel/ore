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

const sectionFields = `
  _type,
  _key,
  heading,
  body,
  "images": images[]{ _key, "url": image.asset->url, caption, alt },
  url,
  "fileUrl": file.asset->url,
  provider,
  embedCode
`;

export const projectDetailQuery = defineQuery(`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    "thumbnailRef": thumbnail.asset._ref,
    "organisation": organisation->{ name, "logoUrl": logo.asset->url },
    startDate,
    endDate,
    "tags": tags[]->{ _id, name, color, icon },
    "roles": roles[]->{ _id, name, color, icon },
    "mates": contributors[defined(person)] {
      _key,
      "person": person->{ _id, firstName, lastName, "avatarUrl": avatar.asset->url, linkedinUrl },
      "roles": roles[]->{ _id, name, color, icon }
    },
    redirectUrl,
    "sections": sections[] {
      ${sectionFields},
      "sections": sections[]{ ${sectionFields} }
    }
  }
`);

export type SectionText = {
  _type: "sectionText";
  _key: string;
  heading?: string | null;
  body?: unknown[] | null;
};

export type SectionImages = {
  _type: "sectionImages";
  _key: string;
  heading?: string | null;
  images?: Array<{
    _key: string;
    url: string | null;
    caption?: string | null;
    alt?: string | null;
  }> | null;
};

export type SectionVideo = {
  _type: "sectionVideo";
  _key: string;
  heading?: string | null;
  url?: string | null;
  fileUrl?: string | null;
};

export type SectionIntegration = {
  _type: "sectionIntegration";
  _key: string;
  heading?: string | null;
  provider?: string | null;
  url?: string | null;
  embedCode?: string | null;
};

export type SectionSubPage = {
  _type: "sectionSubPage";
  _key: string;
  heading?: string | null;
  sections?: Array<SectionText | SectionImages | SectionVideo | SectionIntegration> | null;
};

export type Section =
  | SectionText
  | SectionImages
  | SectionVideo
  | SectionIntegration
  | SectionSubPage;

export type ProjectDetail = {
  _id: string;
  title: string;
  slug: string;
  thumbnailRef: string | null;
  organisation: { name: string; logoUrl: string | null } | null;
  startDate: string | null;
  endDate: string | null;
  tags: Array<{ _id: string; name: string; color: string | null; icon: string | null }> | null;
  roles: Array<{ _id: string; name: string; color: string | null; icon: string | null }> | null;
  mates: Array<{
    _key: string;
    person: {
      _id: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
      linkedinUrl: string | null;
    };
    roles: Array<{ _id: string; name: string; color: string | null; icon: string | null }> | null;
  }> | null;
  redirectUrl: string | null;
  sections: Section[] | null;
};

export const allProjectSlugsQuery = defineQuery(`
  *[_type == "project"] { "slug": slug.current }
`);
