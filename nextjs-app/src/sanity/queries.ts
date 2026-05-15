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

const contentBlockFields = `
  _type,
  _key,
  body,
  "items": items[] {
    _key,
    mediaType,
    "imageUrl": image.asset->url,
    "imageAlt": image.alt,
    "videoFileUrl": videoFile.asset->url,
    videoUrl,
    caption,
    icon,
    value,
    unit,
    title,
    description,
    color
  },
  quote,
  author,
  authorRole,
  "avatarUrl": avatar.asset->url,
  variant,
  title,
  provider,
  url,
  caption
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
    "content": content[] {
      _key,
      title,
      "blocks": blocks[] {
        ${contentBlockFields}
      }
    }
  }
`);

export type BlockText = {
  _type: "blockText";
  _key: string;
  body: unknown[] | null;
};

export type MediaItem = {
  _key: string;
  mediaType: "image" | "video" | null;
  imageUrl: string | null;
  imageAlt: string | null;
  videoFileUrl: string | null;
  videoUrl: string | null;
  caption: string | null;
};

export type BlockMedia = {
  _type: "blockMedia";
  _key: string;
  items: MediaItem[] | null;
};

export type CardItem = {
  _key: string;
  icon: string | null;
  value: string | null;
  unit: string | null;
  title: string | null;
  description: string | null;
  color: string | null;
};

export type BlockCard = {
  _type: "blockCard";
  _key: string;
  items: CardItem[] | null;
};

export type BlockQuote = {
  _type: "blockQuote";
  _key: string;
  quote: string;
  author: string | null;
  authorRole: string | null;
  avatarUrl: string | null;
};

export type BlockCallout = {
  _type: "blockCallout";
  _key: string;
  variant: "insight" | "warning" | "tip" | "result" | null;
  title: string | null;
  body: string | null;
};

export type BlockIntegration = {
  _type: "blockIntegration";
  _key: string;
  provider: "figma" | "youtube" | "vimeo" | "lottie" | "codesandbox" | "other" | null;
  url: string | null;
  caption: string | null;
};

export type Block =
  | BlockText
  | BlockMedia
  | BlockCard
  | BlockQuote
  | BlockCallout
  | BlockIntegration;

export type ContentSection = {
  _key: string;
  title: string;
  blocks: Block[] | null;
};

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
  content: ContentSection[] | null;
};

export const allProjectSlugsQuery = defineQuery(`
  *[_type == "project"] { "slug": slug.current }
`);
