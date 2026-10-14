export const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
export const MAX_BYTES = 10 * 1024 * 1024;

export function validateFile(f: File): string | null {
  if (!ACCEPTED.includes(f.type)) return `${f.name}: please use a JPG, PNG or WebP image.`;
  if (f.size > MAX_BYTES) return `${f.name}: image must be under 10 MB.`;
  if (f.size < 2000) return `${f.name}: file looks empty or corrupted.`;
  return null;
}

function loadImg(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("Could not read this image."));
    i.src = src;
  });
}

/** Downscale to a JPEG data URL. */
export async function resize(src: string | Blob, max: number, quality = 0.85) {
  const url = typeof src === "string" ? src : URL.createObjectURL(src);
  try {
    const img = await loadImg(url);
    const s = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * s);
    c.height = Math.round(img.height * s);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", quality);
  } finally {
    if (typeof src !== "string") URL.revokeObjectURL(url);
  }
}
