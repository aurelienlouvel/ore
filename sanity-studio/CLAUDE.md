# oré — Sanity Studio

Studio déployé sur **ore.sanity.studio** · projectId `87awwrcu` · dataset `production`

## Lancer / déployer

```bash
pnpm dev                          # localhost:3333
pnpm sanity deploy --url ore -y   # → ore.sanity.studio
```

## Schéma

| Type | Champs principaux |
|---|---|
| `project` | title, slug, thumbnail (file image/vidéo), description, organisation, startDate, endDate, tags[], roles[], contributors[], redirectUrl, sections[] |
| `organisation` | name, logo (image), description, websiteUrl |
| `tag` / `role` | name, icon (nom HugeIcon), color (valeur Tailwind ex: `red-300`) |
| `person` | firstName, lastName, avatar (image), linkedinUrl |

## Conventions

- Les thumbnails sont de type `file` (pas `image`) — CDN : `cdn.sanity.io/files/87awwrcu/production/`
- Couleurs tags/roles : stocker le nom de couleur Tailwind (`red`, `yellow`, etc.)
- Icons : stocker le nom de l'export HugeIcon (ex: `"Folder02Icon"`)
- Avant de modifier le schéma, vérifier la compatibilité avec les données existantes

## Composants custom

| Composant | Usage |
|---|---|
| `ColorInput` | Picker de couleur Tailwind (cercles colorés) |
| `IconInput` | Picker d'icône HugeIcon avec recherche |
| `navIcons.tsx` | Icônes de navigation dans la sidebar |
