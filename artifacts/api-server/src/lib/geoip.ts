import type { Request } from "express";

type GeoResult = { city: string; region: string; country: string };

// In-memory cache: IP → result (or null for failed/private lookups)
const geoCache = new Map<string, GeoResult | null>();
// In-flight dedup: avoid concurrent requests for the same IP
const inFlight = new Map<string, Promise<GeoResult | null>>();

const MAX_CACHE = 5_000;

/** Extract the real client IP, respecting Caddy's x-forwarded-for header. */
export function getClientIp(req: Request): string | null {
  const fwd = req.headers["x-forwarded-for"];
  const raw = typeof fwd === "string"
    ? fwd.split(",")[0].trim()
    : Array.isArray(fwd)
    ? fwd[0]?.trim()
    : undefined;
  return raw ?? (typeof req.socket?.remoteAddress === "string" ? req.socket.remoteAddress : null);
}

/** Resolve an IP to city/region/country. Returns null for private IPs or on failure. */
export async function lookupGeo(ip: string): Promise<GeoResult | null> {
  if (isPrivate(ip)) return null;

  if (geoCache.has(ip)) return geoCache.get(ip)!;
  if (inFlight.has(ip)) return inFlight.get(ip)!;

  const promise = fetchGeo(ip)
    .then((result) => {
      // Evict oldest entry when cache is full
      if (geoCache.size >= MAX_CACHE) {
        const oldest = geoCache.keys().next().value;
        if (oldest !== undefined) geoCache.delete(oldest);
      }
      geoCache.set(ip, result);
      inFlight.delete(ip);
      return result;
    })
    .catch(() => {
      geoCache.set(ip, null);
      inFlight.delete(ip);
      return null;
    });

  inFlight.set(ip, promise);
  return promise;
}

async function fetchGeo(ip: string): Promise<GeoResult | null> {
  const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,city,regionName,country`;
  const res = await fetch(url, { signal: AbortSignal.timeout(4_000) });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    status?: string;
    city?: string;
    regionName?: string;
    country?: string;
  };
  if (data.status !== "success") return null;
  return {
    city: data.city?.trim() ?? "",
    region: data.regionName?.trim() ?? "",
    country: data.country?.trim() ?? "",
  };
}

function isPrivate(ip: string): boolean {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    ip.startsWith("::ffff:127.") ||
    ip.startsWith("::ffff:10.") ||
    ip.startsWith("::ffff:192.168.")
  );
}
