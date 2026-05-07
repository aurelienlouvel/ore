"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/HoverCard";
import type { ProjectDetail } from "@/sanity/queries";

type Mate = NonNullable<ProjectDetail["mates"]>[number];

export function MatesBlock({ mates }: { mates: Mate[] }) {
  return (
    <div className="flex -space-x-3">
      {mates.map((mate) => {
        const fullName = `${mate.firstName} ${mate.lastName}`;
        const initials = fullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        return (
          <HoverCard key={mate._id}>
            <HoverCardTrigger
              className={`focus:outline-none ${mate.linkedinUrl ? "cursor-pointer" : "cursor-default"}`}
              onClick={() =>
                mate.linkedinUrl &&
                window.open(mate.linkedinUrl, "_blank", "noopener")
              }
            >
              <Avatar
                size="lg"
                className="transition-transform hover:scale-110 hover:z-10"
              >
                <AvatarImage src={mate.avatarUrl ?? undefined} alt={fullName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </HoverCardTrigger>
            <HoverCardContent side="top" className="w-auto min-w-36 p-3">
              <p className="text-sm font-semibold leading-tight">{fullName}</p>
              {mate.roles?.[0] && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {mate.roles[0].name}
                </p>
              )}
            </HoverCardContent>
          </HoverCard>
        );
      })}
    </div>
  );
}
