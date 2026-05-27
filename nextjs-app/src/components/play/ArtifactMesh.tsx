"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { ArtifactCanvasItem } from "@/sanity/queries";
import { buildImageUrl } from "@/lib/sanity-image";

export const CARD_W = 340;
export const CARD_H = 250;

// ─── Corner brackets — 4 L-shapes, sized to the actual scaled card ────────────
const B   = 16;  // arm length
const TH  = 1.5; // arm thickness
const OFF    = 7;   // gap from card edge
const RADIUS = 16;  // corner radius in world-units

// ─── Rounded corners via alpha-map ────────────────────────────────────────────
//  PlaneGeometry keeps correct texture UVs. The alpha mask clips corners only.
//  Singleton — created once on first use, shared across all instances.
let _roundedAlpha: THREE.Texture | null = null;
function getRoundedAlpha(): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  if (_roundedAlpha) return _roundedAlpha;
  const canvas = document.createElement("canvas");
  canvas.width  = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000000";            // black = transparent
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  ctx.fillStyle = "#ffffff";            // white  = opaque
  ctx.beginPath();
  ctx.moveTo(RADIUS, 0);
  ctx.lineTo(CARD_W - RADIUS, 0);
  ctx.quadraticCurveTo(CARD_W, 0,      CARD_W, RADIUS);
  ctx.lineTo(CARD_W, CARD_H - RADIUS);
  ctx.quadraticCurveTo(CARD_W, CARD_H, CARD_W - RADIUS, CARD_H);
  ctx.lineTo(RADIUS, CARD_H);
  ctx.quadraticCurveTo(0, CARD_H,      0, CARD_H - RADIUS);
  ctx.lineTo(0, RADIUS);
  ctx.quadraticCurveTo(0, 0,           RADIUS, 0);
  ctx.closePath();
  ctx.fill();
  _roundedAlpha = new THREE.CanvasTexture(canvas);
  return _roundedAlpha;
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
  cardScale?: number; // default 1 — drives both geometry size and bracket positions
};

// ─── Shared mesh body ─────────────────────────────────────────────────────────
function MeshBody({
  texture,
  worldPos,
  isSelected,
  onSelect,
  cardScale = 1,
}: SharedProps & { texture: THREE.Texture }) {
  const meshRef  = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const anim     = useRef(1);
  const [hovered, setHovered] = useState(false);

  const w  = CARD_W * cardScale;
  const h  = CARD_H * cardScale;
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
          alphaMap={getRoundedAlpha() ?? undefined}
        />
      </mesh>
      <CornerBrackets visible={hovered || isSelected} hw={hw} hh={hh} />
    </group>
  );
}

// ─── Placeholder (no media) ───────────────────────────────────────────────────
function PlaceholderMesh({ worldPos, isSelected, onSelect, cardScale = 1 }: SharedProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const w  = CARD_W * cardScale;
  const h  = CARD_H * cardScale;
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
          alphaMap={getRoundedAlpha() ?? undefined}
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
  ...rest
}: SharedProps & {
  artifact:     ArtifactCanvasItem;
  videoTexture?: THREE.VideoTexture;
}) {
  const m = artifact.firstMedia;

  if (m?._type === "galleryVideo") {
    if (videoTexture) return <MeshBody texture={videoTexture} {...rest} />;
    return <PlaceholderMesh {...rest} />;
  }

  const src = m?.imageRef
    ? buildImageUrl(m.imageRef, m.imageUrl, m.imageHotspot, m.imageCrop)
    : (m?.imageUrl ?? null);

  if (!src) return <PlaceholderMesh {...rest} />;
  return <ImageMesh url={src} {...rest} />;
}
