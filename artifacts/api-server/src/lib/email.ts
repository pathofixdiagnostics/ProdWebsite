import { Resend } from "resend";

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const client = new Resend(process.env.RESEND_API_KEY!);
  const from =
    process.env.EMAIL_FROM ?? "PathoFix Diagnostics <noreply@pathofixdiagnostics.in>";

  const { error } = await client.emails.send({
    from,
    to: [opts.to],
    subject: opts.subject,
    html: opts.html,
  });

  if (error) throw new Error(error.message);
}
