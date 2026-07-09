import type { ApiRequest, ApiResponse } from "./types.js";

const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const nativeOrigins = new Set(["capacitor://localhost", "http://localhost"]);

export function allowTrustedOrigin(req: ApiRequest, res: ApiResponse) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (!origin || !host) return true;
  try {
    if (new URL(origin).host === host) return true;
  } catch {
    // Invalid origins are rejected below.
  }
  if (nativeOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Vary", "Origin");
    return true;
  }
  res.status(403).json({ error: "Origin not allowed." });
  return false;
}

export function finishPreflight(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "OPTIONS") return false;
  res.status(204).end();
  return true;
}

export function allowRequest(
  req: ApiRequest,
  res: ApiResponse,
  namespace: string,
  limit: number,
  windowMs: number
) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwarded)
    ? forwarded[0]
    : forwarded?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  const key = `${namespace}:${ip}`;
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) {
    res.setHeader("Retry-After", Math.ceil((bucket.resetAt - now) / 1000));
    res.status(429).json({ error: "Too many requests. Try again in a few minutes." });
    return false;
  }
  bucket.count += 1;
  return true;
}

export function requirePost(req: ApiRequest, res: ApiResponse) {
  if (req.method === "POST") return true;
  res.setHeader("Allow", "POST");
  res.status(405).json({ error: "Method not allowed." });
  return false;
}
