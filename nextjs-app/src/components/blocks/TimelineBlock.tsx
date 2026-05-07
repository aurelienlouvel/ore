import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { formatMonth, calcDuration } from "@/lib/date-utils";

interface TimelineBlockProps {
  startDate: string;
  endDate: string | null;
}

export function TimelineBlock({ startDate, endDate }: TimelineBlockProps) {
  return (
    <div className="flex items-center gap-5 text-sm text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <HugeiconsIcon icon={Calendar03Icon} size={14} />
        <span>
          {formatMonth(startDate)}
          {" → "}
          {endDate ? formatMonth(endDate) : "Present"}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <HugeiconsIcon icon={Clock01Icon} size={14} />
        <span>{calcDuration(startDate, endDate)}</span>
      </div>
    </div>
  );
}
