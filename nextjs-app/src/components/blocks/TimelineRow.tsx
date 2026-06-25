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
        <div className="flex flex-wrap items-start justify-between gap-x-4">
          <span className="min-w-0 text-lg font-bold text-stone-900">
            {orgName ?? title}
          </span>
          {startDate && (
            <span className="hidden shrink-0 whitespace-nowrap text-sm font-medium text-stone-600 sm:inline">
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
        {startDate && (
          <span className="mt-0.5 text-sm font-medium text-stone-500 sm:hidden">
            {formatDateRange(startDate, endDate, ongoingFallback)}
          </span>
        )}
      </div>
    </div>
  );
}
