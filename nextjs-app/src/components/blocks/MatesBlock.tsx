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
      {mates.filter((mate) => mate.person != null).map((mate) => {
        const { person, roles } = mate;
        const fullName = `${person.firstName} ${person.lastName}`;
        const initials = fullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        return (
          <HoverCard key={mate._key}>
            <HoverCardTrigger
              className={`focus:outline-none ${person.linkedinUrl ? "cursor-pointer" : "cursor-default"}`}
              onClick={() =>
                person.linkedinUrl &&
                window.open(person.linkedinUrl, "_blank", "noopener")
              }
            >
              <Avatar
                size="default"
                className="transition-transform hover:scale-110 hover:z-10"
              >
                <AvatarImage src={person.avatarUrl ?? undefined} alt={fullName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </HoverCardTrigger>
            <HoverCardContent side="top" className="w-auto min-w-36 p-3">
              <p className="text-sm font-semibold leading-tight">{fullName}</p>
              {roles?.[0] && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {roles[0].name}
                </p>
              )}
            </HoverCardContent>
          </HoverCard>
        );
      })}
    </div>
  );
}
