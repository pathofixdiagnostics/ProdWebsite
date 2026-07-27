import express, { Router } from "express";
import { sql } from "drizzle-orm";
import { db, bookingsTable, partnerRequestsTable, pageViewsTable } from "@workspace/db";
import {
  adminConfigured,
  verifyPassword,
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  isAuthenticated,
  requireAdmin,
} from "../lib/adminAuth";
import { rateLimit } from "../lib/rateLimit";

const router = Router();

// ── Auth ────────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({ windowMs: 15 * 60_000, max: 10 });

router.post("/admin/login", loginLimiter, (req, res) => {
  if (!adminConfigured()) {
    res.status(503).json({ error: "Admin console is not configured on the server." });
    return;
  }
  const password = (req.body ?? {}).password;
  if (typeof password !== "string" || password.length === 0) {
    res.status(400).json({ error: "Password required." });
    return;
  }
  if (!verifyPassword(password)) {
    res.status(401).json({ error: "Incorrect password." });
    return;
  }
  const token = createSessionToken();
  if (!token) {
    res.status(503).json({ error: "Admin console is not configured on the server." });
    return;
  }
  setSessionCookie(req, res, token);
  res.json({ ok: true, token });
});

router.post("/admin/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get("/admin/me", (req, res) => {
  res.json({
    configured: adminConfigured(),
    authenticated: adminConfigured() && isAuthenticated(req),
  });
});

// ── Stats ───────────────────────────────────────────────────────────────
type CountRow = { count: number };
type MonthRow = { month: string; count: number };

router.get("/admin/stats", requireAdmin, async (req, res) => {
  try {
    const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
    const from =
      typeof req.query.from === "string" && ISO_DATE.test(req.query.from)
        ? req.query.from
        : null;
    const to =
      typeof req.query.to === "string" && ISO_DATE.test(req.query.to)
        ? req.query.to
        : null;

    const scalar = async (query: ReturnType<typeof sql>): Promise<number> => {
      const result = await db.execute<CountRow>(query);
      const rows =
        (result as unknown as { rows?: CountRow[] }).rows ??
        (result as unknown as CountRow[]);
      return Number(rows?.[0]?.count ?? 0);
    };

    const monthly = async (query: ReturnType<typeof sql>): Promise<MonthRow[]> => {
      const result = await db.execute<MonthRow>(query);
      const rows =
        (result as unknown as { rows?: MonthRow[] }).rows ??
        (result as unknown as MonthRow[]);
      return (rows ?? []).map((r) => ({ month: r.month, count: Number(r.count) }));
    };

    // "In period" condition — defaults to current calendar month when no filter given.
    const periodCond =
      from && to
        ? sql`created_at >= ${from}::date AND created_at < ${to}::date + interval '1 day'`
        : from
        ? sql`created_at >= ${from}::date`
        : to
        ? sql`created_at < ${to}::date + interval '1 day'`
        : sql`created_at >= date_trunc('month', now())`;

    // Month-range for the breakdown series — defaults to last 12 months.
    const monthStart = from
      ? sql`${from}::date`
      : sql`date_trunc('month', now()) - interval '11 months'`;
    const monthEnd = to
      ? sql`${to}::date + interval '1 day'`
      : sql`date_trunc('month', now()) + interval '1 month'`;

    const [
      bookingsTotal,
      bookingsInPeriod,
      partnerRequestsTotal,
      partnerRequestsInPeriod,
      visitsTotal,
      visitsInPeriod,
      pageViewsTotal,
      pageViewsInPeriod,
      bookingsByMonth,
      partnersByMonth,
      visitsByMonth,
    ] = await Promise.all([
      scalar(sql`SELECT count(*)::int AS count FROM bookings`),
      scalar(sql`SELECT count(*)::int AS count FROM bookings WHERE ${periodCond}`),
      scalar(sql`SELECT count(*)::int AS count FROM partner_requests`),
      scalar(sql`SELECT count(*)::int AS count FROM partner_requests WHERE ${periodCond}`),
      scalar(sql`SELECT count(DISTINCT session_id)::int AS count FROM page_views`),
      scalar(sql`SELECT count(DISTINCT session_id)::int AS count FROM page_views WHERE ${periodCond}`),
      scalar(sql`SELECT count(*)::int AS count FROM page_views`),
      scalar(sql`SELECT count(*)::int AS count FROM page_views WHERE ${periodCond}`),
      monthly(sql`
        SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
               count(*)::int AS count
        FROM bookings
        WHERE created_at >= ${monthStart} AND created_at < ${monthEnd}
        GROUP BY 1 ORDER BY 1
      `),
      monthly(sql`
        SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
               count(*)::int AS count
        FROM partner_requests
        WHERE created_at >= ${monthStart} AND created_at < ${monthEnd}
        GROUP BY 1 ORDER BY 1
      `),
      monthly(sql`
        SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
               count(DISTINCT session_id)::int AS count
        FROM page_views
        WHERE created_at >= ${monthStart} AND created_at < ${monthEnd}
        GROUP BY 1 ORDER BY 1
      `),
    ]);

    res.json({
      bookingsInPeriod,
      bookingsTotal,
      partnerRequestsInPeriod,
      partnerRequestsTotal,
      visitsInPeriod,
      visitsTotal,
      pageViewsInPeriod,
      pageViewsTotal,
      bookingsByMonth,
      partnersByMonth,
      visitsByMonth,
      from,
      to,
    });
  } catch (err) {
    req.log?.error({ err }, "Failed to load admin stats");
    res.status(500).json({ error: "Failed to load stats" });
  }
});

