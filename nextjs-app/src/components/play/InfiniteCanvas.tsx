"use client";

import { useRef, useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { motion, AnimatePresence, useMotionValue, type MotionValue } from "motion/react";
import * as THREE from "three";
import type { ArtifactCanvasItem } from "@/sanity/queries";
import { ArtifactMesh, CARD_W, CARD_H } from "./ArtifactMesh";
import { getCardHeight, _videoDimsCache, MIN_CARD_H, MAX_CARD_H, triggerIntro } from "@/lib/artifact-utils";
import { ArtifactInfo } from "./ArtifactInfo";

// ─── Tunable params ────────────────────────────────────────────────────────────
//
//  All knobs live in one object.  Tweakpane (dev only) writes directly to a
//  MutableRefObject<Params> — zero React re-renders for real-time sliders.
//  Layout params (cols / gaps / jitter / scale) call onLayoutChange() → tileVersion++
//  → buildTile recomputes.  Camera / visual params are read every frame from the ref.
//
type Params = {
  // ── Tile layout (change → tile rebuild) ─────────────────────────────────────
  cols:        number; // grid columns
  gapX:        number; // extra px between cols  (cell_w = CARD_W + gapX)
  gapY:        number; // extra px between rows  (cell_h = CARD_H + gapY)
  colStagger:  number; // random vertical offset per column (px)
  jitterX:     number; // ±px random horizontal nudge per item
  jitterY:     number; // ±px random vertical nudge per item
  minPerTile:  number; // min slot count per tile
  scaleMin:    number; // smallest card scale
  scaleMax:    number; // largest  card scale
  // ── Camera (live — no rebuild) ───────────────────────────────────────────────
  focusZoom:   number; // orthographic zoom when an item is selected
  camOffsetX:  number; // camera shifts right on focus (card left, panel fits right)
  focusVCenter: number; // vertical position of focused item (0=top · 0.5=center · 1=bottom)
  // ── Info panel (live) ────────────────────────────────────────────────────────
  gapPanel:    number; // px gap between card right edge and info panel
  // ── Background dots (live — uniform update in useFrame) ──────────────────────
  gridCell:    number; // world-space dot grid cell size
  dotRadius:   number; // dot radius in world units
};

const DEFAULT_PARAMS: Params = {
  cols:        4,
  gapX:        300,
  gapY:        260,
  colStagger:  200,
  jitterX:     40,
  jitterY:     40,
  minPerTile:  40,
  scaleMin:    0.75,
  scaleMax:    1.25,
  focusZoom:    2.0,
  camOffsetX:   200,
  focusVCenter: 0.44,
  gapPanel:    80,
  gridCell:    80,
  dotRadius:   2.0,
};

// Approximate min/max visual gap between adjacent card edges
function gapStats(p: Params) {
  const cellW = CARD_W + p.gapX;
  const cellH = CARD_H + p.gapY;
  return {
    minGapX: Math.round(cellW - 2 * p.jitterX - CARD_W * p.scaleMax),
    maxGapX: Math.round(cellW + 2 * p.jitterX - CARD_W * p.scaleMin),
    minGapY: Math.round(cellH - 2 * p.jitterY - CARD_H * p.scaleMax),
    maxGapY: Math.round(cellH + 2 * p.jitterY - CARD_H * p.scaleMin),
  };
}

// ─── Single-instance selection ────────────────────────────────────────────────
type SelectedInstance = {
  artifact: ArtifactCanvasItem;
  groupIdx: number;
  itemIdx:  number;
} | null;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// Bell-ish distribution in [scaleMin, scaleMax]
function cardScale(i: number, scaleMin: number, scaleMax: number): number {
  const r = seededRand(i * 13 + 7);
  let t: number;
  if      (r < 0.12) t = 0.00;
  else if (r < 0.30) t = 0.25;
  else if (r < 0.62) t = 0.50;
  else if (r < 0.84) t = 0.75;
  else               t = 1.00;
  return scaleMin + t * (scaleMax - scaleMin);
}

// ─── Tile builder ─────────────────────────────────────────────────────────────
//
//  Neighbour constraint — toroidal 8-connected coloring:
//
//    Pass 1 (byDist, centre→edge):
//      Each slot blocks artifact indices already assigned to any of its
//      8 wrap-around grid neighbours (toroidal = cross-tile seam aware).
//      Processes center-to-edge so unique artifacts land near the origin.
//
//    Pass 2 (post-process, up to 4 iterations):
//      Scan all slots; any slot still conflicting with a wrap-around neighbour
//      is reassigned to an artifact not used by ANY of its 8 neighbours.
//      Repeats until clean or max iterations reached (handles the cases
//      where both seam slots were unassigned when the other was processed).
//
function buildTile(artifacts: ArtifactCanvasItem[], p: Params) {
  const {
    cols: COLS, gapX: GAP_X, gapY: GAP_Y,
    colStagger: COL_STAGGER, jitterX: JITTER_X, jitterY: JITTER_Y,
    minPerTile: MIN_PER_TILE, scaleMin, scaleMax,
  } = p;

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

  // Positions approx. (CARD_H pour tous) — uniquement pour le tri centre→bord
  const approxCx = cssPos.reduce((s, q) => s + q.x + CARD_W / 2, 0) / n;
  const approxCy = cssPos.reduce((s, q) => s + q.y + CARD_H / 2, 0) / n;
  const approxPos: [number, number][] = cssPos.map((q) => [
    q.x + CARD_W / 2 - approxCx,
    -(q.y + CARD_H / 2 - approxCy),
  ]);

  const byDist = approxPos
    .map((pos, i) => ({ i, d: Math.hypot(pos[0], pos[1]) }))
    .sort((a, b) => a.d - b.d);

  // Seeded Fisher-Yates shuffle
  const shuffled = Array.from({ length: artifacts.length }, (_, i) => i);
  for (let j = shuffled.length - 1; j > 0; j--) {
    const k = Math.floor(seededRand(j * 31 + 11) * (j + 1));
    [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
  }

  const colOf = (i: number) => i % COLS;
  const rowOf = (i: number) => Math.floor(i / COLS);
  // Toroidal wrap — makes the tile tileable; cross-seam neighbours are visible
  const slotW = (c: number, r: number): number =>
    (((r % rows) + rows) % rows) * COLS + (((c % COLS) + COLS) % COLS);

  const allIdx   = Array.from({ length: artifacts.length }, (_, k) => k);
  const assignment: number[] = new Array(n).fill(-1);

  // ── Pass 1: centre-to-edge greedy assignment ───────────────────────────────
  byDist.forEach(({ i: si }, rank) => {
    const col = colOf(si);
    const row = rowOf(si);

    const blocked = new Set<number>();
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (!dc && !dr) continue;
        const ni = slotW(col + dc, row + dr);
        if (ni !== si && assignment[ni] !== -1) blocked.add(assignment[ni]);
      }
    }

    const pool       = allIdx.filter(k => !blocked.has(k));
    const candidates = pool.length > 0 ? pool : allIdx;

    if (rank < artifacts.length && candidates.includes(shuffled[rank])) {
      assignment[si] = shuffled[rank];
    } else {
      assignment[si] = candidates[
        Math.floor(seededRand(si * 23 + rank * 11 + 5) * candidates.length)
      ];
    }
  });

  // ── Pass 2: fix remaining seam conflicts (up to 4 sweeps) ─────────────────
  for (let sweep = 0; sweep < 4; sweep++) {
    let anyFixed = false;

    for (let si = 0; si < n; si++) {
      const col = colOf(si);
      const row = rowOf(si);

      // Collect all neighbour artifacts (toroidal)
      const neighborArtifacts = new Set<number>();
      let   hasConflict       = false;
      for (let dc = -1; dc <= 1; dc++) {
        for (let dr = -1; dr <= 1; dr++) {
          if (!dc && !dr) continue;
          const ni = slotW(col + dc, row + dr);
          if (ni === si) continue;
          const a = assignment[ni];
          neighborArtifacts.add(a);
          if (a === assignment[si]) hasConflict = true;
        }
      }

      if (!hasConflict) continue;

      const candidates = allIdx.filter(k => !neighborArtifacts.has(k));
      if (candidates.length > 0) {
        assignment[si] = candidates[
          Math.floor(seededRand(si * 41 + sweep * 23 + 7) * candidates.length)
        ];
        anyFixed = true;
      }
    }

    if (!anyFixed) break;
  }

  // Hauteurs réelles par slot — connues seulement après assignation
  const slotH = Array.from({ length: n }, (_, i) =>
    getCardHeight(artifacts[assignment[i]]),
  );

  // Positions finales avec les vraies hauteurs — centrage vertical correct
  const cx = cssPos.reduce((s, q) => s + q.x + CARD_W / 2, 0) / n;
  const cy = cssPos.reduce((s, q, i) => s + q.y + slotH[i] / 2, 0) / n;
  const positions: [number, number][] = cssPos.map((q, i) => [
    q.x + CARD_W / 2 - cx,
    -(q.y + slotH[i] / 2 - cy),
  ]);

  const items = Array.from({ length: n }, (_, i) => ({
    item:  artifacts[assignment[i]],
    key:   `${artifacts[assignment[i]]._id}-${i}`,
    scale: cardScale(i, scaleMin, scaleMax),
    cardH: slotH[i],
  }));

  return { items, positions, TILE_W, TILE_H };
}

