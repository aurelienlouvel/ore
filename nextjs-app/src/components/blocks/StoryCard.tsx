"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GithubIcon,
  GitCommitIcon,
  Image02Icon,
  MapPinpoint01Icon,
  MusicNote01Icon,
  Video01Icon,
  WorkoutRunIcon,
} from "@hugeicons/core-free-icons";

export type StorySlide =
  | { type: "photo"; imageUrl: string | null; alt: string | null; caption: string | null }
  | { type: "video"; videoUrl: string | null; caption: string | null }
  | {
      type: "appleMusic";
      url: string | null;
      artworkUrl: string | null;
      trackName: string | null;
      artistName: string | null;
      previewUrl: string | null;
    }
  | {
      type: "strava";
      profileUrl: string | null;
      activityName: string | null;
      activityType: string | null;
      distanceKm: number | null;
      movingMin: number | null;
      date: string | null;
    }
  | {
      type: "github";
      repo: string | null;
      message: string | null;
      date: string | null;
      url: string | null;
    }
  | {
      type: "appleMaps";
      label: string | null;
      timezone: string | null;
      temperature: number | null;
      weatherCode: number | null;
      lat: number | null;
      lon: number | null;
    };

// ─── Map tile helpers ──────────────────────────────────────────────────────────

const MAP_TILE = 256;
const MAP_ZOOM = 13;
const MAP_GRID = 3;

function tileFloat(lat: number, lon: number, z: number) {
  const n = 2 ** z;
  const x = ((lon + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const y =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
    n;
  return { x, y };
}

function weatherEmoji(code: number | null): string {
  if (code == null) return "";
  if (code === 0) return "☀️";
  if (code <= 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code <= 48) return "🌫️";
  if (code <= 57) return "🌦️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "🌨️";
  if (code <= 82) return "🌧️";
  if (code <= 86) return "🌨️";
  return "⛈️";
}

// ─── Shared primitives ─────────────────────────────────────────────────────────

function PlaceholderSlide({
  icon,
  label,
}: {
  icon: Parameters<typeof HugeiconsIcon>[0]["icon"];
  label: string;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-stone-50">
      <HugeiconsIcon icon={icon} size={28} strokeWidth={1.5} className="text-stone-300" />
      <span className="text-xs font-medium text-stone-400">{label}</span>
    </div>
  );
}

function CardShell({
  bg,
  top,
  children,
}: {
  bg: string;
  top: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`relative flex h-full w-full flex-col text-white ${bg}`}>
      <div className="flex items-center gap-1.5 p-4">{top}</div>
      <div className="mt-auto p-6">{children}</div>
    </div>
  );
}

// ─── Apple Maps card ───────────────────────────────────────────────────────────

function AppleMapsCard({
  slide,
}: {
  slide: Extract<StorySlide, { type: "appleMaps" }>;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (slide.lat == null || slide.lon == null) {
    return <PlaceholderSlide icon={MapPinpoint01Icon} label="carte à venir" />;
  }

  const timeStr = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    ...(slide.timezone ? { timeZone: slide.timezone } : {}),
  }).format(now);

  const { x, y } = tileFloat(slide.lat, slide.lon, MAP_ZOOM);
  const tileX = Math.floor(x);
  const tileY = Math.floor(y);
  const half = (MAP_GRID - 1) / 2;
  const locPxX = half * MAP_TILE + (x - tileX) * MAP_TILE;
  const locPxY = half * MAP_TILE + (y - tileY) * MAP_TILE;
  const layerSize = MAP_GRID * MAP_TILE;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#aadaff]">
      {/* OSM tile grid */}
      <div
        className="absolute"
        style={{
          width: layerSize,
          height: layerSize,
          left: `calc(50% - ${locPxX}px)`,
          top: `calc(50% - ${locPxY}px)`,
        }}
      >
        {Array.from({ length: MAP_GRID }).flatMap((_, row) =>
          Array.from({ length: MAP_GRID }).map((__, col) => {
            const tx = tileX - half + col;
            const ty = tileY - half + row;
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${tx}-${ty}`}
                src={`https://tile.openstreetmap.org/${MAP_ZOOM}/${tx}/${ty}.png`}
                alt=""
                width={MAP_TILE}
                height={MAP_TILE}
                className="absolute max-w-none"
                style={{ left: col * MAP_TILE, top: row * MAP_TILE }}
              />
            );
          }),
        )}
      </div>

      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />

      {/* Location dot */}
      <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
        <span className="absolute h-10 w-10 animate-ping rounded-full bg-[#007AFF]/25" />
        <span className="relative block h-3.5 w-3.5 rounded-full bg-[#007AFF] shadow-md ring-[3px] ring-white" />
      </span>

      {/* Weather + time pill */}
      <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-xs font-medium text-stone-800 shadow-sm backdrop-blur">
        {slide.temperature != null && (
          <>
            <span>
              {weatherEmoji(slide.weatherCode)} {Math.round(slide.temperature)}°
            </span>
            <span className="text-stone-400">·</span>
          </>
        )}
        <span suppressHydrationWarning>{timeStr}</span>
      </div>

      {/* City label */}
      {slide.label && (
        <p className="absolute inset-x-0 bottom-0 p-6 text-sm font-semibold text-white drop-shadow">
          {slide.label}
        </p>
      )}

      <span className="absolute bottom-1 right-1.5 text-[8px] text-white/60">
        © OpenStreetMap
      </span>
    </div>
  );
}

