import { Router } from "express";
import { db } from "@workspace/db";
import { bookingsTable } from "@workspace/db";
import { SubmitBookingBody } from "@workspace/api-zod";
import { sendTelegram, telegramConfigured } from "../lib/telegram";
import { buildTelegramMessage, buildEmailHtml, type NotificationField } from "../lib/notifications";
import { emailConfigured, sendEmail } from "../lib/email";

const router = Router();

const TIME_SLOT_LABELS: Record<string, string> = {
  "08:00-09:00": "8:00 AM – 9:00 AM",
  "09:00-10:00": "9:00 AM – 10:00 AM",
  "10:00-11:00": "10:00 AM – 11:00 AM",
  "11:00-12:00": "11:00 AM – 12:00 PM",
  "12:00-13:00": "12:00 PM – 1:00 PM",
  "13:00-14:00": "1:00 PM – 2:00 PM",
  "14:00-15:00": "2:00 PM – 3:00 PM",
  "15:00-16:00": "3:00 PM – 4:00 PM",
  "16:00-17:00": "4:00 PM – 5:00 PM",
  "17:00-18:00": "5:00 PM – 6:00 PM",
  "18:00-19:00": "6:00 PM – 7:00 PM",
  "19:00-20:00": "7:00 PM – 8:00 PM",
};


router.post("/booking", async (req, res) => {
  const parsed = SubmitBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid booking data" });
    return;
  }

  const data = parsed.data;
  const timeLabel = TIME_SLOT_LABELS[data.preferredTimeSlot] ?? data.preferredTimeSlot;
  const collectionLabel = data.collectionType === "homeCollection" ? "Home Collection" : "Visit Our Lab";

  // 1. Save to DB first
  let bookingId: number;
  try {
    const [inserted] = await db
      .insert(bookingsTable)
      .values({
        patientName: data.patientName,
        phone: data.phone,
        email: data.email ?? null,
        testPackage: data.testPackage,
        preferredDate: data.preferredDate,
        collectionType: data.collectionType as "homeCollection" | "labDropIn",
        preferredTimeSlot: data.preferredTimeSlot,
        address: data.address ?? null,
        notes: data.notes ?? null,
      })
      .returning({ id: bookingsTable.id });

    bookingId = inserted.id;
  } catch (err) {
    req.log.error({ err }, "Failed to save booking");
    res.status(500).json({ error: "Failed to save booking" });
    return;
  }

  // 2. Build notification fields
  const fields: NotificationField[] = [
    { emoji: "🔢", label: "Booking ID",       value: `#${bookingId}` },
    { emoji: "👤", label: "Patient Name",      value: data.patientName },
    { emoji: "📞", label: "Phone Number",      value: data.phone },
    { emoji: "📧", label: "Email",             value: data.email },
    { emoji: "🧪", label: "Test / Package",    value: data.testPackage },
    { emoji: "🚗", label: "Collection Type",   value: collectionLabel },
    { emoji: "📅", label: "Preferred Date",    value: data.preferredDate },
    { emoji: "⏰", label: "Preferred Time",    value: timeLabel },
    { emoji: "🏠", label: "Collection Address",value: data.address },
    { emoji: "📝", label: "Additional Notes",  value: data.notes },
  ];

  // 3. Fire-and-forget notifications
  if (telegramConfigured()) {
    const msg = buildTelegramMessage("🧪 NEW TEST BOOKING", fields);
    sendTelegram(msg).catch((err) =>
      req.log.error({ err }, "Failed to send booking Telegram notification")
    );
  }

  if (emailConfigured()) {
    const labEmail = process.env.LAB_EMAIL ?? "pathofixdiagnostics@gmail.com";

    const { subject, html } = buildEmailHtml(
      "New Test Booking",
      `Action required — New booking #${bookingId} from ${data.patientName}`,
      fields,
      `<div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:14px 18px">
        <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#166534;font-weight:600">
          ✅ &nbsp;Booking saved. Please call the patient to confirm the appointment.
        </p>
      </div>`
    );

    sendEmail({ to: labEmail, subject, html })
      .catch((err) => req.log.error({ err }, "Failed to send booking email"));
  }

  res.json({
    success: true,
    message: "Your booking has been received. We will confirm your appointment shortly.",
    bookingId,
  });
});

export default router;
