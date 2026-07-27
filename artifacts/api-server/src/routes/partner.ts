import { Router } from "express";
import nodemailer from "nodemailer";
import { db } from "@workspace/db";
import { partnerRequestsTable } from "@workspace/db";
import { SubmitPartnerBody } from "@workspace/api-zod";
import { sendTelegram, telegramConfigured } from "../lib/telegram";
import { buildTelegramMessage, buildEmailHtml, type NotificationField } from "../lib/notifications";

const router = Router();

const ORG_TYPE_LABELS: Record<string, string> = {
  hospital: "Hospital",
  clinic: "Clinic",
  doctor: "Independent Doctor",
  healthCenter: "Health Center",
  collectionCenter: "Collection Center",
};

function makeTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? "587", 10),
      secure: process.env.SMTP_PORT === "465",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

function smtpConfigured() {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
}

router.post("/partner", async (req, res) => {
  const parsed = SubmitPartnerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request data" });
    return;
  }

  const data = parsed.data;

  // 1. Save to DB first
  try {
    await db.insert(partnerRequestsTable).values({
      fullName: data.fullName,
      organizationName: data.organizationName,
      organizationType: data.organizationType,
      email: data.email,
      phone: data.phone,
      city: data.city,
      message: data.message ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to save partner request");
  }

  // 2. Build notification fields
  const orgLabel = ORG_TYPE_LABELS[data.organizationType] ?? data.organizationType;

  const fields: NotificationField[] = [
    { emoji: "👤", label: "Contact Name",      value: data.fullName },
    { emoji: "🏥", label: "Organization",      value: data.organizationName },
    { emoji: "🏷️", label: "Organization Type", value: orgLabel },
    { emoji: "📍", label: "City",              value: data.city },
    { emoji: "📞", label: "Phone Number",      value: data.phone },
    { emoji: "📧", label: "Email Address",     value: data.email },
    { emoji: "💬", label: "Message",           value: data.message },
  ];

  // 3. Fire-and-forget notifications
  if (telegramConfigured()) {
    const msg = buildTelegramMessage("🤝 NEW PARTNER REQUEST", fields);
    sendTelegram(msg).catch((err) =>
      req.log.error({ err }, "Failed to send partner Telegram notification")
    );
  }

  if (smtpConfigured()) {
    const labEmail = process.env.LAB_EMAIL ?? "pathofixdiagnostics@gmail.com";
    const transporter = makeTransporter();

    const { subject, html } = buildEmailHtml(
      "New Partnership Request",
      `New partner inquiry from ${data.organizationName} — ${data.city}`,
      fields,
      `<div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:14px 18px">
        <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#1E40AF;font-weight:600">
          🤝 &nbsp;Partnership request saved. Reply to this email or call ${data.phone} to follow up.
        </p>
      </div>`
    );

    transporter
      .sendMail({ from: process.env.SMTP_USER, to: labEmail, subject, html })
      .catch((err) => req.log.error({ err }, "Failed to send partner email"));
  }

  res.json({
    success: true,
    message: "Thank you. Our partnership team will contact you shortly.",
  });
});

export default router;