// ─── Apple Music card ──────────────────────────────────────────────────────────

function AppleMusicCard({
  slide,
}: {
  slide: Extract<StorySlide, { type: "appleMusic" }>;
}) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!slide.previewUrl) return;
    const audio = new Audio(slide.previewUrl);
    audioRef.current = audio;
    const onTimeUpdate = () => {
      if (audio.currentTime >= 15) {
        audio.pause();
        audio.currentTime = 0;
        setPlaying(false);
      }
    };
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", () => setPlaying(false));
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [slide.previewUrl]);

  const toggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // prevent story advance
      const audio = audioRef.current;
      if (!audio) return;
      if (playing) {
        audio.pause();
        setPlaying(false);
      } else {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        setPlaying(true);
      }
    },
    [playing],
  );

  // Fallback when no track data yet
  if (!slide.trackName) {
    return (
      <CardShell
        bg="bg-gradient-to-br from-rose-500 to-fuchsia-600"
        top={
          <>
            <HugeiconsIcon icon={MusicNote01Icon} size={18} strokeWidth={2} />
            <span className="text-xs font-medium uppercase tracking-wide text-white/80">
              Apple Music
            </span>
          </>
        }
      >
        <span className="text-base font-semibold">Now playing</span>
      </CardShell>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Blurred album art background */}
      {slide.artworkUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slide.artworkUrl}
          alt=""
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
        />
      )}
      <div className="absolute inset-0 bg-black/55" />

      {/* Content */}
      <div className="relative flex h-full flex-col text-white">
        {/* Top row */}
        <div className="flex items-center gap-1.5 p-4">
          <HugeiconsIcon icon={MusicNote01Icon} size={18} strokeWidth={2} />
          <span className="text-xs font-medium uppercase tracking-wide text-white/80">
            Apple Music
          </span>
        </div>

        {/* Bottom section */}
        <div className="mt-auto p-6">
          {slide.artworkUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slide.artworkUrl}
              alt={slide.trackName}
              className="mb-3 h-14 w-14 rounded-xl shadow-lg"
            />
          )}
          <p className="text-base font-semibold leading-tight">
            {slide.trackName}
          </p>
          <p className="mt-0.5 text-sm text-white/70">{slide.artistName}</p>

          {slide.previewUrl && (
            <button
              type="button"
              onClick={toggle}
              className="mt-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm transition-opacity hover:opacity-80"
            >
              {playing ? (
                <span className="flex gap-[3px]">
                  <span className="h-3 w-[3px] rounded-sm bg-white" />
                  <span className="h-3 w-[3px] rounded-sm bg-white" />
                </span>
              ) : (
                <span className="ml-0.5 h-0 w-0 border-y-[5px] border-l-[9px] border-y-transparent border-l-white" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Slide content dispatcher ──────────────────────────────────────────────────

export function SlideContent({ slide }: { slide: StorySlide }) {
  switch (slide.type) {
    case "photo":
      if (!slide.imageUrl)
        return <PlaceholderSlide icon={Image02Icon} label="photo à venir" />;
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slide.imageUrl}
          alt={slide.alt ?? ""}
          className="h-full w-full object-cover"
        />
      );

    case "video":
      if (!slide.videoUrl)
        return <PlaceholderSlide icon={Video01Icon} label="vidéo à venir" />;
      return (
        <video
          src={slide.videoUrl}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      );

    case "appleMusic":
      return <AppleMusicCard slide={slide} />;

    case "appleMaps":
      return <AppleMapsCard slide={slide} />;

    case "strava": {
      const hasActivity =
        slide.distanceKm != null || slide.activityName != null;
      const meta = [
        slide.activityType,
        slide.movingMin != null ? `${slide.movingMin} min` : null,
        slide.date,
      ]
        .filter(Boolean)
        .join(" · ");
      return (
        <CardShell
          bg="bg-[#FC4C02]"
          top={
            <>
              <HugeiconsIcon icon={WorkoutRunIcon} size={18} strokeWidth={2} />
              <span className="text-xs font-medium uppercase tracking-wide text-white/80">
                Strava
              </span>
            </>
          }
        >
          {hasActivity ? (
            <>
              {slide.distanceKm != null && (
                <span className="block text-2xl font-bold leading-tight">
                  {slide.distanceKm.toFixed(1).replace(".", ",")} km
                </span>
              )}
              {meta && <span className="text-xs text-white/80">{meta}</span>}
            </>
          ) : (
            <span className="text-base font-semibold">Latest activity</span>
          )}
        </CardShell>
      );
    }

    case "github":
      if (!slide.repo)
        return <PlaceholderSlide icon={GithubIcon} label="GitHub" />;
      return (
        <CardShell
          bg="bg-stone-800"
          top={
            <>
              <HugeiconsIcon icon={GithubIcon} size={16} strokeWidth={2} />
              <span className="text-xs font-medium text-white/80">
                {slide.repo}
              </span>
            </>
          }
        >
          <div className="flex items-start gap-1.5">
            <HugeiconsIcon
              icon={GitCommitIcon}
              size={14}
              strokeWidth={2}
              className="mt-0.5 shrink-0"
            />
            <span className="text-sm leading-snug">{slide.message}</span>
          </div>
          {slide.date && (
            <span className="mt-1 block text-xs text-white/50">
              {slide.date}
            </span>
          )}
        </CardShell>
      );
  }
}
