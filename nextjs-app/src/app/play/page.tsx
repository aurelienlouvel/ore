import { client } from "@/sanity/client";
import { artifactsCanvasQuery, type ArtifactCanvasItem } from "@/sanity/queries";
import { InfiniteCanvas } from "@/components/play/InfiniteCanvas";

export const revalidate = 60;

export default async function PlayPage() {
  const artifacts = await client.fetch<ArtifactCanvasItem[]>(artifactsCanvasQuery);
  return <InfiniteCanvas artifacts={artifacts} />;
}
