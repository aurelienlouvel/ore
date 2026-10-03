/**
 * Landing de prod. Tant que le nouveau site est en WIP, le domaine de prod
 * (ore.today) n'affiche que la page Notion du portfolio actuel, en plein écran,
 * avec un bouton vers la preprod. Le routage par domaine vit dans
 * `next.config.ts` (rewrite `/` → `/notion`, redirect du reste vers `/`).
 */

/**
 * Page Notion du portfolio actuel (ici l'URL par identifiant de page). À
 * remplacer par le lien Share → Publish → Copy web link (notion.site) si
 * l'iframe n'affiche pas la page : elle doit être publiée sur le web, sinon
 * Notion n'affiche que son écran de connexion.
 */
export const NOTION_PAGE_URL =
  "https://www.notion.so/224ca43dc6968061b974c3c6ab95f29c";

/** Site WIP (la preprod actuelle), cible du bouton de la landing. */
export const WIP_SITE_URL = "https://preprod.ore.today";

// `/notion` est la vraie route (dispo aussi en preprod et en local pour
// prévisualiser), `/` l'URL visible sur la prod une fois le rewrite appliqué.
const LANDING_PATHS = new Set(["/", "/notion"]);

/** La landing n'a pas de nav flottante : les routes WIP n'y sont pas servies. */
export function isLandingPath(pathname: string) {
  return LANDING_PATHS.has(pathname);
}