// ─── Background dots ──────────────────────────────────────────────────────────
function GridBackground({ paramsRef }: { paramsRef: React.MutableRefObject<Params> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera, size } = useThree();

  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite:  false,
    uniforms: {
      uGridSize:  { value: DEFAULT_PARAMS.gridCell },
      uDotRadius: { value: DEFAULT_PARAMS.dotRadius },
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
    const q   = paramsRef.current;
    const cam = camera as THREE.OrthographicCamera;
    material.uniforms.uGridSize.value  = q.gridCell;
    material.uniforms.uDotRadius.value = q.dotRadius;
    const visW = size.width  / cam.zoom;
    const visH = size.height / cam.zoom;
    meshRef.current.position.set(cam.position.x, cam.position.y, -10);
    meshRef.current.scale.set(visW * 4, visH * 4, 1);
  });

  return (
    <mesh ref={meshRef} material={material} renderOrder={-1}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

// ─── Camera controller ────────────────────────────────────────────────────────
//
//  Intro zoom : time-based easeInOutCubic over INTRO_ZOOM_DURATION ms,
//               starting INTRO_ZOOM_DELAY ms after `active` flips true.
//  Focus snap : position + zoom animated together on the same easeOutCubic curve
//               so they always arrive at the same instant (no disjoint easing).
//  Exit focus : exponential lerp on zoom only (instant-feel, no duration overhead).
//
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
// Same family as the focusout exponential lerp — fast start, smooth cinematic settle
function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

const INTRO_ZOOM_DELAY    = 60;   // ms — micro delay, zoom starts with the cards
const INTRO_ZOOM_DURATION = 1400; // ms — slow, smooth camera pull-back
const FOCUS_DURATION      = 600;  // ms — focus snap
// Panel appears once media is nearly stable (Framer Motion delay, not a timer)
const PANEL_DELAY_S       = (FOCUS_DURATION * 0.75) / 1000; // seconds for Framer Motion

function CameraController({
  selectTarget, zoomTarget, focusExitRef, paramsRef, active,
}: {
  selectTarget: React.MutableRefObject<{ x: number; y: number } | null>;
  zoomTarget:   React.MutableRefObject<number>;
  focusExitRef: React.MutableRefObject<(() => void) | null>;
  paramsRef:    React.MutableRefObject<Params>;
  active:       boolean;
}) {
  const { camera } = useThree();
  const wheel    = useRef({ x: 0, y: 0 });
  const inFocus  = useRef(false);
  // Time-based intro zoom animation (null = not running)
  const zoomAnim  = useRef<{ startTime: number; fromZoom: number } | null>(null);
  // Time-based focus animation — position + zoom synchronized on the same curve
  const focusAnim = useRef<{
    startTime: number;
    fromX: number; fromY: number; toX: number; toY: number;
    fromZoom: number; toZoom: number;
  } | null>(null);

  // Wheel → accumulate raw deltas, cancel intro zoom if still running
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (inFocus.current) {
        focusExitRef.current?.();
        inFocus.current = false;
      }
      if (zoomAnim.current) {
        zoomAnim.current   = null;   // abort intro zoom — user is already navigating
        zoomTarget.current = 1.0;
      }
      focusAnim.current    = null;   // abort any in-progress focus snap
      selectTarget.current = null;
      zoomTarget.current   = 1.0;
      wheel.current.x     += e.deltaX;
      wheel.current.y     -= e.deltaY;
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [selectTarget, zoomTarget, focusExitRef]);

  // Intro — runs each time the canvas becomes active
  useEffect(() => {
    if (!active) {
      wheel.current      = { x: 0, y: 0 };
      zoomAnim.current   = null;
      focusAnim.current  = null;
      zoomTarget.current = 1.0;
      return;
    }
    const cam = camera as THREE.OrthographicCamera;
    cam.zoom           = 0.5;
    cam.updateProjectionMatrix();
    zoomTarget.current = 0.5; // keep normal lerp idle during the delay
    wheel.current      = { x: 0, y: 0 };
    triggerIntro();            // fire card opacity+scale animations

    const t = setTimeout(() => {
      if (selectTarget.current) return; // user already picked a card, skip
      zoomTarget.current = 1.0;
      zoomAnim.current   = { startTime: performance.now(), fromZoom: cam.zoom };
    }, INTRO_ZOOM_DELAY);

    return () => { clearTimeout(t); zoomAnim.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, camera]);

  useFrame(() => {
    const cam = camera as THREE.OrthographicCamera;

    // Cancel intro zoom if selection starts mid-animation
    if (zoomAnim.current && selectTarget.current) {
      zoomAnim.current = null;
    }

    // Detect new selectTarget → initiate synchronized focus animation
    if (selectTarget.current && !focusAnim.current && !zoomAnim.current) {
      focusAnim.current = {
        startTime: performance.now(),
        fromX:     cam.position.x,
        fromY:     cam.position.y,
        toX:       selectTarget.current.x,
        toY:       selectTarget.current.y,
        fromZoom:  cam.zoom,
        toZoom:    zoomTarget.current,
      };
    }

    // ── Zoom + position ──────────────────────────────────────────────────────
    if (zoomAnim.current) {
      // Intro: time-based easeInOutCubic — slow start, smooth settle
      const elapsed = performance.now() - zoomAnim.current.startTime;
      const t       = Math.min(1, elapsed / INTRO_ZOOM_DURATION);
      cam.zoom      = zoomAnim.current.fromZoom + (1.0 - zoomAnim.current.fromZoom) * easeInOutCubic(t);
      cam.updateProjectionMatrix();
      if (t >= 1) { cam.zoom = 1.0; zoomAnim.current = null; }

    } else if (focusAnim.current) {
      // Focus: position + zoom move on the same easeOutCubic curve
      const elapsed = performance.now() - focusAnim.current.startTime;
      const t       = Math.min(1, elapsed / FOCUS_DURATION);
      const ease    = easeOutQuart(t);
      const { fromX, fromY, toX, toY, fromZoom, toZoom } = focusAnim.current;
      cam.position.x = fromX + (toX - fromX) * ease;
      cam.position.y = fromY + (toY - fromY) * ease;
      cam.zoom       = fromZoom + (toZoom - fromZoom) * ease;
      cam.updateProjectionMatrix();
      if (t >= 1) {
        cam.position.set(toX, toY, cam.position.z);
        cam.zoom = toZoom;
        cam.updateProjectionMatrix();
        selectTarget.current = null;
        focusAnim.current    = null;
      }

    } else {
      // Idle: zoom lerp for exit-focus, then wheel pan
      const zDiff = zoomTarget.current - cam.zoom;
      if (Math.abs(zDiff) > 0.001) {
        cam.zoom += zDiff * 0.16;
        cam.updateProjectionMatrix();
      } else if (cam.zoom !== zoomTarget.current) {
        cam.zoom = zoomTarget.current;
        cam.updateProjectionMatrix();
      }
      cam.position.x += wheel.current.x / cam.zoom;
      cam.position.y += wheel.current.y / cam.zoom;
      wheel.current = { x: 0, y: 0 };
    }

    inFocus.current = cam.zoom > 1.01;
  });

  return null;
}

// ─── Panel positioner ─────────────────────────────────────────────────────────
function PanelPositioner({
  worldPosRef, halfWRef, halfHRef, panelX, panelY, paramsRef,
}: {
  worldPosRef: React.MutableRefObject<[number, number] | null>;
  halfWRef:    React.MutableRefObject<number>;
  halfHRef:    React.MutableRefObject<number>;
  panelX:      MotionValue<number>;
  panelY:      MotionValue<number>;
  paramsRef:   React.MutableRefObject<Params>;
}) {
  const { camera, size } = useThree();

  useFrame(() => {
    const wp = worldPosRef.current;
    if (!wp) return;
    const cam = camera as THREE.OrthographicCamera;
    const sx  = (wp[0] - cam.position.x) * cam.zoom + size.width  / 2;
    const sy  = -(wp[1] - cam.position.y) * cam.zoom + size.height / 2;
    panelX.set(sx + halfWRef.current * cam.zoom + paramsRef.current.gapPanel);
    panelY.set(sy - halfHRef.current * cam.zoom); // card top edge
  });

  return null;
}

// ─── Infinite tile neighbourhood (3 × 3 = 9 groups) ─────────────────────────
function InfiniteTiles({
  tile, videoTextures, selected, onSelect,
  selectTarget, zoomTarget, focusExitRef,
  worldPosRef, halfWRef, halfHRef, panelX, panelY, paramsRef, active,
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
  paramsRef:     React.MutableRefObject<Params>;
  active:        boolean;
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
      <GridBackground paramsRef={paramsRef} />
      <CameraController
        selectTarget={selectTarget}
        zoomTarget={zoomTarget}
        focusExitRef={focusExitRef}
        paramsRef={paramsRef}
        active={active}
      />
      <PanelPositioner
        worldPosRef={worldPosRef}
        halfWRef={halfWRef}
        halfHRef={halfHRef}
        panelX={panelX}
        panelY={panelY}
        paramsRef={paramsRef}
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
            {items.map(({ item, key, scale, cardH }, i) => (
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
                  cardH={cardH}
                  onSelect={(point) => onSelect(item, point, (CARD_W * scale) / 2, (cardH * scale) / 2, k, i)}
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

// ─── Debug pane (dev only) ────────────────────────────────────────────────────
const IS_DEV = process.env.NODE_ENV !== "production";

function DebugPane({
  paramsRef,
  onLayoutChange,
}: {
  paramsRef:      React.MutableRefObject<Params>;
  onLayoutChange: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!IS_DEV || !containerRef.current) return;

    let disposed  = false;
    let disposeFn: (() => void) | null = null;

    import("tweakpane").then(({ Pane }) => {
      if (disposed || !containerRef.current) return;

      const pane = new Pane({ container: containerRef.current, title: "Canvas debug" });
      disposeFn = () => pane.dispose();

      const q = paramsRef.current;

      // ── Layout ──────────────────────────────────────────────────────────────
      const layout = pane.addFolder({ title: "Layout", expanded: true });
      layout.addBinding(q, "cols",       { label: "columns",  min: 2,  max: 8,   step: 1  }).on("change", onLayoutChange);
      layout.addBinding(q, "gapX",       { label: "gap X",    min: 50, max: 700, step: 10 }).on("change", onLayoutChange);
      layout.addBinding(q, "gapY",       { label: "gap Y",    min: 50, max: 600, step: 10 }).on("change", onLayoutChange);
      layout.addBinding(q, "colStagger", { label: "stagger",  min: 0,  max: 500, step: 10 }).on("change", onLayoutChange);
      layout.addBinding(q, "jitterX",    { label: "jitter X", min: 0,  max: 250, step: 5  }).on("change", onLayoutChange);
      layout.addBinding(q, "jitterY",    { label: "jitter Y", min: 0,  max: 250, step: 5  }).on("change", onLayoutChange);

      // ── Gap stats (read-only monitors) ──────────────────────────────────────
      const stats       = gapStats(q);
      const statsFolder = pane.addFolder({ title: "Gap stats (px)", expanded: false });
      statsFolder.addBinding(stats, "minGapX", { label: "min X", readonly: true });
      statsFolder.addBinding(stats, "maxGapX", { label: "max X", readonly: true });
      statsFolder.addBinding(stats, "minGapY", { label: "min Y", readonly: true });
      statsFolder.addBinding(stats, "maxGapY", { label: "max Y", readonly: true });
      layout.on("change", () => { Object.assign(stats, gapStats(paramsRef.current)); pane.refresh(); });

      // ── Card sizes ──────────────────────────────────────────────────────────
      const cards = pane.addFolder({ title: "Card sizes", expanded: false });
      cards.addBinding(q, "scaleMin", { label: "scale min", min: 0.3, max: 1.0, step: 0.05 }).on("change", onLayoutChange);
      cards.addBinding(q, "scaleMax", { label: "scale max", min: 1.0, max: 2.0, step: 0.05 }).on("change", onLayoutChange);

      // ── Camera ──────────────────────────────────────────────────────────────
      const cam = pane.addFolder({ title: "Camera", expanded: false });
      cam.addBinding(q, "focusZoom",    { label: "focus zoom",         min: 1.0, max: 3.0, step: 0.05 });
      cam.addBinding(q, "camOffsetX",   { label: "cam offset X",       min: 0,   max: 400, step: 5    });
      cam.addBinding(q, "focusVCenter", { label: "v-center (0↑ · 1↓)", min: 0.1, max: 0.9, step: 0.01 });

      // ── Info panel ──────────────────────────────────────────────────────────
      const panel = pane.addFolder({ title: "Info panel", expanded: false });
      panel.addBinding(q, "gapPanel", { label: "gap", min: 8, max: 100, step: 4 });

      // ── Dots ────────────────────────────────────────────────────────────────
      const dots = pane.addFolder({ title: "Dots", expanded: false });
      dots.addBinding(q, "gridCell",  { label: "spacing", min: 20,  max: 200, step: 5   });
      dots.addBinding(q, "dotRadius", { label: "radius",  min: 0.5, max: 6.0, step: 0.1 });
    });

    return () => {
      disposed = true;
      disposeFn?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!IS_DEV) return null;
  return (
    <div
      ref={containerRef}
      className="fixed top-4 left-4 z-[200] pointer-events-auto"
    />
  );
}

// ─── Loading bar ──────────────────────────────────────────────────────────────
//
//  Full-screen overlay that masks the Three.js WebGL init freeze.
//  Shows on first visit only — revisits have everything cached so no freeze.
//  Bar animates from 0 → 100 % over ~1.2 s, then the overlay fades out.
//
function LoadingBar({ loading }: { loading: boolean }) {
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loading-bar"
          className="fixed inset-0 z-[90] bg-stone-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="w-16 h-[3px] rounded-full bg-stone-200 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-stone-400"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.2, ease: [0.05, 0.55, 0.85, 1.0] }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Module-level persistence (survives React remounts / soft navigations) ────
//
//  _hasVisited  : true after first mount → skip entrance animation on revisit
//  _videoCache  : VideoTexture keyed by artifact._id — never disposed so videos
//                 keep playing in background and are instantly reusable on return
//
let _hasVisited = false;
const _videoCache = new Map<string, THREE.VideoTexture>();

// ─── Main component ────────────────────────────────────────────────────────────
export function InfiniteCanvas({ artifacts, active = true }: { artifacts: ArtifactCanvasItem[]; active?: boolean }) {
  // firstMount captures _hasVisited at construction time (before we flip it)
  const firstMount = useRef(!_hasVisited);

  const [selected, setSelected]   = useState<SelectedInstance>(null);
  const [loading, setLoading]     = useState(firstMount.current);
  const [tileVersion, setTileVersion] = useState(0);

  const paramsRef           = useRef<Params>({ ...DEFAULT_PARAMS });
  const selectTargetRef     = useRef<{ x: number; y: number } | null>(null);
  const selectedWorldPosRef = useRef<[number, number] | null>(null);
  const selectedHalfWRef    = useRef<number>(CARD_W / 2);
  const selectedHalfHRef    = useRef<number>(CARD_H / 2);
  // Always start at 0.5 — CameraController handles the dezoom on each visit
  const zoomTargetRef       = useRef<number>(0.5);
  const focusExitRef        = useRef<(() => void) | null>(null);

  const panelX = useMotionValue(-9999);
  const panelY = useMotionValue(0);

  const handleLayoutChange = useCallback(() => setTileVersion(v => v + 1), []);

  const tile = useMemo(
    () => buildTile(artifacts, paramsRef.current),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [artifacts, tileVersion],
  );

  // ── Video textures — backed by module-level cache so videos survive remounts ──
  //
  //  On first visit: creates video elements + textures, stores in _videoCache.
  //  On revisit: _videoCache already populated → instant, videos still playing.
  //  No cleanup on unmount: muted 1px videos keep playing in background;
  //  they're reused the moment the user comes back.
  //
  const videoTextures = useMemo(() => {
    if (typeof document === "undefined") return _videoCache;

    artifacts.forEach((a) => {
      if (_videoCache.has(a._id)) return; // already created, reuse
      const m = a.firstMedia;
      if (m?._type !== "galleryVideo" || !m.videoFileUrl) return;

      const vid       = document.createElement("video");
      vid.crossOrigin = "anonymous";   // MUST be before src to avoid CORS taint
      vid.src         = m.videoFileUrl;
      vid.muted       = true;
      vid.autoplay    = true;
      vid.loop        = true;
      vid.playsInline = true;
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
      _videoCache.set(a._id, tex);
    });

    return _videoCache;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artifacts.length]);

  // Détection du ratio réel des vidéos — Sanity ne stocke pas les dimensions.
  // Quand loadedmetadata est disponible, on met à jour le cache et on rebuild la tile.
  useEffect(() => {
    const cleanups: (() => void)[] = [];

    artifacts.forEach((a) => {
      if (a.firstMedia?._type !== "galleryVideo") return;
      if (_videoDimsCache.has(a._id)) return; // déjà détecté

      const tex = _videoCache.get(a._id);
      if (!tex) return;
      const vid = tex.image as HTMLVideoElement;

      const update = () => {
        if (!vid.videoWidth || !vid.videoHeight) return;
        const h = Math.max(MIN_CARD_H, Math.min(MAX_CARD_H,
          Math.round(CARD_W * vid.videoHeight / vid.videoWidth),
        ));
        _videoDimsCache.set(a._id, h);
        handleLayoutChange(); // reconstruit la tile avec le vrai ratio
      };

      if (vid.readyState >= 1 /* HAVE_METADATA */) {
        update();
      } else {
        vid.addEventListener("loadedmetadata", update, { once: true });
        cleanups.push(() => vid.removeEventListener("loadedmetadata", update));
      }
    });

    return () => cleanups.forEach((fn) => fn());
  }, [artifacts, handleLayoutChange]);

  // Mark visited on mount (used by loading bar — shows only on first visit)
  useEffect(() => { _hasVisited = true; }, []);

  // Loading bar — only on first visit (revisits have all assets cached).
  // Simple fixed-duration timer — more reliable than DefaultLoadingManager
  // which can fire prematurely or not at all depending on asset caching.
  useEffect(() => {
    if (!firstMount.current) return;
    const t = setTimeout(() => setLoading(false), 1600);
    return () => clearTimeout(t);
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleDeselect = useCallback(() => {
    setSelected(null);
    selectedWorldPosRef.current = null;
    zoomTargetRef.current       = 1.0;
    panelX.set(-9999);
  }, [panelX]);

  focusExitRef.current = handleDeselect;

  // Deselect panel when navigating away from /play
  useEffect(() => {
    if (!active) handleDeselect();
  }, [active, handleDeselect]);

  const handleSelect = useCallback(
    (
      item:     ArtifactCanvasItem,
      point:    [number, number],
      halfW:    number,
      halfH:    number,
      groupIdx: number,
      itemIdx:  number,
    ) => {
      const q = paramsRef.current;
      // Vertical bias: (0.5 - focusVCenter) * H / zoom  → item sits above center
      const vBias = (0.5 - q.focusVCenter) * window.innerHeight / q.focusZoom;
      setSelected({ artifact: item, groupIdx, itemIdx }); // focusState.isActive set by useLayoutEffect
      selectTargetRef.current     = {
        x: point[0] + q.camOffsetX / q.focusZoom,
        y: point[1] - vBias,
      };
      selectedWorldPosRef.current = point;
      selectedHalfWRef.current    = halfW;
      selectedHalfHRef.current    = halfH;
      zoomTargetRef.current       = q.focusZoom;
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
      <LoadingBar loading={loading && active} />

      {/* Canvas — always visible, dezoom 0.5→1 on mount */}
      <div style={{ position: "absolute", inset: 0 }}>
        <Canvas
          orthographic
          camera={{ zoom: 0.5, position: [0, 0, 100], near: 0.1, far: 10000 }}
          gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
          frameloop={active ? "always" : "never"}
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
            paramsRef={paramsRef}
            active={active}
          />
        </Canvas>
      </div>

      {/* Info panel — tracks selected card via motion values */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={`${selected.groupIdx}-${selected.itemIdx}`}
            className="fixed z-50 pointer-events-none"
            style={{ left: 0, top: 0, x: panelX, y: panelY }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.22, delay: PANEL_DELAY_S, ease: "easeOut" } }}
            exit={{ opacity: 0, transition: { duration: 0.14, ease: "easeIn" } }}
          >
            <div className="pointer-events-auto">
              <ArtifactInfo artifact={selected.artifact} scrambleDelayMs={PANEL_DELAY_S * 1000} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tweakpane debug — dev only, dynamic import → not bundled in prod */}
      <DebugPane paramsRef={paramsRef} onLayoutChange={handleLayoutChange} />
    </div>
  );
}
