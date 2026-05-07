import { Badge } from "@/components/ui/Badge";
import { DynamicIcon } from "./DynamicIcon";

export function Tag({
  name,
  color,
  icon,
}: {
  name: string;
  color: string | null;
  icon: string | null;
}) {
  return (
    <Badge className={`h-auto border-0 px-2.5 font-medium bg-${color}-100`}>
      {icon && <DynamicIcon name={icon} size={11} color={`${color}-950`} />}
      {name}
    </Badge>
  );
}
