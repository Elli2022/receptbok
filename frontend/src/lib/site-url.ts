export const DEFAULT_SITE_URL = "https://recipe-book-platform.netlify.app";

/** Canonical public site origin (no trailing slash). */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  return configured || DEFAULT_SITE_URL;
}

/** Resolve a recipe or OG image path to an absolute URL when possible. */
export function absoluteAssetUrl(path: string | undefined): string | undefined {
  if (!path?.trim()) {
    return undefined;
  }
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const siteUrl = getSiteUrl();
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
