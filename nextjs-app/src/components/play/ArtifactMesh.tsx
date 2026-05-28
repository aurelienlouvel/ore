"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { ArtifactCanvasItem } from "@/sanity/queries";
import { buildImageUrl } from "@/lib/sanity-image";
import { CARD_W, CARD_H, getArtifactImageUrl } from "@/lib/artifact-utils";

// Re-export so InfiniteCanvas doesn't need to know where they live
export { CARD_W, CARD_H, getArtifactImageUrl };

// ─── Corner brackets — 4 L-shapes, sized to the actual scaled card ────────────
const B      = 16;  // arm length
const TH     = 1.5; // arm thickness
const OFF    = 7;   // gap from card edge
const RADIUS = 16;  // corner radius in world-units

// ─── Rounded-corner alpha map — one CanvasTexture per unique card height ──────
//  PlaneGeometry keeps correct UVs; the alpha mask clips corners only.
const _alphaCache = new Map<number, THREE.Texture>();

function getRoundedAlpha(w: number, h: number): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  if (_alphaCache.has(h)) return _alphaCache.get(h)!;

  const canvas = document.createElement("canvas");
  canvas.width  = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(RADIUS, 0);
  ctx.lineTo(w - RADIUS, 0);
  ctx.quadraticCurveTo(w, 0,   w, RADIUS);
  ctx.lineTo(w, h - RADIUS);
  ctx.quadraticCurveTo(w, h,   w - RADIUS, h);
  ctx.lineTo(RADIUS, h);
  ctx.quadraticCurveTo(0, h,   0, h - RADIUS);
  ctx.lineTo(0, RADIUS);
  ctx.quadraticCurveTo(0, 0,   RADIUS, 0);
  ctx.closePath();
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  _alphaCache.set(h, tex);
  return tex;
}

function CornerBrackets({
  visible,
  hw,
  hh,
}: {
  visible: boolean;
  hw: number; // half card width  + OFF
  hh: number; // half card height + OFF
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const target = visible ? 1 : 0;
    groupRef.current.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        const mat = obj.material as THREE.MeshBasicMaterial;
        mat.opacity += (target - mat.opacity) * 0.2;
      }
    });
  });

  const arms: Array<[[number, number, number], [number, number]]> = [
    [[-hw + B / 2,  hh,  0.05], [B, TH]],  // TL horiz
    [[-hw,  hh - B / 2,  0.05], [TH, B]],  // TL vert
    [[ hw - B / 2,  hh,  0.05], [B, TH]],  // TR horiz
    [[ hw,  hh - B / 2,  0.05], [TH, B]],  // TR vert
    [[-hw + B / 2, -hh,  0.05], [B, TH]],  // BL horiz
    [[-hw, -hh + B / 2,  0.05], [TH, B]],  // BL vert
    [[ hw - B / 2, -hh,  0.05], [B, TH]],  // BR horiz
    [[ hw, -hh + B / 2,  0.05], [TH, B]],  // BR vert
  ];

  return (
    <group ref={groupRef}>
      {arms.map(([pos, size], i) => (
        <mesh key={i} position={pos}>
          <planeGeometry args={size} />
          <meshBasicMaterial color="#1c1917" transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Shared props ─────────────────────────────────────────────────────────────
type SharedProps = {
  worldPos:   [number, number];
  isSelected: boolean;
  onSelect:   (point: [number, number]) => void;
  cardScale?: number; // uniform size variation
  cardH?:     number; // actual height (defaults to CARD_H)
};

// ─── Shared mesh body ─────────────────────────────────────────────────────────
function MeshBody({
  texture,
  worldPos,
  isSelected,
  onSelect,
  cardScale = 1,
  cardH = CARD_H,
}: SharedProps & { texture: THREE.Texture }) {
  const meshRef  = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const anim     = useRef(1);
  const [hovered, setHovered] = useState(false);

  const w  = CARD_W * cardScale;
  const h  = cardH  * cardScale;
  const hw = w / 2 + OFF;
  const hh = h / 2 + OFF;

  useFrame(() => {
    const target = isSelected ? 1.05 : 1;
    anim.current += (target - anim.current) * 0.12;
    meshRef.current?.scale.setScalar(anim.current);
  });

  return (
    <group ref={groupRef} position={[worldPos[0], worldPos[1], 0]}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          const wp = new THREE.Vector3();
          groupRef.current?.getWorldPosition(wp);
          onSelect([wp.x, wp.y]);
        }}
      >
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial
          map={texture}
          toneMapped={false}
          transparent
          alphaMap={getRoundedAlpha(CARD_W, cardH) ?? undefined}
        />
      </mesh>
      <CornerBrackets visible={hovered || isSelected} hw={hw} hh={hh} />
    </group>
  );
}

// ─── Placeholder (no media) ───────────────────────────────────────────────────
function PlaceholderMesh({
  worldPos, isSelected, onSelect, cardScale = 1, cardH = CARD_H,
}: SharedProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const w  = CARD_W * cardScale;
  const h  = cardH  * cardScale;
  const hw = w / 2 + OFF;
  const hh = h / 2 + OFF;

  return (
    <group ref={groupRef} position={[worldPos[0], worldPos[1], 0]}>
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          const wp = new THREE.Vector3();
          groupRef.current?.getWorldPosition(wp);
          onSelect([wp.x, wp.y]);
        }}
      >
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial
          color="#e7e5e4"
          transparent
          alphaMap={getRoundedAlpha(CARD_W, cardH) ?? undefined}
        />
      </mesh>
      <CornerBrackets visible={hovered || isSelected} hw={hw} hh={hh} />
    </group>
  );
}

// ─── Image mesh — useTexture suspends until loaded ────────────────────────────
function ImageMesh({ url, ...rest }: SharedProps & { url: string }) {
  const texture = useTexture(url);
  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture]);
  return <MeshBody texture={texture} {...rest} />;
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function ArtifactMesh({
  artifact,
  videoTexture,
  cardH,
  ...rest
}: SharedProps & {
  artifact:      ArtifactCanvasItem;
  videoTexture?: THREE.VideoTexture;
  cardH?:        number;
}) {
  const m = artifact.firstMedia;

  if (m?._type === "galleryVideo") {
    if (videoTexture) return <MeshBody texture={videoTexture} cardH={cardH} {...rest} />;
    return <PlaceholderMesh cardH={cardH} {...rest} />;
  }

  const src = m?.imageRef
    ? buildImageUrl(m.imageRef, m.imageUrl, m.imageHotspot, m.imageCrop)
    : (m?.imageUrl ?? null);

  if (!src) return <PlaceholderMesh cardH={cardH} {...rest} />;
  return <ImageMesh url={src} cardH={cardH} {...rest} />;
}
