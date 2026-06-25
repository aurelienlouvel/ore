import { LogoTile } from "@/components/blocks/LogoTile";
import { formatDateRange } from "@/lib/date-utils";

export function TimelineRow({
  orgName,
  logoUrl,
  title,
  contractType,
  startDate,
  endDate,
  ongoingFallback = false,
}: {
  orgName: string | null;
  logoUrl: string | null;
  title: string;
  contractType?: string | null;
  startDate: string | null;
  endDate: string | null;
  ongoingFallback?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <LogoTile
        name={orgName ?? title}
        logoUrl={logoUrl}
        className="h-10 w-10 rounded-xl text-base"
      />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <span className="text-lg font-bold text-stone-900">
            {orgName ?? title}
          </span>
          {startDate && (
            <span className="text-base font-medium text-stone-600">
              {formatDateRange(startDate, endDate, ongoingFallback)}
            </span>
          )}
        </div>
        {orgName && (
          <span className="text-base text-stone-500">
            {title}
            {contractType && (
              <span className="text-stone-400"> · {contractType}</span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