// ── Backup ──────────────────────────────────────────────────────────────
// Logical JSON backup, generated on demand and streamed over HTTPS. Nothing
// is persisted on the server, so no unencrypted backup sits at rest.
router.get("/admin/backup", requireAdmin, async (req, res) => {
  try {
    const [bookings, partnerRequests, pageViews] = await Promise.all([
      db.select().from(bookingsTable),
      db.select().from(partnerRequestsTable),
      db.select().from(pageViewsTable),
    ]);

    const backup = {
      format: "pathofix-backup",
      version: 1,
      createdAt: new Date().toISOString(),
      tables: { bookings, partnerRequests, pageViews },
    };

    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="pathofix-backup-${stamp}.json"`);
    res.send(JSON.stringify(backup, null, 2));
  } catch (err) {
    req.log?.error({ err }, "Backup failed");
    res.status(500).json({ error: "Backup failed" });
  }
});

// ── Restore ─────────────────────────────────────────────────────────────
function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

function asText(value: unknown): string {
  return value == null ? "" : String(value);
}
function asNullableText(value: unknown): string | null {
  return value == null ? null : String(value);
}

function sanitizeBooking(r: Record<string, unknown>) {
  return {
    id: Number(r.id),
    patientName: asText(r.patientName),
    phone: asText(r.phone),
    email: asNullableText(r.email),
    testPackage: asText(r.testPackage),
    preferredDate: asText(r.preferredDate),
    collectionType: r.collectionType === "labDropIn" ? ("labDropIn" as const) : ("homeCollection" as const),
    preferredTimeSlot: asText(r.preferredTimeSlot),
    address: asNullableText(r.address),
    notes: asNullableText(r.notes),
    createdAt: toDate(r.createdAt),
  };
}

function sanitizePartner(r: Record<string, unknown>) {
  return {
    id: Number(r.id),
    fullName: asText(r.fullName),
    organizationName: asText(r.organizationName),
    organizationType: asText(r.organizationType),
    email: asText(r.email),
    phone: asText(r.phone),
    city: asText(r.city),
    message: asNullableText(r.message),
    createdAt: toDate(r.createdAt),
  };
}

function sanitizePageView(r: Record<string, unknown>) {
  return {
    id: Number(r.id),
    sessionId: asText(r.sessionId).slice(0, 64),
    path: asText(r.path).slice(0, 512),
    createdAt: toDate(r.createdAt),
  };
}

// A restore intentionally replaces current data. It runs inside a transaction,
// so any failure rolls back and leaves the database untouched. The admin UI
// downloads a pre-restore backup to your machine first, so the previous data
// is always preserved off-server before this runs.
router.post(
  "/admin/restore",
  requireAdmin,
  express.json({ limit: "25mb" }),
  async (req, res) => {
    try {
      const payload = req.body as {
        format?: string;
        tables?: {
          bookings?: unknown;
          partnerRequests?: unknown;
          pageViews?: unknown;
        };
      };

      if (!payload || payload.format !== "pathofix-backup" || !payload.tables) {
        res.status(400).json({ error: "Not a valid PathoFix backup file." });
        return;
      }

      const bookings = payload.tables.bookings ?? [];
      const partnerRequests = payload.tables.partnerRequests ?? [];
      const pageViews = payload.tables.pageViews ?? [];

      if (![bookings, partnerRequests, pageViews].every(Array.isArray)) {
        res.status(400).json({ error: "Backup tables are malformed." });
        return;
      }

      await db.transaction(async (tx) => {
        // Clear then reload — atomic; rolls back on any error.
        await tx.delete(pageViewsTable);
        await tx.delete(bookingsTable);
        await tx.delete(partnerRequestsTable);

        const p = (partnerRequests as Record<string, unknown>[]).map(sanitizePartner);
        const b = (bookings as Record<string, unknown>[]).map(sanitizeBooking);
        const v = (pageViews as Record<string, unknown>[]).map(sanitizePageView);

        if (p.length) await tx.insert(partnerRequestsTable).values(p);
        if (b.length) await tx.insert(bookingsTable).values(b);
        if (v.length) await tx.insert(pageViewsTable).values(v);

        // Re-align the id sequences after inserting explicit ids.
        await tx.execute(sql`SELECT setval(pg_get_serial_sequence('bookings', 'id'), COALESCE((SELECT MAX(id) FROM bookings), 1))`);
        await tx.execute(sql`SELECT setval(pg_get_serial_sequence('partner_requests', 'id'), COALESCE((SELECT MAX(id) FROM partner_requests), 1))`);
        await tx.execute(sql`SELECT setval(pg_get_serial_sequence('page_views', 'id'), COALESCE((SELECT MAX(id) FROM page_views), 1))`);
      });

      res.json({
        ok: true,
        restored: {
          bookings: (bookings as unknown[]).length,
          partnerRequests: (partnerRequests as unknown[]).length,
          pageViews: (pageViews as unknown[]).length,
        },
      });
    } catch (err) {
      req.log?.error({ err }, "Restore failed");
      res.status(500).json({ error: "Restore failed. No changes were applied." });
    }
  },
);

// ── Bookings List ────────────────────────────────────────────────────────
type BookingRow = {
  id: number;
  patient_name: string;
  phone: string;
  email: string | null;
  test_package: string;
  preferred_date: string;
  collection_type: string;
  preferred_time_slot: string;
  address: string | null;
  notes: string | null;
  created_at: string;
};

function bookingFilters(req: express.Request) {
  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
  const search =
    typeof req.query.search === "string" ? req.query.search.trim().slice(0, 100) : "";
  const collTypeQ =
    typeof req.query.collectionType === "string" ? req.query.collectionType : "";
  const collectionType =
    collTypeQ === "homeCollection" || collTypeQ === "labDropIn" ? collTypeQ : "";
  const from =
    typeof req.query.from === "string" && ISO_DATE.test(req.query.from)
      ? req.query.from
      : null;
  const to =
    typeof req.query.to === "string" && ISO_DATE.test(req.query.to) ? req.query.to : null;

  const searchCond = search
    ? sql`AND (patient_name ILIKE ${"%" + search + "%"} OR phone ILIKE ${"%" + search + "%"})`
    : sql``;
  const typeCond = collectionType ? sql`AND collection_type = ${collectionType}` : sql``;
  const fromCond = from ? sql`AND created_at >= ${from}::date` : sql``;
  const toCond = to ? sql`AND created_at < ${to}::date + interval '1 day'` : sql``;

  return { searchCond, typeCond, fromCond, toCond };
}

router.get("/admin/bookings", requireAdmin, async (req, res) => {
  try {
    const { searchCond, typeCond, fromCond, toCond } = bookingFilters(req);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = 20;
    const offset = (page - 1) * limit;

    const [rowsResult, countResult] = await Promise.all([
      db.execute<BookingRow>(sql`
        SELECT id, patient_name, phone, email, test_package, preferred_date,
               collection_type, preferred_time_slot, address, notes, created_at
        FROM bookings
        WHERE 1=1 ${searchCond} ${typeCond} ${fromCond} ${toCond}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `),
      db.execute<CountRow>(sql`
        SELECT count(*)::int AS count
        FROM bookings
        WHERE 1=1 ${searchCond} ${typeCond} ${fromCond} ${toCond}
      `),
    ]);

    const bookings =
      (rowsResult as unknown as { rows?: BookingRow[] }).rows ??
      (rowsResult as unknown as BookingRow[]);
    const countRows =
      (countResult as unknown as { rows?: CountRow[] }).rows ??
      (countResult as unknown as CountRow[]);
    const total = Number(countRows?.[0]?.count ?? 0);

    res.json({ bookings, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (err) {
    req.log?.error({ err }, "Failed to load bookings list");
    res.status(500).json({ error: "Failed to load bookings" });
  }
});

// ── Bookings CSV Export ──────────────────────────────────────────────────
router.get("/admin/bookings/export", requireAdmin, async (req, res) => {
  try {
    const { searchCond, typeCond, fromCond, toCond } = bookingFilters(req);

    const result = await db.execute<BookingRow>(sql`
      SELECT id, patient_name, phone, email, test_package, preferred_date,
             collection_type, preferred_time_slot, address, notes, created_at
      FROM bookings
      WHERE 1=1 ${searchCond} ${typeCond} ${fromCond} ${toCond}
      ORDER BY created_at DESC
    `);

    const rows =
      (result as unknown as { rows?: BookingRow[] }).rows ??
      (result as unknown as BookingRow[]);

    function cell(v: unknown): string {
      if (v == null) return "";
      const s = String(v);
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    }

    const header = [
      "ID", "Patient Name", "Phone", "Email", "Test Package",
      "Preferred Date", "Collection Type", "Time Slot", "Address", "Notes", "Booked On",
    ];
    const csvLines = [
      header.join(","),
      ...(rows ?? []).map((r) =>
        [
          r.id, r.patient_name, r.phone, r.email, r.test_package, r.preferred_date,
          r.collection_type === "homeCollection" ? "Home Collection" : "Lab Drop-In",
          r.preferred_time_slot, r.address, r.notes, r.created_at,
        ]
          .map(cell)
          .join(","),
      ),
    ];

    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="pathofix-bookings-${stamp}.csv"`,
    );
    res.send(csvLines.join("\r\n"));
  } catch (err) {
    req.log?.error({ err }, "Bookings export failed");
    res.status(500).json({ error: "Export failed" });
  }
});

