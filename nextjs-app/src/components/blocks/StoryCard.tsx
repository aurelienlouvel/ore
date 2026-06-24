"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cardiogram01Icon,
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
      speedKmh: number | null;
      distanceKm: number | null;
      durationMin: number | null;
      bpm: number | null;
      elevationM: number | null;
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

function formatPace(speedKmh: number): string {
  const pace = 60 / speedKmh;
  const mins = Math.floor(pace);
  const secs = Math.round((pace - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
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
  const zoom = 11;

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

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#e9eaf0]">
      <CartoBackground lat={slide.lat} lon={slide.lon} zoom={zoom} />

      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/60 to-transparent" />

      {/* Location dot — centered on the geocoded address */}
      <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
        <span className="absolute h-9 w-9 animate-ping rounded-full bg-[#007AFF]/20" />
        <span className="relative block h-3.5 w-3.5 rounded-full bg-[#007AFF] shadow-md ring-[3px] ring-white" />
      </span>

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 flex items-center gap-1.5 p-4 text-white drop-shadow">
        <HugeiconsIcon icon={MapPinpoint01Icon} size={15} strokeWidth={2} />
        <span className="text-xs font-medium uppercase tracking-wide text-white/80">Location</span>
      </div>

      {/* Bottom-right: weather + city */}
      <div className="absolute bottom-0 right-0 p-4 pb-5 text-right">
        {slide.temperature != null && (
          <p className="mb-1 text-xs font-medium text-white/80 drop-shadow-sm" suppressHydrationWarning>
            {weatherEmoji(slide.weatherCode)} {Math.round(slide.temperature)}°
            <span className="mx-1.5 text-white/40">·</span>
            {timeStr}
          </p>
        )}
        {slide.label && (
          <p className="text-2xl font-bold text-white drop-shadow">{slide.label}</p>
        )}
      </div>
    </div>
  );
}

// CartoDB Voyager — colorful raster tiles, free, no token
function CartoBackground({
  lat,
  lon,
  zoom,
}: {
  lat: number;
  lon: number;
  zoom: number;
}) {
  const { x, y } = tileFloat(lat, lon, zoom);
  const tileX = Math.floor(x);
  const tileY = Math.floor(y);
  const half = (MAP_GRID - 1) / 2;
  const locPxX = half * MAP_TILE + (x - tileX) * MAP_TILE;
  const locPxY = half * MAP_TILE + (y - tileY) * MAP_TILE;
  const layerSize = MAP_GRID * MAP_TILE;
  return (
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
          const s = ["a", "b", "c", "d"][(tx + ty) % 4];
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${tx}-${ty}-${zoom}`}
              src={`https://${s}.basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${tx}/${ty}@2x.png`}
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
            Music
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
      const pace =
        slide.speedKmh && slide.speedKmh > 0 ? formatPace(slide.speedKmh) : null;
      const mainStats = [
        slide.distanceKm != null ? `${slide.distanceKm.toFixed(1)} km` : null,
        slide.durationMin != null ? `${slide.durationMin} min` : null,
      ]
        .filter(Boolean)
        .join(" · ");

      return (
        <div className="relative flex h-full w-full flex-col bg-stone-700 text-white">
          {/* Top bar */}
          <div className="flex items-center gap-1.5 p-4">
            <HugeiconsIcon icon={WorkoutRunIcon} size={18} strokeWidth={2} />
            <span className="text-xs font-medium uppercase tracking-wide text-white/80">
              Activity
            </span>
          </div>

          {/* Bottom content */}
          <div className="mt-auto flex flex-col gap-1.5 p-6">
            {/* BPM */}
            {slide.bpm != null && (
              <div className="mb-1 flex items-center gap-1.5">
                <HugeiconsIcon icon={Cardiogram01Icon} size={14} strokeWidth={1.5} className="text-white/70" />
                <span className="text-sm font-semibold tabular-nums">
                  {slide.bpm}
                  <span className="ml-0.5 text-xs font-normal text-white/60">bpm</span>
                </span>
              </div>
            )}

            {/* Distance + time | Pace */}
            {(mainStats || pace) && (
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-white/75">{mainStats}</span>
                {pace && (
                  <span className="text-sm font-bold tabular-nums">
                    {pace}
                    <span className="ml-0.5 text-xs font-normal text-white/60">/km</span>
                  </span>
                )}
              </div>
            )}

            {/* Activity title */}
            <p className="text-xl font-bold leading-tight">
              {slide.activityName ?? "Latest activity"}
            </p>

            {/* Date */}
            {slide.date && (
              <p className="text-xs text-white/40">{slide.date}</p>
            )}
          </div>
        </div>
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
              <span className="text-xs font-medium uppercase tracking-wide text-white/80">Code</span>
            </>
          }
        >
          {slide.repo && (
            <div className="mb-2 flex items-center gap-1.5 text-xs text-white/50">
              <HugeiconsIcon icon={GitCommitIcon} size={13} strokeWidth={2} className="shrink-0" />
              <span className="truncate">{slide.repo}</span>
            </div>
          )}
          <p className="text-base font-semibold leading-snug">{slide.message}</p>
          {slide.date && (
            <span className="mt-1.5 block text-xs text-white/40">
              {slide.date}
            </span>
          )}
        </CardShell>
      );
  }
}
