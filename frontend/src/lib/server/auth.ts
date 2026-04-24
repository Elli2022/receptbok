import crypto from "node:crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { UserModel } from "./models";
import { connectToDatabase, hasDatabaseUrl } from "./db";

const SESSION_COOKIE = "receptbok_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

type SessionPayload = {
  id: string;
  name: string;
  username: string;
  email: string;
  exp: number;
};

const sessionSecret = () =>
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "development-only-receptbok-secret";

const base64Url = (value: string | Buffer) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const sign = (payload: string) =>
  base64Url(
    crypto.createHmac("sha256", sessionSecret()).update(payload).digest()
  );

const serializeCookie = (name: string, value: string, maxAge = SESSION_MAX_AGE) => {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
};

const parseCookies = (cookieHeader = "") =>
  Object.fromEntries(
    cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const [name, ...value] = cookie.split("=");
        return [name, decodeURIComponent(value.join("="))];
      })
  );

export const publicUser = (user: any) => ({
  id: String(user._id),
  name: user.name,
  username: user.username,
  email: user.email,
  favoriteIds: (user.favorites || []).map(String),
});

export const createSessionValue = (user: any) => {
  const payload = base64Url(
    JSON.stringify({
      id: String(user._id),
      name: user.name,
      username: user.username,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
    } satisfies SessionPayload)
  );

  return `${payload}.${sign(payload)}`;
};

export const setSessionCookie = (res: NextApiResponse, user: any) => {
  res.setHeader("Set-Cookie", serializeCookie(SESSION_COOKIE, createSessionValue(user)));
};

export const clearSessionCookie = (res: NextApiResponse) => {
  res.setHeader("Set-Cookie", serializeCookie(SESSION_COOKIE, "", 0));
};

export const getSession = (req: NextApiRequest): SessionPayload | null => {
  const cookie = parseCookies(req.headers.cookie)[SESSION_COOKIE];

  if (!cookie) {
    return null;
  }

  const [payload, signature] = cookie.split(".");

  if (!payload || !signature || sign(payload) !== signature) {
    return null;
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()
    ) as SessionPayload;

    if (!session.exp || session.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
};

export const getCurrentUser = async (req: NextApiRequest) => {
  const session = getSession(req);

  if (!session || !hasDatabaseUrl()) {
    return null;
  }

  await connectToDatabase();
  return UserModel.findById(session.id);
};
