import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Tag } from "./Tag";
import { formatMonth, calcDuration } from "@/lib/date-utils";
import type { ProjectDetail } from "@/sanity/queries";

function MetaSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

export function ProjectMeta({ project }: { project: ProjectDetail }) {
  return (
    <div className="space-y-6">
      {project.organisation && (
        <MetaSection label="Organisation">
          <div className="flex items-center gap-2">
            {project.organisation.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={project.organisation.logoUrl}
                alt=""
                className="h-5 w-5 rounded-[4px] object-contain"
              />
            )}
            <span className="text-sm font-medium">
              {project.organisation.name}
            </span>
          </div>
        </MetaSection>
      )}

      {project.startDate && (
        <MetaSection label="Timeline">
          <p className="text-sm">
            {formatMonth(project.startDate)}
            {" → "}
            {project.endDate ? formatMonth(project.endDate) : "Present"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {calcDuration(project.startDate, project.endDate)}
          </p>
        </MetaSection>
      )}

      {project.roles && project.roles.length > 0 && (
        <MetaSection label="Role">
          <div className="flex flex-wrap gap-1.5">
            {project.roles.map((role) => (
              <Tag
                key={role._id}
                name={role.name}
                color={role.color}
                icon={role.icon}
              />
            ))}
          </div>
        </MetaSection>
      )}

      {project.mates && project.mates.length > 0 && (
        <MetaSection label="Mates">
          <div className="space-y-3">
            {project.mates.map((mate) => {
              const fullName = `${mate.firstName} ${mate.lastName}`;
              const initials = fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <div key={mate._id} className="flex items-center gap-2.5">
                  <Avatar size="sm">
                    <AvatarImage
                      src={mate.avatarUrl ?? undefined}
                      alt={fullName}
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-tight">
                      {fullName}
                    </p>
                    {mate.roles?.[0] && (
                      <p className="text-xs text-muted-foreground">
                        {mate.roles[0].name}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </MetaSection>
      )}
    </div>
  );
}
