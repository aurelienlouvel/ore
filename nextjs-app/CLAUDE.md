@AGENTS.md

# oré — Next.js App

## Structure

```
src/
├── app/
│   ├── layout.tsx                  # Fonts, ActionBarProvider, ActionBar
│   ├── page.tsx                    # Redirect → /work
│   ├── work/page.tsx               # Grille projets (3 cols)
│   ├── work/[slug]/page.tsx        # Page projet (server component)
│   ├── work/[slug]/project-page-client.tsx  # Passe le projet à l'ActionBar
│   ├── play/page.tsx
│   ├── info/page.tsx
│   └── notion/page.tsx             # Landing prod : page Notion plein écran + bouton vers la preprod
├── components/
│   ├── ui/                         # shadcn — ne pas éditer manuellement
│   ├── action-bar.tsx              # Barre de nav flottante (client)
│   └── project-card.tsx            # Card grille work
├── contexts/
│   └── action-bar-context.tsx      # État ActionBar : "nav" | "project"
├── sanity/
│   ├── client.ts · env.ts · queries.ts
└── lib/
    ├── utils.ts                    # cn()
    ├── sanity-utils.ts             # fileRefToUrl(), isVideoRef()
    └── landing.ts                  # URLs de la landing prod + isLandingPath()
```

## Conventions

- Server components par défaut — `"use client"` uniquement si hooks/events/context
- Next.js 16 : `await params` avant tout autre `await` dans les pages
- ISR : `export const revalidate = 60` sur les pages data-fetching
- **Jamais de composant custom si shadcn en a un** — toujours vérifier d'abord
- Ajouter un composant shadcn : `pnpm dlx shadcn@latest add <component>`
- Icons : imports nommés depuis `@hugeicons/core-free-icons`
- Tailwind : pas de valeurs px en dur, mobile-first, couleurs via CSS variables

## Patterns clés

### Thumbnail Sanity
Les thumbnails sont de type `file` (pas `image`). Toujours utiliser :
```ts
import { fileRefToUrl, isVideoRef } from "@/lib/sanity-utils";
const url = fileRefToUrl(project.thumbnailRef);
```

### ActionBar
Deux modes : `"nav"` (par défaut) et `"project"` (page projet).
Pour passer en mode projet, placer dans la page :
```tsx
<ProjectPageClient title={project.title} redirectUrl={project.redirectUrl} />
```
Le cleanup (retour en mode nav) se fait automatiquement au unmount.

### Fetches Sanity typés
```ts
const projects = await client.fetch<ProjectListItem[]>(projectsListQuery);
const project  = await client.fetch<ProjectDetail | null>(projectDetailQuery, { slug });
```

## Prod vs preprod — landing Notion

Tant que le nouveau site est en WIP, **`ore.today` n'affiche que la page Notion du
portfolio actuel** (iframe plein écran) avec un bouton « visit the wip site » vers
`https://preprod.ore.today`. Tout le reste (preprod, previews Vercel, localhost)
garde le site WIP.

- **Routage par domaine** dans `next.config.ts` (`onProdHost` : regex ancrée sur
  `ore.today` / `www.ore.today`) : `/` est réécrit vers `/notion`, toute autre page
  redirige (307) vers `/`. Les assets, `_next` et `/api` restent servis.
- **`/notion`** est une vraie route statique : prévisualisable partout (localhost,
  preprod, previews) sans toucher au DNS. En local, simuler la prod avec
  `curl -H "Host: ore.today" localhost:3000/`.
- **`src/lib/landing.ts`** : `NOTION_PAGE_URL` (lien *Share → Publish → Copy web link* ;
  la page doit être publiée, sinon l'iframe n'affiche que le login Notion),
  `WIP_SITE_URL`, `isLandingPath()`.
- **`ActionBar`** se masque sur `/` et `/notion` (`isLandingPath`).
- `ore.today` doit être rattaché au projet Vercel `ore-today`. S'il est configuré comme
  domaine personnalisé côté Notion, l'y retirer d'abord : Notion peut rediriger son URL
  `notion.site` vers ce domaine, ce qui ferait boucler l'iframe sur elle-même.

**Retirer la landing** (nouveau site en prod) : supprimer `rewrites`, `redirects` et
`onProdHost` de `next.config.ts`, `src/app/notion/`, `src/lib/landing.ts` et le garde
`isLandingPath` d'`ActionBar.tsx`.
