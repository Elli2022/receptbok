import type { NextApiRequest, NextApiResponse } from "next";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseRecipeId(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const id = value.trim();
  return UUID_RE.test(id) ? id : null;
}

/** Returns true if rejected (response already sent). */
export function rejectOversizedBody(
  req: NextApiRequest,
  res: NextApiResponse,
  maxBytes: number
): boolean {
  const raw = req.headers["content-length"];
  if (!raw) {
    return false;
  }
  const length = Number(raw);
  if (!Number.isFinite(length) || length <= maxBytes) {
    return false;
  }
  res.status(413).json({ message: "Begäran är för stor." });
  return true;
}
