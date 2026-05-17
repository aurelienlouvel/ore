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
      return <div className="px-12"><TextBlock block={block} /></div>;
    case "blockMedia":
      return <MediaBlock block={block} />;
    case "blockCard":
      return <div className="px-12"><CardBlock block={block} /></div>;
    case "blockQuote":
      return <div className="px-12"><QuoteBlock block={block} /></div>;
    case "blockCallout":
      return <div className="px-12"><CalloutBlock block={block} /></div>;
    case "blockIntegration":
      return <IntegrationBlock block={block} />;
    default:
      return null;
  }
}
