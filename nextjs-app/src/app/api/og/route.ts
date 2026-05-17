import { NextRequest, NextResponse } from "next/server";

/**
 * Extracts a meta tag's content attribute.
 * Handles both attribute orderings and multiline tags.
 */
function getMeta(html: string, ...keys: string[]): string | null {
  for (const key of keys) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const patterns = [
      // property/name first, then content
      new RegExp(
        `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`,
        "i",
      ),
      // content first, then property/name
      new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`,
        "i",
      ),
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m?.[1]?.trim()) return m[1].trim();
    }
  }
  return null;
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function resolveUrl(maybeRelative: string, base: string): string {
  try {
    return new URL(maybeRelative, base).toString();
  } catch {
    return maybeRelative;
  }
}

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return NextResponse.json(
      { error: "Unsupported protocol" },
      { status: 400 },
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(rawUrl, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    }

    // Read the full body but truncate at 80KB — enough for any <head>
    const raw = await res.text();
    const html = raw.slice(0, 80_000);

    // Work on <head> only if we can find it
    const headEnd = html.toLowerCase().indexOf("</head>");
    const head = headEnd > 0 ? html.slice(0, headEnd + 7) : html;

    // ── Title ──────────────────────────────────────────────────────────
    let title =
      getMeta(head, "og:title", "twitter:title") ??
      head.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ??
      null;
    if (title) title = decodeEntities(title);

    // ── Description ────────────────────────────────────────────────────
    let description =
      getMeta(head, "og:description", "twitter:description", "description") ??
      null;
    if (description) description = decodeEntities(description);

    // ── Image ──────────────────────────────────────────────────────────
    let image =
      getMeta(head, "og:image", "og:image:url", "twitter:image") ?? null;
    if (image) {
      image = resolveUrl(decodeEntities(image), rawUrl);
    }

    return NextResponse.json(
      { title, description, image },
      {
        headers: {
          "Cache-Control":
            "public, max-age=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (err) {
    clearTimeout(timeout);
    const msg = err instanceof Error ? err.message : "unknown";
    return NextResponse.json({ error: "Fetch failed", detail: msg }, { status: 502 });
  }
}
