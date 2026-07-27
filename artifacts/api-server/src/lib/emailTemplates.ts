const BRAND_PURPLE = "#6B21A8";
const BRAND_PURPLE_DARK = "#4C1D95";
const BRAND_PURPLE_LIGHT = "#EDE9FE";
const BRAND_CYAN = "#0891B2";

const LAB_NAME = "PATHOFIX DIAGNOSTICS";
const LAB_TAGLINE = "Cell is our Priority";
const LAB_ADDRESS = "43 B, First Floor, State Bank Road, Co-operative Colony, Krishnagiri – 635 001";
const LAB_PHONE = "7200883952";
const LAB_EMAIL_ADDR = "pathofixdiagnostics@gmail.com";

function header(title: string, subtitle: string, badgeLabel: string, badgeValue: string): string {
  return `
    <!-- Header -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background:linear-gradient(135deg,${BRAND_PURPLE_DARK} 0%,${BRAND_PURPLE} 60%,${BRAND_CYAN} 100%);padding:32px 40px;border-radius:12px 12px 0 0;text-align:center">
          <!-- Logo area -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="text-align:center;padding-bottom:16px">
                <div style="display:inline-block;background:rgba(255,255,255,0.15);border:2px solid rgba(255,255,255,0.3);border-radius:12px;padding:10px 20px">
                  <span style="font-family:'Segoe UI',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:3px;color:rgba(255,255,255,0.7);text-transform:uppercase">Diagnostic Laboratory</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="text-align:center">
                <h1 style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:1px;text-transform:uppercase">${LAB_NAME}</h1>
                <p style="margin:6px 0 0;font-family:Georgia,serif;font-size:14px;color:rgba(255,255,255,0.75);font-style:italic">${LAB_TAGLINE}</p>
              </td>
            </tr>
          </table>
          <!-- Badge -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px">
            <tr>
              <td style="text-align:center">
                <div style="display:inline-block;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);border-radius:100px;padding:8px 20px">
                  <span style="font-family:'Segoe UI',Arial,sans-serif;font-size:12px;font-weight:600;color:rgba(255,255,255,0.85);letter-spacing:1px;text-transform:uppercase">${title}</span>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Alert Banner -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background:#FEF3C7;border-left:4px solid #F59E0B;padding:12px 40px">
          <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#92400E;font-weight:600">
            🔔 &nbsp;${subtitle}
          </p>
        </td>
      </tr>
    </table>

    <!-- Reference Badge -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px">
      <tr>
        <td style="padding:0 40px">
          <table cellpadding="0" cellspacing="0" border="0" style="background:${BRAND_PURPLE_LIGHT};border:1px solid #DDD6FE;border-radius:12px;width:100%">
            <tr>
              <td style="padding:16px 24px">
                <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:11px;font-weight:700;color:${BRAND_PURPLE};letter-spacing:2px;text-transform:uppercase">${badgeLabel}</p>
                <p style="margin:4px 0 0;font-family:'Segoe UI',Arial,sans-serif;font-size:22px;font-weight:900;color:${BRAND_PURPLE_DARK}">${badgeValue}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

function infoRow(label: string, value: string, highlight = false): string {
  const bg = highlight ? "#F5F3FF" : "#ffffff";
  return `
    <tr>
      <td style="padding:12px 16px;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;background:${bg};border-bottom:1px solid #F3F4F6;width:38%">${label}</td>
      <td style="padding:12px 16px;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#111827;background:${bg};border-bottom:1px solid #F3F4F6;font-weight:500">${value}</td>
    </tr>
  `;
}

function footer(): string {
  return `
    <!-- Divider -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px">
      <tr><td style="height:1px;background:linear-gradient(to right,transparent,#DDD6FE,transparent)"></td></tr>
    </table>

    <!-- Footer -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;padding:0 40px 32px">
      <tr>
        <td style="text-align:center">
          <p style="margin:0 0 8px;font-family:'Segoe UI',Arial,sans-serif;font-size:13px;font-weight:700;color:${BRAND_PURPLE};text-transform:uppercase;letter-spacing:1px">${LAB_NAME}</p>
          <p style="margin:0 0 4px;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#6B7280">${LAB_ADDRESS}</p>
          <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#6B7280">
            <a href="tel:${LAB_PHONE}" style="color:${BRAND_PURPLE};text-decoration:none;font-weight:600">${LAB_PHONE}</a>
            &nbsp;·&nbsp;
            <a href="mailto:${LAB_EMAIL_ADDR}" style="color:${BRAND_PURPLE};text-decoration:none">${LAB_EMAIL_ADDR}</a>
          </p>
          <p style="margin:12px 0 0;font-family:'Segoe UI',Arial,sans-serif;font-size:11px;color:#D1D5DB;font-style:italic">${LAB_TAGLINE}</p>
        </td>
      </tr>
    </table>
  `;
}

function wrap(content: string): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${LAB_NAME}</title></head>
  <body style="margin:0;padding:0;background:#F3F4F6;font-family:'Segoe UI',Arial,sans-serif">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:32px 16px">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden">
            <tr><td>${content}</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

// ─── BOOKING: Lab Notification ───────────────────────────────────────────────

export function bookingLabEmail(opts: {
  bookingId: number;
  patientName: string;
  phone: string;
  email: string | null | undefined;
  testPackage: string;
  collectionType: string;
  preferredDate: string;
  preferredTimeSlot: string;
  address: string | null | undefined;
  notes: string | null | undefined;
}): { subject: string; html: string } {
  const collectionLabel = opts.collectionType === "homeCollection" ? "🏠 Home Sample Collection" : "🏥 Lab Drop-In";
  const html = wrap(`
    ${header(
      "New Test Booking",
      `Action required — New booking from ${opts.patientName}`,
      `Booking Reference`,
      `#${opts.bookingId}`
    )}

    <!-- Section title -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px">
      <tr>
        <td style="padding:0 40px 12px">
          <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;color:#9CA3AF;text-transform:uppercase">Patient & Test Details</p>
        </td>
      </tr>
    </table>

    <!-- Info table -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 40px;width:calc(100% - 80px);border-radius:8px;overflow:hidden;border:1px solid #E5E7EB">
      ${infoRow("Patient Name", opts.patientName, true)}
      ${infoRow("Phone", `<a href="tel:${opts.phone}" style="color:${BRAND_PURPLE};font-weight:700;text-decoration:none">${opts.phone}</a>`)}
      ${infoRow("Email", opts.email ? `<a href="mailto:${opts.email}" style="color:${BRAND_CYAN};text-decoration:none">${opts.email}</a>` : "—", true)}
      ${infoRow("Test / Package", `<strong>${opts.testPackage}</strong>`)}
      ${infoRow("Collection Type", collectionLabel, true)}
      ${infoRow("Preferred Date", `<strong>${opts.preferredDate}</strong>`)}
      ${infoRow("Preferred Time", opts.preferredTimeSlot, true)}
      ${opts.address ? infoRow("Collection Address", opts.address) : ""}
      ${opts.notes ? infoRow("Notes", `<em>${opts.notes}</em>`, true) : ""}
    </table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;padding:0 40px">
      <tr>
        <td style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:16px 20px">
          <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#166534;font-weight:600">
            ✅ &nbsp;Booking saved to database. Please call the patient to confirm the appointment.
          </p>
        </td>
      </tr>
    </table>

    ${footer()}
  `);

  return {
    subject: `🔬 New Booking #${opts.bookingId} — ${opts.patientName} · ${opts.testPackage}`,
    html,
  };
}

