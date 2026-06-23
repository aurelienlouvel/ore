import { LogoTile } from "@/components/blocks/LogoTile";
import { formatMonth } from "@/lib/date-utils";

export function TimelineRow({
  orgName,
  logoUrl,
  title,
  startDate,
  endDate,
  description,
  ongoingFallback = false,
}: {
  orgName: string | null;
  logoUrl: string | null;
  title: string;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  ongoingFallback?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <LogoTile
        name={orgName ?? title}
        logoUrl={logoUrl}
        className="h-10 w-10 rounded-xl text-base"
      />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <span className="text-lg font-bold text-stone-900">
            {orgName ?? title}
          </span>
          {startDate && (
            <span className="text-base font-medium text-stone-600">
              {formatMonth(startDate)}
              {endDate
                ? ` → ${formatMonth(endDate)}`
                : ongoingFallback
                  ? " → now"
                  : ""}
            </span>
          )}
        </div>
        {orgName && (
          <span className="text-base text-stone-500">{title}</span>
        )}
        {description && (
          <p className="mt-1 max-w-lg text-sm leading-relaxed text-stone-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
