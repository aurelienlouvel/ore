import { ViewTransition } from "react";
import { client } from "@/sanity/client";
import {
  profileQuery,
  experiencesQuery,
  educationQuery,
  type Profile,
  type ExperienceItem,
  type EducationItem,
} from "@/sanity/queries";
import { PageShell } from "@/components/PageShell";
import { ToolIcon } from "@/components/blocks/ToolIcon";
import { TimelineRow } from "@/components/blocks/TimelineRow";
import { StoryStack, type StorySlide } from "@/components/blocks/StoryStack";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { formatDateTime } from "@/lib/date-utils";

export const revalidate = 60;

type GitHubPushEvent = {
  type: string;
  created_at: string;
  repo: { name: string };
  payload: { commits?: Array<{ message: string }> };
};

async function getLatestCommit(username: string | null) {
  if (!username) return null;
  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/events/public`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    const events: GitHubPushEvent[] = await res.json();
    const pushEvent = events.find((e) => e.type === "PushEvent");
    const commits = pushEvent?.payload.commits ?? [];
    const lastCommit = commits[commits.length - 1];
    if (!pushEvent || !lastCommit) return null;
    return {
      repo: pushEvent.repo.name,
      message: lastCommit.message,
      date: formatDateTime(pushEvent.created_at),
    };
  } catch {
    return null;
  }
}

type ToolItem = NonNullable<Profile["tools"]>[number];

function ToolPill({ tool }: { tool: ToolItem }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          tool.url ? (
            <a href={tool.url} target="_blank" rel="noreferrer" />
          ) : (
            <div />
          )
        }
      >
        <ToolIcon name={tool.name} logoUrl={tool.logoUrl} />
      </TooltipTrigger>
      <TooltipContent>{tool.name}</TooltipContent>
    </Tooltip>
  );
}

export default async function InfoPage() {
  const [profile, experiences, education] = await Promise.all([
    client.fetch<Profile | null>(profileQuery),
    client.fetch<ExperienceItem[]>(experiencesQuery),
    client.fetch<EducationItem[]>(educationQuery),
  ]);

  if (!profile) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <p className="text-muted-foreground">info — coming soon</p>
      </main>
    );
  }

  const storySlides: StorySlide[] = (
    await Promise.all(
      (profile.stories ?? []).map(async (story): Promise<StorySlide | null> => {
        switch (story._type) {
          case "storyPhoto":
            return {
              type: "photo",
              imageUrl: story.imageUrl,
              alt: story.alt,
              caption: story.caption,
            };
          case "storyVideo":
            return {
              type: "video",
              videoUrl: story.videoFileUrl ?? story.url,
              caption: story.caption,
            };
          case "storyAppleMusic":
            return { type: "appleMusic", url: story.url };
          case "storyStrava":
            return { type: "strava", profileUrl: story.profileUrl };
          case "storyGithub": {
            const commit = await getLatestCommit(story.username);
            return {
              type: "github",
              repo: commit?.repo ?? null,
              message: commit?.message ?? null,
              date: commit?.date ?? null,
              url: story.username
                ? `https://github.com/${story.username}`
                : null,
            };
          }
          default:
            return null;
        }
      }),
    )
  ).filter((slide): slide is StorySlide => slide !== null);

  const slides: StorySlide[] =
    storySlides.length > 0
      ? storySlides
      : [{ type: "photo", imageUrl: null, alt: null, caption: null }];

  const leftTools = profile.tools?.filter((t) => !t.referral) ?? [];
  const rightTools = profile.tools?.filter((t) => t.referral) ?? [];

  return (
    <ViewTransition default="none">
      <PageShell restore="top">
        <main className="w-full bg-white rounded-t-2xl">
          <div className="mx-auto max-w-4xl px-6 py-12 sm:px-10 sm:pt-20 sm:pb-64">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-[3fr_2fr] md:gap-6">
              {/* Left column */}
              <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl! leading-tight! font-bold tracking-tight text-stone-900">
                      {profile.firstName} {profile.lastName}
                    </h1>
                    {profile.jobTitle && (
                      <p className="mt-0.5 text-base text-stone-500">
                        {profile.jobTitle}
                      </p>
                    )}
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.png" alt="oré" className="mt-1 h-5 w-auto shrink-0" />
                </div>

                {profile.bio && (
                  <div className="rounded-3xl bg-stone-50 p-8">
                    <p className="text-base leading-relaxed text-stone-600">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {(leftTools.length > 0 || rightTools.length > 0) && (
                  <TooltipProvider>
                    <div className="flex flex-wrap items-center gap-6">
                      {leftTools.map((tool) => (
                        <ToolPill key={tool._id} tool={tool} />
                      ))}
                      {rightTools.length > 0 && (
                        <div className="ml-auto flex flex-wrap items-center gap-6">
                          {rightTools.map((tool) => (
                            <ToolPill key={tool._id} tool={tool} />
                          ))}
                        </div>
                      )}
                    </div>
                  </TooltipProvider>
                )}
              </div>

              {/* Right column */}
              <StoryStack slides={slides} />
            </div>

            {experiences.length > 0 && (
              <section className="mt-20">
                <h2 className="mb-8 text-sm! font-medium! tracking-normal! text-stone-400">Experience</h2>
                <div className="flex flex-col gap-10">
                  {experiences.map((exp) => (
                    <TimelineRow
                      key={exp._id}
                      orgName={exp.organisation?.name ?? null}
                      logoUrl={exp.organisation?.logoUrl ?? null}
                      title={exp.title}
                      startDate={exp.startDate}
                      endDate={exp.endDate}
                      description={exp.description}
                      ongoingFallback
                    />
                  ))}
                </div>
              </section>
            )}

            {education.length > 0 && (
              <section className="mt-20">
                <h2 className="mb-8 text-sm! font-medium! tracking-normal! text-stone-400">Education</h2>
                <div className="flex flex-col gap-10">
                  {education.map((edu) => (
                    <TimelineRow
                      key={edu._id}
                      orgName={edu.organisation?.name ?? null}
                      logoUrl={edu.organisation?.logoUrl ?? null}
                      title={edu.title}
                      startDate={edu.startDate}
                      endDate={edu.endDate}
                      description={edu.description}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>
      </PageShell>
    </ViewTransition>
  );
}
