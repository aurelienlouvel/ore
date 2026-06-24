import { formatDateTime } from "@/lib/date-utils";

type GitHubPushEvent = {
  type: string;
  created_at: string;
  repo: { name: string };
  payload: { commits?: Array<{ message: string }> };
};

type GeocodeResult = {
  results?: Array<{
    latitude: number;
    longitude: number;
    name: string;
    country?: string;
    timezone?: string;
  }>;
};

type ForecastResult = {
  current?: { temperature_2m?: number; weather_code?: number };
};

type StravaActivity = {
  name?: string;
  type?: string;
  sport_type?: string;
  distance?: number;
  moving_time?: number;
  start_date_local?: string;
};

export async function getLatestCommit(username: string | null) {
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

export async function getMapData(address: string | null) {
  if (!address) return null;
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(address)}&count=1&language=en&format=json`,
      { next: { revalidate: 86400 } },
    );
    if (!geoRes.ok) return null;
    const geo: GeocodeResult = await geoRes.json();
    const place = geo.results?.[0];
    if (!place) return null;
    const { latitude, longitude, name, country, timezone } = place;

    let temperature: number | null = null;
    let weatherCode: number | null = null;
    try {
      const wxRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`,
        { next: { revalidate: 1800 } },
      );
      if (wxRes.ok) {
        const wx: ForecastResult = await wxRes.json();
        temperature = wx.current?.temperature_2m ?? null;
        weatherCode = wx.current?.weather_code ?? null;
      }
    } catch {
      // weather is best-effort
    }

    return {
      lat: latitude,
      lon: longitude,
      label: country ? `${name}, ${country}` : name,
      timezone: timezone ?? null,
      temperature,
      weatherCode,
    };
  } catch {
    return null;
  }
}

type ItunesTrack = {
  wrapperType?: string;
  kind?: string;
  trackName?: string;
  artistName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
};

export async function getAppleMusicData(url: string | null) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    // ?i= param = track inside an album URL; fallback to last path segment for /song/ URLs
    const trackIdStr =
      parsed.searchParams.get("i") ??
      parsed.pathname.split("/").filter(Boolean).pop();
    const trackId = Number(trackIdStr);
    if (!trackId || isNaN(trackId)) return null;

    const res = await fetch(
      `https://itunes.apple.com/lookup?id=${trackId}&entity=song`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const track: ItunesTrack | undefined = (data.results ?? []).find(
      (r: ItunesTrack) => r.wrapperType === "track" || r.kind === "song",
    );
    if (!track) return null;
    return {
      artworkUrl: track.artworkUrl100?.replace("100x100bb", "600x600bb") ?? null,
      trackName: track.trackName ?? null,
      artistName: track.artistName ?? null,
      previewUrl: track.previewUrl ?? null,
    };
  } catch {
    return null;
  }
}

export async function getStravaActivity() {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;
  try {
    const tokenRes = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      cache: "no-store",
    });
    if (!tokenRes.ok) return null;
    const { access_token: accessToken } = await tokenRes.json();
    if (!accessToken) return null;

    const actRes = await fetch(
      "https://www.strava.com/api/v3/athlete/activities?per_page=1",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { revalidate: 1800 },
      },
    );
    if (!actRes.ok) return null;
    const activities: StravaActivity[] = await actRes.json();
    const a = activities?.[0];
    if (!a) return null;
    return {
      name: a.name ?? null,
      type: a.sport_type ?? a.type ?? null,
      distanceKm: a.distance != null ? a.distance / 1000 : null,
      movingMin: a.moving_time != null ? Math.round(a.moving_time / 60) : null,
      date: a.start_date_local ? formatDateTime(a.start_date_local) : null,
    };
  } catch {
    return null;
  }
}
