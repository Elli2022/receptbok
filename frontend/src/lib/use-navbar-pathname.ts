"use client";

import { usePathname } from "next/navigation";

export function isNavLinkActive(pathname: string, href: string): boolean {
  const path = href.split("#")[0] ?? href;
  if (path === "/") {
    return pathname === "/";
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

/** Pathname for navbar highlighting. */
export function useNavbarPathname(): string {
  return usePathname() ?? "/";
}
