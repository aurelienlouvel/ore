import { cn } from "@/lib/utils";

const TILE_COLORS = [
  "bg-rose-100 text-rose-600",
  "bg-orange-100 text-orange-600",
  "bg-amber-100 text-amber-600",
  "bg-lime-100 text-lime-600",
  "bg-emerald-100 text-emerald-600",
  "bg-cyan-100 text-cyan-600",
  "bg-blue-100 text-blue-600",
  "bg-violet-100 text-violet-600",
  "bg-fuchsia-100 text-fuchsia-600",
];

function pickColor(name: string) {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return TILE_COLORS[hash % TILE_COLORS.length];
}

export function LogoTile({
  name,
  logoUrl,
  className,
}: {
  name: string;
  logoUrl?: string | null;
  className?: string;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt=""
        className={cn("shrink-0 rounded-lg object-contain", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg font-bold",
        pickColor(name),
        className,
      )}
    >
      {name.charAt(0)}
    </div>
  );
}
