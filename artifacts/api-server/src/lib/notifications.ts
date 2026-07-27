/**
 * Shared notification builder.
 * Generates both Telegram (HTML) and email (HTML) content from a
 * list of labelled fields, always showing "Not provided by the user"
 * for empty/optional values.
 */

const EMPTY = "Not provided by the user";

export type NotificationField = {
  emoji: string;
  label: string;
  value: string | null | undefined;
};

function val(v: string | null | undefined): string {
  if (v === null || v === undefined || v.toString().trim() === "") return EMPTY;
  return v.toString().trim();
}

// ─── Telegram ────────────────────────────────────────────────────────────────

export function buildTelegramMessage(title: string, fields: NotificationField[]): string {
  const now = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const lines: string[] = [
    `<b>${title}</b>`,
    `<i>Received: ${now} IST</i>`,
    "",
  ];

  for (const f of fields) {
    lines.push(`${f.emoji} <b>${f.label}:</b>`);
    lines.push(val(f.value));
    lines.push("");
  }

  lines.push("─────────────────────");
  lines.push("<i>PATHOFIX DIAGNOSTICS · Krishnagiri</i>");

  return lines.join("\n");
}

// ─── Email HTML ───────────────────────────────────────────────────────────────

const BRAND_PURPLE = "#6B21A8";
const BRAND_PURPLE_DARK = "#4C1D95";
const BRAND_PURPLE_LIGHT = "#EDE9FE";
const BRAND_CYAN = "#0891B2";
const LAB_NAME = "PATHOFIX DIAGNOSTICS";
const LAB_TAGLINE = "Cell is our Priority";
const LAB_ADDRESS = "43 B, First Floor, State Bank Road, Co-operative Colony, Krishnagiri – 635 001";
const LAB_PHONE = "7200883952";
const LAB_EMAIL_ADDR = "pathofixdiagnostics@gmail.com";

function emailRow(field: NotificationField, alternate: boolean): string {
  const bg = alternate ? "#F5F3FF" : "#ffffff";
  const display = val(field.value);
  const isEmpty = display === EMPTY;
  const valueStyle = isEmpty
    ? `font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#9CA3AF;font-style:italic`
    : `font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#111827;font-weight:500`;

  return `
    <tr>
      <td style="padding:11px 16px;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;background:${bg};border-bottom:1px solid #F3F4F6;width:40%">
        ${field.emoji} ${field.label}
      </td>
      <td style="padding:11px 16px;${valueStyle};background:${bg};border-bottom:1px solid #F3F4F6">
        ${display}
      </td>
    </tr>
  `;
}

export function buildEmailHtml(
  title: string,
  subtitle: string,
  fields: NotificationField[],
  ctaHtml?: string
): { subject: string; html: string } {
  const now = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const rows = fields
    .map((f, i) => emailRow(f, i % 2 === 0))
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${LAB_NAME} – ${title}</title>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:24px 12px">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden">
          <tr>
            <td>

              <!-- Header -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:linear-gradient(135deg,${BRAND_PURPLE_DARK} 0%,${BRAND_PURPLE} 60%,${BRAND_CYAN} 100%);padding:28px 32px;border-radius:12px 12px 0 0;text-align:center">
                    <div style="display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);border-radius:8px;padding:6px 16px;margin-bottom:12px">
                      <span style="font-family:'Segoe UI',Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:3px;color:rgba(255,255,255,0.8);text-transform:uppercase">Diagnostic Laboratory</span>
                    </div>
                    <h1 style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:1px;text-transform:uppercase">${LAB_NAME}</h1>
                    <p style="margin:5px 0 0;font-family:Georgia,serif;font-size:13px;color:rgba(255,255,255,0.7);font-style:italic">${LAB_TAGLINE}</p>
                    <div style="margin-top:20px;display:inline-block;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);border-radius:100px;padding:7px 20px">
                      <span style="font-family:'Segoe UI',Arial,sans-serif;font-size:12px;font-weight:700;color:rgba(255,255,255,0.9);letter-spacing:1px;text-transform:uppercase">${title}</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Alert Banner -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:#FEF3C7;border-left:4px solid #F59E0B;padding:11px 32px">
                    <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#92400E;font-weight:600">🔔 &nbsp;${subtitle}</p>
                  </td>
                </tr>
              </table>

              <!-- Timestamp -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px">
                <tr>
                  <td style="padding:0 32px 10px">
                    <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;color:#9CA3AF;text-transform:uppercase">Submission Details</p>
                  </td>
                </tr>
              </table>

              <!-- Fields Table -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="margin:0 32px;width:calc(100% - 64px);border-radius:8px;overflow:hidden;border:1px solid #E5E7EB">
                <tr>
                  <td style="padding:11px 16px;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;background:#F5F3FF;border-bottom:1px solid #F3F4F6;width:40%">
                    🕐 Date &amp; Time
                  </td>
                  <td style="padding:11px 16px;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#111827;font-weight:500;background:#F5F3FF;border-bottom:1px solid #F3F4F6">
                    ${now} IST
                  </td>
                </tr>
                ${rows}
              </table>

              ${ctaHtml ? `
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;padding:0 32px">
                <tr><td>${ctaHtml}</td></tr>
              </table>` : ""}

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px">
                <tr><td style="height:1px;background:linear-gradient(to right,transparent,#DDD6FE,transparent)"></td></tr>
              </table>

              <!-- Footer -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;padding:0 32px 28px">
                <tr>
                  <td style="text-align:center">
                    <p style="margin:0 0 6px;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;font-weight:700;color:${BRAND_PURPLE};text-transform:uppercase;letter-spacing:1px">${LAB_NAME}</p>
                    <p style="margin:0 0 4px;font-family:'Segoe UI',Arial,sans-serif;font-size:11px;color:#6B7280">${LAB_ADDRESS}</p>
                    <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:11px;color:#6B7280">
                      <a href="tel:${LAB_PHONE}" style="color:${BRAND_PURPLE};text-decoration:none;font-weight:600">${LAB_PHONE}</a>
                      &nbsp;·&nbsp;
                      <a href="mailto:${LAB_EMAIL_ADDR}" style="color:${BRAND_PURPLE};text-decoration:none">${LAB_EMAIL_ADDR}</a>
                    </p>
                    <p style="margin:10px 0 0;font-family:'Segoe UI',Arial,sans-serif;font-size:10px;color:#D1D5DB;font-style:italic">${LAB_TAGLINE}</p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { subject: `[${LAB_NAME}] ${title}`, html };
}
