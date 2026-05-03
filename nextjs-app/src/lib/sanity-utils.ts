const FILE_REF_RE = /^file-([a-f0-9]+)-(\w+)$/;

export function fileRefToUrl(ref: string | null | undefined): string | null {
  if (!ref) return null;
  const match = ref.match(FILE_REF_RE);
  if (!match) return null;
  return `https://cdn.sanity.io/files/87awwrcu/production/${match[1]}.${match[2]}`;
}

const VIDEO_EXTS = new Set(["mp4", "webm", "mov", "ogg", "avi"]);

export function isVideoRef(ref: string | null | undefined): boolean {
  if (!ref) return false;
  const match = ref.match(FILE_REF_RE);
  if (!match) return false;
  return VIDEO_EXTS.has(match[2].toLowerCase());
}
