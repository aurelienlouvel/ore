// Le canvas est rendu par PlayCanvas dans le root layout (persistant, jamais démonté).
// Cette page n'a besoin de rien rendre — la présence du pathname /play
// suffit à rendre le canvas visible via PlayCanvas.
export const revalidate = 60;
export default function PlayPage() { return null; }
