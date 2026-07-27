import { Router } from "express";
import { sendTelegram, telegramConfigured } from "../lib/telegram";
import { emailConfigured, sendEmail } from "../lib/email";

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
  const labEmail = process.env.LAB_EMAIL ?? "pathofixdiagnostics@gmail.com";
  results.resend_api_key = process.env.RESEND_API_KEY ? "(set)" : "(not set)";

  if (emailConfigured()) {
    try {
      await sendEmail({
        to: labEmail,
        subject: "✅ PATHOFIX — Email Test",
        html: "<p>Test notification — email is working correctly!</p>",
      });
      results.email = `✅ sent to ${labEmail}`;
    } catch (err: any) {
      results.email = `❌ failed: ${err.message}`;
    }
  } else {
    results.email = "⚠️ not configured (RESEND_API_KEY missing)";
  }

  req.log.info({ results }, "Notification test results");
  res.json(results);
});

export default router;
