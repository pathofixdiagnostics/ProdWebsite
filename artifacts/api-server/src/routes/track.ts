import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, pageViewsTable } from "@workspace/db";
import { rateLimit } from "../lib/rateLimit";
import { getClientIp, lookupGeo } from "../lib/geoip";

// Public endpoint: anonymous website visitors ping this on page load. It is
// intentionally unauthenticated (visitors are not logged in) and is protected
// by input validation and a per-IP rate limit instead.
const router = Router();

const trackLimiter = rateLimit({ windowMs: 60_000, max: 60 });

router.post("/track", trackLimiter, async (req, res) => {
  try {
    const body = (req.body ?? {}) as { sessionId?: unknown; path?: unknown; timezone?: unknown };

    if (typeof body.sessionId !== "string" || typeof body.path !== "string") {
      res.status(400).json({ error: "Invalid payload" });
      return;
    }

    // Validate & clamp at the boundary
    const sessionId = body.sessionId.slice(0, 64);
    const path = body.path.slice(0, 512);
    if (!/^[A-Za-z0-9_-]+$/.test(sessionId)) {
      res.status(400).json({ error: "Invalid session id" });
      return;
    }

    // IANA timezone: only letters, digits, / _ + - .
    const tzRaw = typeof body.timezone === "string" ? body.timezone.slice(0, 64) : "";
    const timezone = /^[A-Za-z0-9/_+\-.]+$/.test(tzRaw) ? tzRaw : null;

    const [inserted] = await db
      .insert(pageViewsTable)
      .values({ sessionId, path, timezone })
      .returning({ id: pageViewsTable.id });

    res.status(204).end();

    // Fire-and-forget: geo lookup → update the row with city/region/country.
    // Never blocks the response and never throws to the caller.
    const ip = getClientIp(req);
    if (ip && inserted?.id) {
      lookupGeo(ip)
        .then((geo) => {
          if (geo) {
            db.update(pageViewsTable)
              .set({ city: geo.city, region: geo.region, country: geo.country })
              .where(eq(pageViewsTable.id, inserted.id))
              .catch(() => {});
          }
        })
        .catch(() => {});
    }
  } catch (err) {
    req.log?.error({ err }, "Failed to record page view");
    res.status(500).json({ error: "Failed to record page view" });
  }
});

export default router;
