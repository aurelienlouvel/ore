import { HugeiconsIcon } from "@hugeicons/react";
import { Image02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

export function ToolIcon({
  logoUrl,
  name,
  className,
}: {
  logoUrl: string | null;
  name: string;
  className?: string;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={name}
        className={cn("h-10 w-10 object-contain", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-stone-200 text-stone-300",
        className,
      )}
    >
      <HugeiconsIcon icon={Image02Icon} size={18} strokeWidth={1.5} />
    </div>
  );
}
