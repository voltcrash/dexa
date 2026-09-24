const SIZES = [96, 192, 256, 384, 512, 768] as const;
export type ImageWidth = (typeof SIZES)[number];

/** Route a remote image through Vercel's optimizer in production builds on Vercel. */
export function optimizedImage(url: string, width: ImageWidth, quality = 75): string {
  if (!__VERCEL_IMAGES__) return url;
  return `/_vercel/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}`;
}

export function imageSrcset(url: string, widths: readonly ImageWidth[]): string | undefined {
  if (!__VERCEL_IMAGES__) return undefined;
  return widths.map((w) => `${optimizedImage(url, w)} ${w}w`).join(", ");
}
