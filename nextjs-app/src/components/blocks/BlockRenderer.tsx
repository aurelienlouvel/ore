import type { Block } from "@/sanity/queries";
import { TextBlock } from "./TextBlock";
import { MediaBlock } from "./MediaBlock";
import { CardBlock } from "./CardBlock";
import { QuoteBlock } from "./QuoteBlock";
import { CalloutBlock } from "./CalloutBlock";
import { IntegrationBlock } from "./IntegrationBlock";

export function BlockRenderer({ block }: { block: Block }) {
  switch (block._type) {
    case "blockText":
      return <TextBlock block={block} />;
    case "blockMedia":
      return <MediaBlock block={block} />;
    case "blockCard":
      return <CardBlock block={block} />;
    case "blockQuote":
      return <QuoteBlock block={block} />;
    case "blockCallout":
      return <CalloutBlock block={block} />;
    case "blockIntegration":
      return <IntegrationBlock block={block} />;
    default:
      return null;
  }
}
