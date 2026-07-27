import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// One row per page load. A "visit" is a distinct session_id; a "page view"
// is a row. Kept deliberately minimal — no IP, no personal data.
export const pageViewsTable = pgTable("page_views", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  path: text("path").notNull(),
  // IANA timezone from browser (e.g. "Asia/Kolkata"). Nullable for rows created before this column was added.
  timezone: text("timezone"),
  // IP-based geo fields — populated asynchronously after insert. Nullable for older rows.
  city: text("city"),
  region: text("region"),
  country: text("country"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PageView = typeof pageViewsTable.$inferSelect;
