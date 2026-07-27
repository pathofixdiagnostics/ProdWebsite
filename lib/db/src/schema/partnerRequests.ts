import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const partnerRequestsTable = pgTable("partner_requests", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  organizationName: text("organization_name").notNull(),
  organizationType: text("organization_type").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPartnerRequestSchema = createInsertSchema(partnerRequestsTable).omit({ id: true, createdAt: true });
export type InsertPartnerRequest = z.infer<typeof insertPartnerRequestSchema>;
export type PartnerRequest = typeof partnerRequestsTable.$inferSelect;