// ─── BOOKING: Patient Confirmation ───────────────────────────────────────────

export function bookingPatientEmail(opts: {
  bookingId: number;
  patientName: string;
  phone: string;
  testPackage: string;
  collectionType: string;
  preferredDate: string;
  preferredTimeSlot: string;
}): { subject: string; html: string } {
  const collectionLabel = opts.collectionType === "homeCollection" ? "Home Sample Collection" : "Lab Drop-In";
  const html = wrap(`
    ${header(
      "Booking Received",
      `Your test booking is confirmed — we'll be in touch shortly`,
      `Your Booking Reference`,
      `#${opts.bookingId}`
    )}

    <!-- Greeting -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px">
      <tr>
        <td style="padding:0 40px">
          <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:16px;color:#111827;font-weight:600">Dear ${opts.patientName},</p>
          <p style="margin:8px 0 0;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#4B5563;line-height:1.6">
            Thank you for choosing <strong>${LAB_NAME}</strong>. Your booking has been received and our team will call you shortly to confirm your appointment.
          </p>
        </td>
      </tr>
    </table>

    <!-- Section title -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px">
      <tr>
        <td style="padding:0 40px 12px">
          <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;color:#9CA3AF;text-transform:uppercase">Your Booking Summary</p>
        </td>
      </tr>
    </table>

    <!-- Info table -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 40px;width:calc(100% - 80px);border-radius:8px;overflow:hidden;border:1px solid #E5E7EB">
      ${infoRow("Test / Package", `<strong>${opts.testPackage}</strong>`, true)}
      ${infoRow("Collection Type", collectionLabel)}
      ${infoRow("Date", `<strong>${opts.preferredDate}</strong>`, true)}
      ${infoRow("Time Slot", opts.preferredTimeSlot)}
    </table>

    <!-- What's next -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;padding:0 40px">
      <tr>
        <td style="background:${BRAND_PURPLE_LIGHT};border-left:3px solid ${BRAND_PURPLE};border-radius:0 8px 8px 0;padding:16px 20px">
          <p style="margin:0 0 8px;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;font-weight:700;color:${BRAND_PURPLE};text-transform:uppercase;letter-spacing:1px">What happens next?</p>
          <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#4C1D95;line-height:1.7">
            1. Our team will call <strong>${opts.phone}</strong> to confirm your slot.<br>
            2. Please arrive 5 minutes early if visiting the lab.<br>
            3. Fasting tests require 8–10 hours of fasting.
          </p>
        </td>
      </tr>
    </table>

    <!-- Contact -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;padding:0 40px">
      <tr>
        <td style="text-align:center;padding:16px 0">
          <p style="margin:0 0 12px;font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#6B7280">Have a question? Call us directly.</p>
          <a href="tel:${LAB_PHONE}" style="display:inline-block;background:${BRAND_PURPLE};color:#ffffff;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:100px;letter-spacing:0.5px">📞 &nbsp;${LAB_PHONE}</a>
        </td>
      </tr>
    </table>

    ${footer()}
  `);

  return {
    subject: `✅ Booking Confirmed — ${opts.testPackage} on ${opts.preferredDate} | ${LAB_NAME}`,
    html,
  };
}

// ─── PARTNER: Lab Notification ────────────────────────────────────────────────

export function partnerLabEmail(opts: {
  fullName: string;
  organizationName: string;
  organizationType: string;
  email: string;
  phone: string;
  city: string;
  message: string | null | undefined;
}): { subject: string; html: string } {
  const orgTypeLabels: Record<string, string> = {
    hospital: "🏥 Hospital",
    clinic: "🏥 Clinic",
    doctor: "👨‍⚕️ Doctor",
    healthCenter: "🏪 Health Center",
    collectionCenter: "🧪 Collection Center",
  };
  const orgLabel = orgTypeLabels[opts.organizationType] ?? opts.organizationType;

  const html = wrap(`
    ${header(
      "Partnership Request",
      `New partner inquiry from ${opts.organizationName} — ${opts.city}`,
      `Organization`,
      opts.organizationName
    )}

    <!-- Section title -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px">
      <tr>
        <td style="padding:0 40px 12px">
          <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;color:#9CA3AF;text-transform:uppercase">Contact & Organization Details</p>
        </td>
      </tr>
    </table>

    <!-- Info table -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 40px;width:calc(100% - 80px);border-radius:8px;overflow:hidden;border:1px solid #E5E7EB">
      ${infoRow("Contact Name", `<strong>${opts.fullName}</strong>`, true)}
      ${infoRow("Organization", opts.organizationName)}
      ${infoRow("Type", orgLabel, true)}
      ${infoRow("City", opts.city)}
      ${infoRow("Phone", `<a href="tel:${opts.phone}" style="color:${BRAND_PURPLE};font-weight:700;text-decoration:none">${opts.phone}</a>`, true)}
      ${infoRow("Email", `<a href="mailto:${opts.email}" style="color:${BRAND_CYAN};text-decoration:none">${opts.email}</a>`)}
      ${opts.message ? infoRow("Message", `<em style="color:#374151">${opts.message}</em>`, true) : ""}
    </table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;padding:0 40px">
      <tr>
        <td style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:16px 20px">
          <p style="margin:0;font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#1E40AF;font-weight:600">
            🤝 &nbsp;Partnership request saved. Reply to this email or call <a href="tel:${opts.phone}" style="color:#1E40AF">${opts.phone}</a> to follow up.
          </p>
        </td>
      </tr>
    </table>

    <!-- Quick Reply Button -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;padding:0 40px">
      <tr>
        <td style="text-align:center;padding:8px 0 16px">
          <a href="mailto:${opts.email}?subject=Re: Partnership with PATHOFIX DIAGNOSTICS" style="display:inline-block;background:${BRAND_CYAN};color:#ffffff;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:100px;letter-spacing:0.5px">✉️ &nbsp;Reply to ${opts.fullName}</a>
        </td>
      </tr>
    </table>

    ${footer()}
  `);

  return {
    subject: `🤝 New Partner Request — ${opts.organizationName} (${opts.city})`,
    html,
  };
}
