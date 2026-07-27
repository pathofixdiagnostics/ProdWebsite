/** Official Telegram Bot API notification helper */

export function telegramConfigured(): boolean {
  return !!(process.env.TG_BOT_TOKEN && process.env.TG_CHAT_ID);
}

export async function sendTelegram(message: string): Promise<void> {
  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;

  if (!token || !chatId) return;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    }),
  });

  const body = await res.json() as { ok: boolean; description?: string };
  if (!body.ok) {
    throw new Error(`Telegram API error: ${body.description}`);
  }
}
