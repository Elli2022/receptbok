import { describe, expect, it, beforeEach } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  enforceRateLimit,
  getClientIp,
  resetRateLimitsForTests,
} from "./rate-limit";

function mockReq(
  headers: Record<string, string | string[] | undefined> = {},
  remoteAddress = "127.0.0.1"
): NextApiRequest {
  return {
    headers,
    socket: { remoteAddress },
  } as NextApiRequest;
}

function mockRes() {
  const state = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: null as unknown,
  };

  const res = {
    setHeader(key: string, value: string) {
      state.headers[key] = value;
      return res;
    },
    status(code: number) {
      state.statusCode = code;
      return res;
    },
    json(body: unknown) {
      state.body = body;
      return res;
    },
    get statusCode() {
      return state.statusCode;
    },
    get headers() {
      return state.headers;
    },
    get body() {
      return state.body;
    },
  };

  return res as NextApiResponse & typeof res;
}

describe("getClientIp", () => {
  it("prefers x-forwarded-for", () => {
    expect(
      getClientIp(mockReq({ "x-forwarded-for": "203.0.113.1, 10.0.0.1" }))
    ).toBe("203.0.113.1");
  });

  it("falls back to socket address", () => {
    expect(getClientIp(mockReq({}, "192.168.1.10"))).toBe("192.168.1.10");
  });
});

describe("enforceRateLimit", () => {
  beforeEach(() => {
    resetRateLimitsForTests();
  });

  it("allows requests under the limit", () => {
    const req = mockReq({ "x-forwarded-for": "198.51.100.4" });
    const res = mockRes();

    expect(
      enforceRateLimit(req, res, { scope: "test", limit: 2, windowMs: 60_000 })
    ).toBe(true);
    expect(
      enforceRateLimit(req, res, { scope: "test", limit: 2, windowMs: 60_000 })
    ).toBe(true);
  });

  it("blocks requests over the limit with 429", () => {
    const req = mockReq({ "x-forwarded-for": "198.51.100.5" });
    const options = { scope: "test-block", limit: 1, windowMs: 60_000 };

    expect(enforceRateLimit(req, mockRes(), options)).toBe(true);

    const blockedRes = mockRes();
    expect(enforceRateLimit(req, blockedRes, options)).toBe(false);
    expect(blockedRes.statusCode).toBe(429);
    expect(blockedRes.headers["Retry-After"]).toBeTruthy();
    expect(blockedRes.body).toMatchObject({
      message: expect.stringMatching(/för många/i),
    });
  });
});