// ── Partners List ────────────────────────────────────────────────────────
type PartnerRow = {
  id: number;
  full_name: string;
  organization_name: string;
  organization_type: string;
  email: string;
  phone: string;
  city: string;
  message: string | null;
  created_at: string;
};

function partnerFilters(req: express.Request) {
  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
  const search =
    typeof req.query.search === "string" ? req.query.search.trim().slice(0, 100) : "";
  const from =
    typeof req.query.from === "string" && ISO_DATE.test(req.query.from)
      ? req.query.from
      : null;
  const to =
    typeof req.query.to === "string" && ISO_DATE.test(req.query.to) ? req.query.to : null;

  const searchCond = search
    ? sql`AND (full_name ILIKE ${"%" + search + "%"} OR organization_name ILIKE ${"%" + search + "%"} OR city ILIKE ${"%" + search + "%"})`
    : sql``;
  const fromCond = from ? sql`AND created_at >= ${from}::date` : sql``;
  const toCond = to ? sql`AND created_at < ${to}::date + interval '1 day'` : sql``;

  return { searchCond, fromCond, toCond };
}

router.get("/admin/partners", requireAdmin, async (req, res) => {
  try {
    const { searchCond, fromCond, toCond } = partnerFilters(req);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = 20;
    const offset = (page - 1) * limit;

    const [rowsResult, countResult] = await Promise.all([
      db.execute<PartnerRow>(sql`
        SELECT id, full_name, organization_name, organization_type,
               email, phone, city, message, created_at
        FROM partner_requests
        WHERE 1=1 ${searchCond} ${fromCond} ${toCond}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `),
      db.execute<CountRow>(sql`
        SELECT count(*)::int AS count
        FROM partner_requests
        WHERE 1=1 ${searchCond} ${fromCond} ${toCond}
      `),
    ]);

    const partners =
      (rowsResult as unknown as { rows?: PartnerRow[] }).rows ??
      (rowsResult as unknown as PartnerRow[]);
    const countRows =
      (countResult as unknown as { rows?: CountRow[] }).rows ??
      (countResult as unknown as CountRow[]);
    const total = Number(countRows?.[0]?.count ?? 0);

    res.json({ partners, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (err) {
    req.log?.error({ err }, "Failed to load partners list");
    res.status(500).json({ error: "Failed to load partners" });
  }
});

router.get("/admin/partners/export", requireAdmin, async (req, res) => {
  try {
    const { searchCond, fromCond, toCond } = partnerFilters(req);

    const result = await db.execute<PartnerRow>(sql`
      SELECT id, full_name, organization_name, organization_type,
             email, phone, city, message, created_at
      FROM partner_requests
      WHERE 1=1 ${searchCond} ${fromCond} ${toCond}
      ORDER BY created_at DESC
    `);

    const rows =
      (result as unknown as { rows?: PartnerRow[] }).rows ??
      (result as unknown as PartnerRow[]);

    function cell(v: unknown): string {
      if (v == null) return "";
      const s = String(v);
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    }

    const header = ["ID", "Full Name", "Organization", "Type", "Email", "Phone", "City", "Message", "Received On"];
    const csvLines = [
      header.join(","),
      ...(rows ?? []).map((r) =>
        [r.id, r.full_name, r.organization_name, r.organization_type, r.email, r.phone, r.city, r.message, r.created_at]
          .map(cell).join(","),
      ),
    ];

    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="pathofix-partners-${stamp}.csv"`);
    res.send(csvLines.join("\r\n"));
  } catch (err) {
    req.log?.error({ err }, "Partners export failed");
    res.status(500).json({ error: "Export failed" });
  }
});

// ── Insights ─────────────────────────────────────────────────────────────
router.get("/admin/insights", requireAdmin, async (req, res) => {
  try {
    const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
    const from =
      typeof req.query.from === "string" && ISO_DATE.test(req.query.from)
        ? req.query.from
        : null;
    const to =
      typeof req.query.to === "string" && ISO_DATE.test(req.query.to) ? req.query.to : null;

    const fromCond = from ? sql`AND created_at >= ${from}::date` : sql``;
    const toCond = to ? sql`AND created_at < ${to}::date + interval '1 day'` : sql``;

    type PkgRow = { test_package: string; count: number };
    type TypeRow = { collection_type: string; count: number };
    type LocRow = { city: string; region: string; country: string; count: number };
    type TzRow = { timezone: string; count: number };

    const [pkgResult, typeResult, locResult, tzResult] = await Promise.all([
      db.execute<PkgRow>(sql`
        SELECT test_package, count(*)::int AS count
        FROM bookings WHERE 1=1 ${fromCond} ${toCond}
        GROUP BY test_package ORDER BY count DESC LIMIT 10
      `),
      db.execute<TypeRow>(sql`
        SELECT collection_type, count(*)::int AS count
        FROM bookings WHERE 1=1 ${fromCond} ${toCond}
        GROUP BY collection_type
      `),
      db.execute<LocRow>(sql`
        SELECT city, region, country, count(DISTINCT session_id)::int AS count
        FROM page_views
        WHERE city IS NOT NULL AND city <> '' ${fromCond} ${toCond}
        GROUP BY city, region, country
        ORDER BY count DESC LIMIT 20
      `),
      db.execute<TzRow>(sql`
        SELECT timezone, count(DISTINCT session_id)::int AS count
        FROM page_views
        WHERE timezone IS NOT NULL ${fromCond} ${toCond}
        GROUP BY timezone ORDER BY count DESC LIMIT 20
      `),
    ]);

    const pkg =
      (pkgResult as unknown as { rows?: PkgRow[] }).rows ??
      (pkgResult as unknown as PkgRow[]);
    const types =
      (typeResult as unknown as { rows?: TypeRow[] }).rows ??
      (typeResult as unknown as TypeRow[]);
    const locs =
      (locResult as unknown as { rows?: LocRow[] }).rows ??
      (locResult as unknown as LocRow[]);
    const tzs =
      (tzResult as unknown as { rows?: TzRow[] }).rows ??
      (tzResult as unknown as TzRow[]);

    res.json({
      testPackages: (pkg ?? []).map((r) => ({ name: r.test_package, count: Number(r.count) })),
      collectionTypes: (types ?? []).map((r) => ({
        type: r.collection_type,
        count: Number(r.count),
      })),
      locations: (locs ?? []).map((r) => ({
        city: r.city,
        region: r.region,
        country: r.country,
        count: Number(r.count),
      })),
      timezones: (tzs ?? []).map((r) => ({ timezone: r.timezone, count: Number(r.count) })),
    });
  } catch (err) {
    req.log?.error({ err }, "Failed to load insights");
    res.status(500).json({ error: "Failed to load insights" });
  }
});

export default router;
