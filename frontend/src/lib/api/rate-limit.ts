import type { NextApiRequest, NextApiResponse } from "next";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitOptions = {
  /** Unique scope, e.g. "auth-login" */
  scope: string;
  /** Max requests per window */
  limit: number;
  /** Window length in ms */
  windowMs: number;
};

export function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].trim();
  }
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim()) {
    return realIp.trim();
  }
  return req.socket.remoteAddress ?? "unknown";
}

/** Returns true if the request is allowed; sends 429 otherwise. */
export function enforceRateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  options: RateLimitOptions
): boolean {
  const key = `${options.scope}:${getClientIp(req)}`;
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return true;
  }

  if (existing.count >= options.limit) {
    const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
    res.setHeader("Retry-After", String(retryAfter));
    res.status(429).json({
      message: "För många förfrågningar. Försök igen om en stund.",
    });
    return false;
  }

  existing.count += 1;
  return true;
}

/** Test helper — not used in production routes. */
export function resetRateLimitsForTests() {
  buckets.clear();
}
