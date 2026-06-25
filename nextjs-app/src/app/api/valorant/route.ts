import { NextRequest, NextResponse } from "next/server";

type MatchData = {
  result: "victory" | "defeat";
  score: string | null;
  mapName: string | null;
  mapSplashUrl: string | null;
  agentName: string | null;
  agentIconUrl: string | null;
  kills: number | null;
  deaths: number | null;
  assists: number | null;
  acs: number | null;
  hsPercent: number | null;
  rank: string | null;
  rankIconUrl: string | null;
  startedAt: string | null;
};

// Fill map splash + agent square icon from the open valorant-api.com (no key).
async function enrichVisuals(mapName: string | null, agentName: string | null) {
  let mapSplashUrl: string | null = null;
  let agentIconUrl: string | null = null;

  if (mapName) {
    try {
      const r = await fetch("https://valorant-api.com/v1/maps");
      if (r.ok) {
        const j = await r.json();
        const e = (j.data as Array<{ displayName: string; splash: string }>)?.find(
          (mp) => mp.displayName.toLowerCase() === mapName.toLowerCase(),
        );
        if (e) mapSplashUrl = e.splash;
      }
    } catch { /* best-effort */ }
  }

  if (agentName) {
    try {
      const r = await fetch(
        "https://valorant-api.com/v1/agents?isPlayableCharacter=true",
      );
      if (r.ok) {
        const j = await r.json();
        const e = (
          j.data as Array<{ displayName: string; displayIcon: string }>
        )?.find((a) => a.displayName.toLowerCase() === agentName.toLowerCase());
        if (e) agentIconUrl = e.displayIcon;
      }
    } catch { /* best-effort */ }
  }

  return { mapSplashUrl, agentIconUrl };
}

// ─── Official Tracker Network public API (public-api.tracker.gg) ────────────
// v2 "standard" matches format: metadata + per-player segments/stats.
async function fromTRN(name: string, tag: string, key: string): Promise<MatchData | null> {
  const res = await fetch(
    `https://public-api.tracker.gg/v2/valorant/standard/matches/riot/${encodeURIComponent(name)}%23${encodeURIComponent(tag)}?type=competitive`,
    {
      headers: {
        "TRN-Api-Key": key,
        Accept: "application/json",
        "Accept-Encoding": "gzip",
      },
      next: { revalidate: 300 },
    },
  );
  if (!res.ok) return null;
  const json = await res.json();

  const matches: unknown[] = Array.isArray(json.data)
    ? json.data
    : Array.isArray(json.data?.matches)
      ? json.data.matches
      : [];
  const m = matches[0] as Record<string, unknown> | undefined;
  if (!m) return null;

  const meta = (m.metadata ?? {}) as Record<string, unknown>;
  const segments = (m.segments ?? []) as Array<Record<string, unknown>>;
  const seg =
    segments.find((s) => {
      const a = s.attributes as Record<string, unknown> | undefined;
      return (
        typeof a?.platformUserIdentifier === "string" &&
        a.platformUserIdentifier.toLowerCase().startsWith(name.toLowerCase())
      );
    }) ??
    segments.find((s) => s.type === "player") ??
    segments[0];

  const sMeta = (seg?.metadata ?? {}) as Record<string, unknown>;
  const stats = (seg?.stats ?? {}) as Record<string, { value: number } | undefined>;

  const isWin =
    meta.result === "win" ||
    meta.result === "victory" ||
    (meta as Record<string, unknown>).resultShort === "W";

  const roundsWon =
    typeof sMeta.roundsWon === "number"
      ? sMeta.roundsWon
      : typeof meta.scoreHome === "number"
        ? meta.scoreHome
        : null;
  const roundsLost =
    typeof sMeta.roundsLost === "number"
      ? sMeta.roundsLost
      : typeof meta.scoreAway === "number"
        ? meta.scoreAway
        : null;

  const agentName = (sMeta.agent as string | undefined) ?? null;
  const mapName = (meta.map as string | undefined) ?? null;
  const visuals = await enrichVisuals(mapName, agentName);

  const acs = stats.scorePerRound?.value ?? stats.acs?.value ?? null;
  const hsPercent =
    stats.headshotsPercentage?.value ?? stats.headshotsPercent?.value ?? null;

  return {
    result: isWin ? "victory" : "defeat",
    score: roundsWon != null && roundsLost != null ? `${roundsWon}-${roundsLost}` : null,
    mapName,
    mapSplashUrl: (meta.mapImageUrl as string | undefined) ?? visuals.mapSplashUrl,
    agentName,
    agentIconUrl: visuals.agentIconUrl,
    kills: stats.kills?.value ?? null,
    deaths: stats.deaths?.value ?? null,
    assists: stats.assists?.value ?? null,
    acs: acs != null ? Math.round(acs) : null,
    hsPercent: hsPercent != null ? Math.round(hsPercent) : null,
    rank: (sMeta.rank as string | undefined) ?? null,
    rankIconUrl: (sMeta.rankImageUrl as string | undefined) ?? null,
    startedAt: (meta.started_at as string | undefined) ?? null,
  };
}

