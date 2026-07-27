import { pgTable, serial, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const collectionTypeEnum = pgEnum("collection_type", ["homeCollection", "labDropIn"]);

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  patientName: text("patient_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  testPackage: text("test_package").notNull(),
  preferredDate: text("preferred_date").notNull(),
  collectionType: collectionTypeEnum("collection_type").notNull(),
  preferredTimeSlot: text("preferred_time_slot").notNull(),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true, createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
