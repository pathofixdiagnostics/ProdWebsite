import type { Request, Response, NextFunction } from "express";

type Bucket = { count: number; resetAt: number };

/**
 * Fixed-window per-IP rate limiter. In-memory, which is fine for this
 * single-process API. Guards the public form/beacon endpoints against abuse
 * and the admin login against brute force.
 */
export function rateLimit(opts: { windowMs: number; max: number }) {
  const hits = new Map<string, Bucket>();

  // Periodically drop expired buckets so the map can't grow unbounded.
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of hits) {
      if (bucket.resetAt <= now) hits.delete(key);
    }
  }, opts.windowMs);
  timer.unref?.();

  return (req: Request, res: Response, next: NextFunction) => {
    const fwd = req.headers["x-forwarded-for"];
    const ip =
      (Array.isArray(fwd) ? fwd[0] : fwd?.toString().split(",")[0].trim()) ||
      req.ip ||
      "unknown";

    const now = Date.now();
    const bucket = hits.get(ip);

    if (!bucket || bucket.resetAt <= now) {
      hits.set(ip, { count: 1, resetAt: now + opts.windowMs });
      next();
      return;
    }

    if (bucket.count >= opts.max) {
      res.status(429).json({ error: "Too many requests. Please try again shortly." });
      return;
    }

    bucket.count++;
    next();
  };
}
