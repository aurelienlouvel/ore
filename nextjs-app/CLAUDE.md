@AGENTS.md

# oré — Portfolio Next.js App

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styles | Tailwind CSS v4 + shadcn `luma` preset |
| Components | shadcn/ui (`@base-ui/react` primitives) |
| Icons | `@hugeicons/react` + `@hugeicons/core-free-icons` |
| CMS | Sanity v3 (project `87awwrcu`, dataset `production`) |
| Package manager | pnpm |

## Repo structure

```
nextjs-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout — fonts, ActionBarProvider, ActionBar
│   │   ├── page.tsx            # Redirects → /work
│   │   ├── work/
│   │   │   ├── page.tsx        # Project grid (3 cols)
│   │   │   └── [slug]/
│   │   │       ├── page.tsx    # Project detail (server component)
│   │   │       └── project-page-client.tsx  # Sets ActionBar to project mode
│   │   ├── play/page.tsx       # Placeholder
│   │   └── info/page.tsx       # Placeholder
│   ├── components/
│   │   ├── ui/                 # shadcn components (never edit manually — use CLI)
│   │   ├── action-bar.tsx      # Bottom floating nav bar (client component)
│   │   └── project-card.tsx    # Card for the work grid
│   ├── contexts/
│   │   └── action-bar-context.tsx  # Controls ActionBar mode (nav | project)
│   ├── sanity/
│   │   ├── client.ts           # Sanity client (useCdn: true)
│   │   ├── env.ts              # Env var validation with fallbacks
│   │   └── queries.ts          # All GROQ queries + TypeScript types
│   └── lib/
│       ├── utils.ts            # cn() helper (clsx + tailwind-merge)
│       └── sanity-utils.ts     # fileRefToUrl(), isVideoRef()
├── components.json             # shadcn config (style: luma)
└── .env.local                  # NEXT_PUBLIC_SANITY_* vars
```

## Running the project

```bash
pnpm dev          # dev server at localhost:3000
pnpm build        # production build
pnpm tsc --noEmit # type check (run before committing)
```

## Conventions

### General
- Server components by default — `"use client"` only when needed (hooks, events, context)
- `await params` before any other `await` in Next.js 16 page components
- `export const revalidate = 60` on data-fetching pages (ISR)
- `notFound()` from `next/navigation` for missing Sanity documents

### Tailwind / styling
- No hardcoded px values — use Tailwind scale (`px-2` = 8px, `px-4` = 16px…)
- Responsive: mobile-first, breakpoints `sm:` (640px) `md:` (768px) `lg:` (1024px)
- Colors from CSS variables only (`text-foreground`, `bg-muted`, `border-border`…)
- Dark mode: `.dark` class on `<html>` (not `prefers-color-scheme`)

### Components
- **Never create a custom component if shadcn has one** — ask first
- Add shadcn components via CLI: `pnpm dlx shadcn@latest add <component>`
- shadcn components live in `src/components/ui/` — never edit them manually
- Icons: named imports from `@hugeicons/core-free-icons` (tree-shaken)
  ```ts
  import { ArrowLeft01Icon, PlayIcon } from "@hugeicons/core-free-icons";
  ```

### Commits
- Format: `<emoji>(<scope>): <description>` (gitmoji convention)
- Scope: `nextjs`, `studio`, `sanity`

## Sanity schema (key fields)

### `project`
| Field | Type | Notes |
|---|---|---|
| `title` | string | required |
| `slug` | slug | source: title |
| `thumbnail` | file | accepts image/* + video/* |
| `description` | text | |
| `organisation` | reference → organisation | |
| `startDate` / `endDate` | date | format YYYY-MM |
| `tags` | array → reference → tag | |
| `roles` | array → reference → role | |
| `contributors` | array → reference → person | |
| `redirectUrl` | url | used for launch button |
| `sections` | array | content blocks (TODO) |

### `tag` / `role`
`name`, `icon` (HugeIcon name string), `color` (Tailwind color value e.g. `red-300`)

### `organisation`
`name`, `logo` (image), `description`, `websiteUrl`

### `person`
`firstName`, `lastName`, `avatar` (image), `linkedinUrl`

## Key patterns

### Thumbnail CDN URL
Sanity thumbnails are `file` type (not `image`). Use `fileRefToUrl()`:
```ts
import { fileRefToUrl, isVideoRef } from "@/lib/sanity-utils";
const url = fileRefToUrl(project.thumbnailRef); // "file-abc123-jpg" → CDN URL
```
CDN base: `https://cdn.sanity.io/files/87awwrcu/production/`

### ActionBar context
The ActionBar lives in root layout and has two modes:
- **nav**: brand + work/play/info links + contact
- **project**: back arrow + title + optional launch button

To switch to project mode from a page, render `ProjectPageClient` as a child:
```tsx
// Server component page:
<ProjectPageClient title={project.title} redirectUrl={project.redirectUrl} />
```
`ProjectPageClient` is a `"use client"` component that calls `setProjectMode` on mount and `setNavMode` on unmount.

### Typed Sanity fetches
Always pass the generic type to `client.fetch` (TypeGen not configured):
```ts
const projects = await client.fetch<ProjectListItem[]>(projectsListQuery);
const project = await client.fetch<ProjectDetail | null>(projectDetailQuery, { slug });
```

## Environment variables

```
NEXT_PUBLIC_SANITY_PROJECT_ID=87awwrcu
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-01-01
```
Hardcoded as fallbacks in `src/sanity/env.ts` — app works without them set.