// ─── Henrik Dev API (api.henrikdev.xyz) — v4 matchlist format ───────────────
const HENRIK_REGIONS = new Set(["eu", "na", "ap", "kr", "latam", "br"]);

async function fromHenrik(
  name: string,
  tag: string,
  region: string,
  key: string,
): Promise<MatchData | null> {
  const res = await fetch(
    `https://api.henrikdev.xyz/valorant/v4/matches/${region}/pc/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?mode=competitive&size=1`,
    { headers: { Authorization: key }, next: { revalidate: 300 } },
  );
  if (!res.ok) return null;
  const json = await res.json();

  const matches = Array.isArray(json.data) ? json.data : [];
  const m = matches[0] as Record<string, unknown> | undefined;
  if (!m) return null;

  const metadata = (m.metadata ?? {}) as Record<string, unknown>;
  const mapMeta = (metadata.map ?? {}) as Record<string, unknown>;
  const players = (m.players ?? []) as Array<Record<string, unknown>>;
  const teams = (m.teams ?? []) as Array<Record<string, unknown>>;

  const player =
    players.find(
      (p) => typeof p.name === "string" && p.name.toLowerCase() === name.toLowerCase(),
    ) ?? players[0];
  if (!player) return null;

  const team = teams.find((t) => t.team_id === player.team_id);
  const hasWon = team?.won === true;
  const rounds = (team?.rounds ?? {}) as Record<string, unknown>;
  const roundsWon = typeof rounds.won === "number" ? rounds.won : null;
  const roundsLost = typeof rounds.lost === "number" ? rounds.lost : null;

  const stats = (player.stats ?? {}) as Record<string, unknown>;
  const agent = (player.agent ?? {}) as Record<string, unknown>;
  const tier = (player.tier ?? {}) as Record<string, unknown>;
  const agentName = typeof agent.name === "string" ? agent.name : null;
  const mapName = typeof mapMeta.name === "string" ? mapMeta.name : null;
  const visuals = await enrichVisuals(mapName, agentName);

  const kills = typeof stats.kills === "number" ? stats.kills : null;
  const deaths = typeof stats.deaths === "number" ? stats.deaths : null;
  const assists = typeof stats.assists === "number" ? stats.assists : null;
  const score = typeof stats.score === "number" ? stats.score : null;
  const headshots = typeof stats.headshots === "number" ? stats.headshots : null;
  const bodyshots = typeof stats.bodyshots === "number" ? stats.bodyshots : null;
  const legshots = typeof stats.legshots === "number" ? stats.legshots : null;

  const totalShots = (headshots ?? 0) + (bodyshots ?? 0) + (legshots ?? 0);
  const hsPercent =
    totalShots > 0 && headshots != null
      ? Math.round((headshots / totalShots) * 100)
      : null;
  const totalRounds = (roundsWon ?? 0) + (roundsLost ?? 0);
  const acs = totalRounds > 0 && score != null ? Math.round(score / totalRounds) : null;

  return {
    result: hasWon ? "victory" : "defeat",
    score: roundsWon != null && roundsLost != null ? `${roundsWon}-${roundsLost}` : null,
    mapName,
    mapSplashUrl: visuals.mapSplashUrl,
    agentName,
    agentIconUrl: visuals.agentIconUrl,
    kills,
    deaths,
    assists,
    acs,
    hsPercent,
    rank: typeof tier.name === "string" ? tier.name : null,
    rankIconUrl:
      typeof tier.id === "number"
        ? `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/${tier.id}/largeicon.png`
        : null,
    startedAt: typeof metadata.started_at === "string" ? metadata.started_at : null,
  };
}

export async function GET(request: NextRequest) {
  const trackerUrl = request.nextUrl.searchParams.get("trackerUrl");
  if (!trackerUrl) return NextResponse.json(null);

  const regionParam = (request.nextUrl.searchParams.get("region") ?? "eu").toLowerCase();
  const region = HENRIK_REGIONS.has(regionParam) ? regionParam : "eu";

  const henrikKey = process.env.VALORANT_API_KEY; // henrikdev (preferred)
  const trnKey = process.env.TRN_API_KEY; // official public-api.tracker.gg
  if (!henrikKey && !trnKey) return NextResponse.json(null, { status: 503 });

  const idMatch = trackerUrl.match(/profile\/riot\/([^/?#]+)/);
  if (!idMatch) return NextResponse.json(null);
  const riotId = decodeURIComponent(idMatch[1]);
  const hashIdx = riotId.lastIndexOf("#");
  if (hashIdx === -1) return NextResponse.json(null);
  const name = riotId.slice(0, hashIdx);
  const tag = riotId.slice(hashIdx + 1);

  try {
    const data = henrikKey
      ? await fromHenrik(name, tag, region, henrikKey)
      : await fromTRN(name, tag, trnKey!);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(null, { status: 500 });
  }
}
