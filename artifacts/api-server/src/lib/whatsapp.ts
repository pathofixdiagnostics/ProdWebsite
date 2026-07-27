export function whatsappConfigured(): boolean {
  return !!(process.env.WA_PHONE && process.env.WA_APIKEY);
}

export async function sendWhatsApp(message: string): Promise<void> {
  const phone = process.env.WA_PHONE;
  const apikey = process.env.WA_APIKEY;
  if (!phone || !apikey) return;

  const encoded = encodeURIComponent(message);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encoded}&apikey=${apikey}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`CallMeBot returned ${res.status}: ${await res.text()}`);
  }
}
