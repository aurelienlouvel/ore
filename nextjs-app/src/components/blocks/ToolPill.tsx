import type { Profile } from "@/sanity/queries";
import { ToolIcon } from "@/components/blocks/ToolIcon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";

type ToolItem = NonNullable<Profile["tools"]>[number];

export function ToolPill({ tool }: { tool: ToolItem }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          tool.url ? (
            <a href={tool.url} target="_blank" rel="noreferrer" />
          ) : (
            <div />
          )
        }
      >
        <ToolIcon name={tool.name} logoUrl={tool.logoUrl} />
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={10}>
        {tool.name}
      </TooltipContent>
    </Tooltip>
  );
}
