import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import * as Icons from "@hugeicons/core-free-icons";

export function Icon({
  name,
  size = 12,
  strokeWidth = 2,
}: {
  name: string;
  size?: number;
  strokeWidth?: number;
}) {
  const icon = (Icons as Record<string, IconSvgElement>)[name];
  if (!icon) return null;
  return <HugeiconsIcon icon={icon} size={size} strokeWidth={strokeWidth} />;
}
