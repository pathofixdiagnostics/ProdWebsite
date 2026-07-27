import { Router } from "express";
import nodemailer from "nodemailer";
import { sendTelegram, telegramConfigured } from "../lib/telegram";

const router = Router();

router.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

/**
 * Debug endpoint — tests Telegram and email in one call.
 * In production it is hidden unless a DEBUG_TOKEN secret is set and
 * supplied via the `X-Debug-Token` header, so strangers can't trigger
 * real emails/messages. (Secrets are kept out of the URL/query string.)
 */
router.get("/test-notifications", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    const debugToken = process.env.DEBUG_TOKEN;
    if (!debugToken || req.header("X-Debug-Token") !== debugToken) {
      res.status(404).json({ error: "Not found" });
      return;
    }
  }

  const results: Record<string, string> = {};

  // Test Telegram
  if (telegramConfigured()) {
    try {
      await sendTelegram(
        "✅ <b>PATHOFIX DIAGNOSTICS</b>\n\nTest notification — Telegram is working correctly!"
      );
      results.telegram = "✅ sent successfully";
    } catch (err: any) {
      results.telegram = `❌ failed: ${err.message}`;
    }
  } else {
    results.telegram = "⚠️ not configured (TG_BOT_TOKEN or TG_CHAT_ID missing)";
  }

  // Test Email
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const labEmail = process.env.LAB_EMAIL ?? "pathofixdiagnostics@gmail.com";

  results.smtp_user = smtpUser ?? "(not set)";

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: smtpUser, pass: smtpPass },
      });
      await transporter.sendMail({
        from: smtpUser,
        to: labEmail,
        subject: "✅ PATHOFIX — Email Test",
        text: "Test notification — email is working correctly!",
      });
      results.email = `✅ sent to ${labEmail}`;
    } catch (err: any) {
      results.email = `❌ failed: ${err.message}`;
    }
  } else {
    results.email = "⚠️ not configured (SMTP_USER or SMTP_PASS missing)";
  }

  req.log.info({ results }, "Notification test results");
  res.json(results);
});

export default router;
