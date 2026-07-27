import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";

// Admin credentials come from the environment — never hardcoded.
//
//   ADMIN_PASSWORD_HASH   pbkdf2$sha256$<iterations>$<saltB64>$<hashB64>
//                         (generate with `node scripts/hash-admin-password.mjs`)
//   ADMIN_SESSION_SECRET  random string used to sign the session cookie
//
// Local/testing convenience (NON-production only): if no hash is set you may
// instead provide a plaintext ADMIN_PASSWORD, which is hashed in memory at
// startup (the plaintext is never stored). This shortcut is IGNORED when
// NODE_ENV=production, where a real ADMIN_PASSWORD_HASH is required.

const SESSION_COOKIE = "pf_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function pbkdf2Hash(password: string): string {
  const iterations = 100_000;
  const salt = crypto.randomBytes(16);
  const dk = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256");
  return `pbkdf2$sha256$${iterations}$${salt.toString("base64")}$${dk.toString("base64")}`;
}

// Hash derived from a plaintext ADMIN_PASSWORD (dev only), computed once.
let derivedHash: string | undefined;

/** The password hash actually in effect, whatever its source. */
function activePasswordHash(): string | null {
  if (process.env.ADMIN_PASSWORD_HASH) return process.env.ADMIN_PASSWORD_HASH;

  const plaintext = process.env.ADMIN_PASSWORD;
  if (plaintext && !isProduction()) {
    const hash = derivedHash ?? pbkdf2Hash(plaintext);
    derivedHash = hash;
    return hash;
  }
  return null;
}

// Ephemeral secret for local dev when none is provided, computed once.
let ephemeralSecret: string | undefined;

function sessionSecret(): string | null {
  if (process.env.ADMIN_SESSION_SECRET) return process.env.ADMIN_SESSION_SECRET;
  // In dev/testing, auto-generate one so the console just works. Sessions
  // won't survive an API restart, which is fine locally. Required in prod.
  if (!isProduction()) {
    const secret = ephemeralSecret ?? crypto.randomBytes(32).toString("base64");
    ephemeralSecret = secret;
    return secret;
  }
  return null;
}

/** The console is usable only when both a password hash and a secret exist. */
export function adminConfigured(): boolean {
  return Boolean(activePasswordHash() && sessionSecret());
}

/** Verify a submitted password against the active hash (constant-time). */
export function verifyPassword(password: string): boolean {
  const stored = activePasswordHash();
  if (!stored) return false;

  const parts = stored.split("$");
  if (parts.length !== 5 || parts[0] !== "pbkdf2" || parts[1] !== "sha256") return false;

  const iterations = Number(parts[2]);
  const salt = Buffer.from(parts[3], "base64");
  const expected = Buffer.from(parts[4], "base64");
  if (!Number.isInteger(iterations) || iterations < 1 || salt.length === 0 || expected.length === 0) {
    return false;
  }

  const actual = crypto.pbkdf2Sync(password, salt, iterations, expected.length, "sha256");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function sign(value: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

/** Signed, expiring session token: base64url(expiryMs).hmac */
export function createSessionToken(): string | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const payload = Buffer.from(String(Date.now() + SESSION_TTL_MS)).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

function verifySessionToken(token: string): boolean {
  const secret = sessionSecret();
  if (!secret) return false;

  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expectedSig = Buffer.from(sign(payload, secret));
  const givenSig = Buffer.from(sig);
  if (expectedSig.length !== givenSig.length || !crypto.timingSafeEqual(expectedSig, givenSig)) {
    return false;
  }

  const exp = Number(Buffer.from(payload, "base64url").toString());
  return Number.isFinite(exp) && Date.now() < exp;
}

export function setSessionCookie(req: Request, res: Response, token: string): void {
  // Mark the cookie Secure only when the request actually arrived over HTTPS.
  // Behind Caddy in production the proxy sets X-Forwarded-Proto=https; on plain
  // http://localhost (local Docker) it stays unset, so the cookie still works.
  const proto = req.headers["x-forwarded-proto"];
  const forwarded = Array.isArray(proto) ? proto[0] : proto;
  const isHttps = forwarded === "https" || req.secure === true;

  // Split hosting: frontend and API on different origins.
  // SameSite=None is required for cross-origin cookies; it requires Secure=true.
  // Fall back to "strict" for same-origin local Docker setup.
  const crossOrigin = Boolean(process.env.CORS_ORIGIN);

  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: crossOrigin ? true : isHttps,
    sameSite: crossOrigin ? "none" : "strict",
    maxAge: SESSION_TTL_MS,
    path: "/",
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

export function isAuthenticated(req: Request): boolean {
  const token = (req as Request & { cookies?: Record<string, string> }).cookies?.[SESSION_COOKIE];
  return typeof token === "string" && verifySessionToken(token);
}

/** Gate for every admin-only endpoint. */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!adminConfigured()) {
    res.status(503).json({ error: "Admin console is not configured on the server." });
    return;
  }
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: "Not authenticated." });
    return;
  }
  next();
}
