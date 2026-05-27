"use client";

import { useRef, useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { motion, AnimatePresence, useMotionValue, type MotionValue } from "motion/react";
import * as THREE from "three";
import type { ArtifactCanvasItem } from "@/sanity/queries";
import { ArtifactMesh, CARD_W, CARD_H } from "./ArtifactMesh";
import { ArtifactInfo } from "./ArtifactInfo";

// ─── Layout ────────────────────────────────────────────────────────────────────
//
//  5 cols × 8 rows = 40 items per tile  →  ~3200 × 4280 px world-units.
//  Jitter stays within gap bounds → zero overlap guaranteed.
//  min gap X = cell_w - 2*JITTER_X - 2*maxScale*CARD_W/2 = 640 - 160 - 425 = 55 px
//  min gap Y = cell_h - 2*JITTER_Y - 2*maxScale*CARD_H/2 = 510 - 140 - 312 = 58 px
//
const COLS         = 5;
const GAP_X        = 300;   // cell_w = 640
const GAP_Y        = 260;   // cell_h = 510
const COL_STAGGER  = 200;
const JITTER_X     = 80;    // ±80 px
const JITTER_Y     = 70;    // ±70 px
const MIN_PER_TILE = 40;    // 5 × 8 rows

const FOCUS_ZOOM   = 1.6;   // camera zoom when an item is selected
const GAP_PANEL    = 32;    // px between selected card edge and info panel
const GRID_CELL    = 60;    // world-space grid cell size in px
const CAM_OFFSET_X = 120;   // screen-px to shift camera right on focus (card appears left)

// ─── Single-instance selection ────────────────────────────────────────────────
//  Track by (groupIdx, itemIdx) so only the exact clicked tile-copy highlights.
type SelectedInstance = {
  artifact: ArtifactCanvasItem;
  groupIdx: number; // 0-8 within the 3×3 neighbourhood
  itemIdx:  number; // 0-(N_PER_TILE-1) within the tile
} | null;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// Five scale buckets — max 1.25 preserves the no-overlap guarantee
function cardScale(i: number): number {
  const r = seededRand(i * 13 + 7);
  if (r < 0.12) return 0.75;
  if (r < 0.30) return 0.88;
  if (r < 0.62) return 1.00;
  if (r < 0.84) return 1.12;
  return 1.25;
}

// ─── Tile builder ─────────────────────────────────────────────────────────────
//
//  Assignment strategy:
//    1. Compute all positions, convert to world-space (centred at origin).
//    2. Sort position slots by distance from world origin (= camera start).
//    3. The closest slots get every unique artifact exactly once (shuffled).
//    4. Remaining slots get seeded-random repeats — each artifact independently
//       chosen so no visible sequential pattern.
//
function buildTile(artifacts: ArtifactCanvasItem[]) {
  const n    = Math.max(MIN_PER_TILE, artifacts.length);
  const rows = Math.ceil(n / COLS);

  const TILE_W = COLS * (CARD_W + GAP_X);
  const TILE_H = rows * (CARD_H + GAP_Y) + COL_STAGGER;

  const stagger = Array.from({ length: COLS }, (_, c) =>
    seededRand(c * 97 + 13) * COL_STAGGER,
  );

  const cssPos = Array.from({ length: n }, (_, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    return {
      x: col * (CARD_W + GAP_X) + (seededRand(i * 7 + 1) - 0.5) * JITTER_X * 2,
      y: row * (CARD_H + GAP_Y) + stagger[col] + (seededRand(i * 7 + 2) - 0.5) * JITTER_Y * 2,
    };
  });

  const cx = cssPos.reduce((s, p) => s + p.x + CARD_W / 2, 0) / n;
  const cy = cssPos.reduce((s, p) => s + p.y + CARD_H / 2, 0) / n;

  const positions: [number, number][] = cssPos.map((p) => [
    p.x + CARD_W / 2 - cx,
    -(p.y + CARD_H / 2 - cy),
  ]);

  // Sort slot indices by distance from world origin (camera start position)
  const byDist = positions
    .map((pos, i) => ({ i, d: Math.hypot(pos[0], pos[1]) }))
    .sort((a, b) => a.d - b.d);

  // Seeded shuffle of artifact indices (Fisher-Yates)
  const shuffled = Array.from({ length: artifacts.length }, (_, i) => i);
  for (let j = shuffled.length - 1; j > 0; j--) {
    const k = Math.floor(seededRand(j * 31 + 11) * (j + 1));
    [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
  }

  // Fill: closest slots → one of each unique artifact (shuffled order)
  //       further slots → seeded-random repeats
  const assignment = new Array<number>(n);
  byDist.forEach(({ i }, rank) => {
    if (rank < artifacts.length) {
      assignment[i] = shuffled[rank];
    } else {
      // Independent random pick per slot — avoids sequential repetition
      assignment[i] = Math.floor(seededRand(i * 19 + 3) * artifacts.length);
    }
  });

  const items = Array.from({ length: n }, (_, i) => {
    const artifact = artifacts[assignment[i]];
    return {
      item:  artifact,
      key:   `${artifact._id}-${i}`,
      scale: cardScale(i),
    };
  });

  return { items, positions, TILE_W, TILE_H };
}

// ─── Background dots ──────────────────────────────────────────────────────────
//
//  GLSL shader computes dot positions directly in world-space.
//  Zoom-invariant: mod(worldPos, GRID_CELL) always lands at the same world point
//  regardless of camera zoom — no texture repeat/offset math that breaks on zoom.
//
function GridBackground() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera, size } = useThree();

  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite:  false,
    uniforms: {
      uGridSize:  { value: GRID_CELL },
      uDotRadius: { value: 1.8 },
    },
    vertexShader: `
      varying vec2 vWorldPos;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorldPos = world.xy;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: `
      uniform float uGridSize;
      uniform float uDotRadius;
      varying vec2 vWorldPos;
      void main() {
        // Center within grid cell → distance from nearest dot center
        vec2 cell = mod(vWorldPos + uGridSize * 0.5, uGridSize) - uGridSize * 0.5;
        float dist = length(cell);
        float alpha = 1.0 - smoothstep(uDotRadius - 0.5, uDotRadius + 0.5, dist);
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(0.87, 0.86, 0.85, alpha);
      }
    `,
  }), []);

  useEffect(() => () => material.dispose(), [material]);

  useFrame(() => {
    if (!meshRef.current) return;
    const cam = camera as THREE.OrthographicCamera;
    const visW = size.width  / cam.zoom;
    const visH = size.height / cam.zoom;
    const pw   = visW * 4;
    const ph   = visH * 4;
    meshRef.current.position.set(cam.position.x, cam.position.y, -10);
    meshRef.current.scale.set(pw, ph, 1);
  });

  return (
    <mesh ref={meshRef} material={material} renderOrder={-1}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

// ─── Camera controller ────────────────────────────────────────────────────────
//
//  Wheel → pan (1:1, trackpad provides its own inertia).
//  Select → exponential ease toward target + zoom to FOCUS_ZOOM.
//  First wheel event while in focus mode → exit focus (deselect + zoom back to 1).
//
function CameraController({
  selectTarget,
  zoomTarget,
  focusExitRef,
}: {
  selectTarget:  React.MutableRefObject<{ x: number; y: number } | null>;
  zoomTarget:    React.MutableRefObject<number>;
  focusExitRef:  React.MutableRefObject<(() => void) | null>;
}) {
  const { camera } = useThree();
  const wheel = useRef({ x: 0, y: 0 });
  const inFocus = useRef(false);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (inFocus.current) {
        // First pan after focus → exit focus mode
        focusExitRef.current?.();
        inFocus.current = false;
      }
      selectTarget.current = null;
      zoomTarget.current   = 1.0;
      wheel.current.x += e.deltaX;
      wheel.current.y -= e.deltaY;
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [selectTarget, zoomTarget, focusExitRef]);

  useFrame(() => {
    const cam = camera as THREE.OrthographicCamera;

    // Zoom animation
    const zDiff = zoomTarget.current - cam.zoom;
    if (Math.abs(zDiff) > 0.001) {
      cam.zoom += zDiff * 0.1;
      cam.updateProjectionMatrix();
    } else if (cam.zoom !== zoomTarget.current) {
      cam.zoom = zoomTarget.current;
      cam.updateProjectionMatrix();
    }
    inFocus.current = cam.zoom > 1.01; // track whether we're in focus mode

    // Position animation
    if (selectTarget.current) {
      const { x: tx, y: ty } = selectTarget.current;
      const dx = tx - cam.position.x;
      const dy = ty - cam.position.y;
      cam.position.x += dx * 0.1;
      cam.position.y += dy * 0.1;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
        cam.position.set(tx, ty, cam.position.z);
        selectTarget.current = null;
      }
    } else {
      // Divide by zoom for consistent screen-pixel pan feel
      cam.position.x += wheel.current.x / cam.zoom;
      cam.position.y += wheel.current.y / cam.zoom;
      wheel.current = { x: 0, y: 0 };
    }
  });

  return null;
}

// ─── Panel positioner ─────────────────────────────────────────────────────────
//
//  Positions info panel at the top-right of the selected card, every frame.
//  Card is shifted left (camera offset), so panel appears to its right naturally.
//
function PanelPositioner({
  worldPosRef,
  halfWRef,
  halfHRef,
  panelX,
  panelY,
}: {
  worldPosRef: React.MutableRefObject<[number, number] | null>;
  halfWRef:    React.MutableRefObject<number>;
  halfHRef:    React.MutableRefObject<number>;
  panelX:      MotionValue<number>;
  panelY:      MotionValue<number>;
}) {
  const { camera, size } = useThree();

  useFrame(() => {
    const wp = worldPosRef.current;
    if (!wp) return;
    const cam = camera as THREE.OrthographicCamera;
    // world → screen (orthographic, zoom-aware)
    const sx = (wp[0] - cam.position.x) * cam.zoom + size.width  / 2;
    const sy = -(wp[1] - cam.position.y) * cam.zoom + size.height / 2;
    // Panel: right of card, top-aligned with card top edge
    panelX.set(sx + halfWRef.current * cam.zoom + GAP_PANEL);
    panelY.set(sy - halfHRef.current * cam.zoom);
  });

  return null;
}

// ─── Infinite tile neighbourhood (3 × 3 = 9 groups) ─────────────────────────
function InfiniteTiles({
  tile,
  videoTextures,
  selected,
  onSelect,
  selectTarget,
  zoomTarget,
  focusExitRef,
  worldPosRef,
  halfWRef,
  halfHRef,
  panelX,
  panelY,
}: {
  tile:          ReturnType<typeof buildTile>;
  videoTextures: Map<string, THREE.VideoTexture>;
  selected:      SelectedInstance;
  onSelect:      (item: ArtifactCanvasItem, point: [number, number], halfW: number, halfH: number, groupIdx: number, itemIdx: number) => void;
  selectTarget:  React.MutableRefObject<{ x: number; y: number } | null>;
  zoomTarget:    React.MutableRefObject<number>;
  focusExitRef:  React.MutableRefObject<(() => void) | null>;
  worldPosRef:   React.MutableRefObject<[number, number] | null>;
  halfWRef:      React.MutableRefObject<number>;
  halfHRef:      React.MutableRefObject<number>;
  panelX:        MotionValue<number>;
  panelY:        MotionValue<number>;
}) {
  const { camera } = useThree();
  const { TILE_W, TILE_H, items, positions } = tile;

  const groupRefs = useRef<(THREE.Group | null)[]>(Array(9).fill(null));
  const prevTile  = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let k = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        groupRefs.current[k]?.position.set(dx * TILE_W, dy * TILE_H, 0);
        k++;
      }
    }
    prevTile.current = { x: 0, y: 0 };
  }, [TILE_W, TILE_H]);

  useFrame(() => {
    const tx = Math.round(camera.position.x / TILE_W);
    const ty = Math.round(camera.position.y / TILE_H);
    if (tx === prevTile.current.x && ty === prevTile.current.y) return;
    prevTile.current = { x: tx, y: ty };
    let k = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        groupRefs.current[k]?.position.set((tx + dx) * TILE_W, (ty + dy) * TILE_H, 0);
        k++;
      }
    }
  });

  return (
    <>
      <GridBackground />
      <CameraController
        selectTarget={selectTarget}
        zoomTarget={zoomTarget}
        focusExitRef={focusExitRef}
      />
      <PanelPositioner
        worldPosRef={worldPosRef}
        halfWRef={halfWRef}
        halfHRef={halfHRef}
        panelX={panelX}
        panelY={panelY}
      />
      {Array.from({ length: 9 }, (_, k) => {
        const dx = (k % 3) - 1;
        const dy = Math.floor(k / 3) - 1;
        return (
          <group
            key={k}
            ref={(el) => { groupRefs.current[k] = el; }}
            position={[dx * TILE_W, dy * TILE_H, 0]}
          >
            {items.map(({ item, key, scale }, i) => (
              <Suspense key={key} fallback={null}>
                <ArtifactMesh
                  artifact={item}
                  worldPos={positions[i] ?? [0, 0]}
                  isSelected={
                    selected !== null &&
                    selected.groupIdx === k &&
                    selected.itemIdx  === i
                  }
                  cardScale={scale}
                  onSelect={(point) => onSelect(item, point, (CARD_W * scale) / 2, (CARD_H * scale) / 2, k, i)}
                  videoTexture={videoTextures.get(item._id)}
                />
              </Suspense>
            ))}
          </group>
        );
      })}
    </>
  );
}

// ─── Loading bar ──────────────────────────────────────────────────────────────
function LoadingBar({ loading, barDone }: { loading: boolean; barDone: boolean }) {
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loading-bar"
          className="fixed bottom-0 left-0 right-0 z-50 h-[2px] bg-stone-100"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <motion.div
            className="h-full bg-stone-400"
            initial={{ width: "0%" }}
            animate={{ width: barDone ? "100%" : "80%" }}
            transition={{
              duration: barDone ? 0.25 : 2.0,
              ease: barDone ? "easeOut" : [0.05, 0.6, 0.9, 1.0],
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function InfiniteCanvas({ artifacts }: { artifacts: ArtifactCanvasItem[] }) {
  const [selected, setSelected]   = useState<SelectedInstance>(null);
  const [ready, setReady]          = useState(false);
  const [loading, setLoading]      = useState(true);
  const [barDone, setBarDone]      = useState(false);
  const selectTargetRef            = useRef<{ x: number; y: number } | null>(null);
  const selectedWorldPosRef        = useRef<[number, number] | null>(null);
  const selectedHalfWRef           = useRef<number>(CARD_W / 2);
  const selectedHalfHRef           = useRef<number>(CARD_H / 2);
  const zoomTargetRef              = useRef<number>(0.5);

  // focusExitRef is kept current every render so CameraController never has a stale closure
  const focusExitRef = useRef<(() => void) | null>(null);

  const panelX = useMotionValue(-9999);
  const panelY = useMotionValue(0);

  const tile = useMemo(() => buildTile(artifacts), [artifacts]);

  // ── Video textures ─────────────────────────────────────────────────────────
  const videoTextures = useMemo(() => {
    const map = new Map<string, THREE.VideoTexture>();
    if (typeof document === "undefined") return map;

    artifacts.forEach((a) => {
      const m = a.firstMedia;
      if (m?._type !== "galleryVideo" || !m.videoFileUrl) return;

      const vid           = document.createElement("video");
      vid.src             = m.videoFileUrl;
      vid.muted           = true;
      vid.autoplay        = true;
      vid.loop            = true;
      vid.playsInline     = true;
      vid.crossOrigin     = "anonymous";
      Object.assign(vid.style, {
        position: "fixed", opacity: "0", pointerEvents: "none",
        width: "1px", height: "1px", top: "0", left: "0",
      });
      document.body.appendChild(vid);
      vid.play().catch(() => {
        const retry = () => vid.play().catch(() => {});
        document.addEventListener("click",      retry, { once: true });
        document.addEventListener("touchstart", retry, { once: true });
      });

      const tex = new THREE.VideoTexture(vid);
      tex.colorSpace = THREE.SRGBColorSpace;
      map.set(a._id, tex);
    });

    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artifacts.length]);

  useEffect(() => {
    return () => {
      videoTextures.forEach((tex) => {
        const vid = tex.image as HTMLVideoElement;
        vid.pause();
        vid.parentNode?.removeChild(vid);
        tex.dispose();
      });
    };
  }, [videoTextures]);

  // Entrance: wait for Three.js textures to load, then fade in + zoom to 1.0
  useEffect(() => {
    let done = false;
    let innerTimer: ReturnType<typeof setTimeout> | null = null;

    const finish = () => {
      if (done) return;
      done = true;
      setBarDone(true);
      innerTimer = setTimeout(() => {
        setLoading(false);
        setReady(true);
        zoomTargetRef.current = 1.0;
      }, 350);
    };

    const mgr      = THREE.DefaultLoadingManager;
    const prevLoad = mgr.onLoad;
    mgr.onLoad = () => { prevLoad?.(); finish(); };
    // Fallback: some assets (videos, cached images) may not trigger onLoad
    const fallback = setTimeout(finish, 2000);

    return () => {
      clearTimeout(fallback);
      if (innerTimer) clearTimeout(innerTimer);
      mgr.onLoad = prevLoad;
      done = true;
    };
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleDeselect = useCallback(() => {
    setSelected(null);
    selectedWorldPosRef.current = null;
    zoomTargetRef.current       = 1.0;
    panelX.set(-9999);
  }, [panelX]);

  // Keep focusExitRef current (safe to call from CameraController's wheel handler)
  focusExitRef.current = handleDeselect;

  const handleSelect = useCallback(
    (
      item:     ArtifactCanvasItem,
      point:    [number, number],
      halfW:    number,
      halfH:    number,
      groupIdx: number,
      itemIdx:  number,
    ) => {
      setSelected({ artifact: item, groupIdx, itemIdx });
      // Shift camera right so card appears slightly left — info panel fits to its right
      selectTargetRef.current     = { x: point[0] + CAM_OFFSET_X / FOCUS_ZOOM, y: point[1] };
      selectedWorldPosRef.current = point;
      selectedHalfWRef.current    = halfW;
      selectedHalfHRef.current    = halfH;
      zoomTargetRef.current       = FOCUS_ZOOM;
    },
    [],
  );

  if (artifacts.length === 0) {
    return (
      <div className="w-screen h-dvh flex items-center justify-center bg-stone-50">
        <p className="text-sm text-stone-400">no artifacts yet</p>
      </div>
    );
  }

  return (
    <div
      className="w-screen h-dvh relative"
      data-lenis-prevent
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* Loading bar — visible while assets are loading, exits on its own */}
      <LoadingBar loading={loading} barDone={barDone} />

      {/* Canvas wrapper — fades in once assets are ready, then camera zooms 0.5→1 */}
      <div style={{ position: "absolute", inset: 0, opacity: ready ? 1 : 0, transition: "opacity 0.5s ease" }}>
        <Canvas
          orthographic
          camera={{ zoom: 0.5, position: [0, 0, 100], near: 0.1, far: 10000 }}
          gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
          onPointerMissed={handleDeselect}
        >
          <InfiniteTiles
            tile={tile}
            videoTextures={videoTextures}
            selected={selected}
            onSelect={handleSelect}
            selectTarget={selectTargetRef}
            zoomTarget={zoomTargetRef}
            focusExitRef={focusExitRef}
            worldPosRef={selectedWorldPosRef}
            halfWRef={selectedHalfWRef}
            halfHRef={selectedHalfHRef}
            panelX={panelX}
            panelY={panelY}
          />
        </Canvas>
      </div>

      {/* Info panel — tracks the selected card in real-time via motion values */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={`${selected.groupIdx}-${selected.itemIdx}`}
            className="fixed z-50 pointer-events-none"
            style={{ left: 0, top: 0, x: panelX, y: panelY }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="pointer-events-auto">
              <ArtifactInfo artifact={selected.artifact} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
