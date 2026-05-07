import { createElement } from "react";
import * as HugeIconsData from "@hugeicons/core-free-icons";

type HugeIconEntry = [string, Record<string, unknown>];

export function DynamicIcon({
  name,
  size = 12,
  color = "currentColor",
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const iconData = (HugeIconsData as Record<string, HugeIconEntry[]>)[name];
  if (!iconData) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      color={color}
      style={{ flexShrink: 0 }}
    >
      {iconData.map(([tag, attrs]) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { key, ...rest } = attrs;
        return createElement(tag, {
          key: String(key ?? Math.random()),
          ...rest,
        });
      })}
    </svg>
  );
}
