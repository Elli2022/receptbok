const preloaded = new Set<string>();

type PreloadOptions = {
  width?: number;
  quality?: number;
};

/** URL som Next.js Image faktiskt hämtar (/_next/image?...). */
export function buildNextImageRequestUrl(
  src: string,
  options: PreloadOptions = {}
): string | null {
  if (typeof window === "undefined" || !src) {
    return null;
  }
  if (src.startsWith("data:") || src.startsWith("blob:")) {
    return null;
  }

  const width = options.width ?? 800;
  const quality = options.quality ?? 75;
  const absolute =
    src.startsWith("http://") || src.startsWith("https://")
      ? src
      : `${window.location.origin}${src.startsWith("/") ? src : `/${src}`}`;

  const params = new URLSearchParams({
    url: absolute,
    w: String(width),
    q: String(quality),
  });

  return `/_next/image?${params.toString()}`;
}

export function preloadRecipeImageUrl(
  src: string,
  options: PreloadOptions = {}
): void {
  if (typeof window === "undefined" || !src) {
    return;
  }

  const href = buildNextImageRequestUrl(src, options);
  if (!href || preloaded.has(href)) {
    return;
  }

  preloaded.add(href);
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = href;
  document.head.appendChild(link);
}
