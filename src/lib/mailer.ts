import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransport() {
  if (transporter) return transporter;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) throw new Error("SMTP_USER / SMTP_PASS not configured");
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  return transporter;
}

/** Escape text for HTML: a name typed at sign-up must never become markup in an email. */
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

export async function sendOtpEmail(to: string, code: string, name?: string): Promise<void> {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "";
  const plainName = (name ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, 80);
  const greeting = plainName ? `Hi ${plainName},` : "Hi,";
  const safeCode = code.replace(/\D/g, "").slice(0, 6);
  const html = `
  <div style="background:#eff0f1;padding:32px 16px;font-family:Onest,system-ui,-apple-system,'Segoe UI',Arial,sans-serif">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #dedfe0;border-radius:8px;padding:32px;color:#18191b">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px"><tr>
        <td style="width:22px;height:22px;background:#ff4a1f;border-radius:5px;text-align:center;font:600 13px/22px system-ui,sans-serif;color:#18191b">D</td>
        <td style="padding-left:10px;font:500 17px/22px system-ui,sans-serif;letter-spacing:-0.02em;color:#18191b">The Dreamers</td>
      </tr></table>
      <p style="margin:0 0 6px;font-size:22px;letter-spacing:-0.02em">Verify your email</p>
      <p style="margin:0 0 20px;color:#5b5c5e;font-size:15px">${escapeHtml(greeting)} use this code to finish creating your account. It expires in 10 minutes.</p>
      <div style="font:600 32px/1 'JetBrains Mono',ui-monospace,Menlo,monospace;letter-spacing:10px;text-align:center;padding:18px;border-radius:6px;background:#f4f4f5;border:1px solid #dedfe0">${safeCode}</div>
      <p style="margin:24px 0 0;color:#5b5c5e;font-size:13px">If you didn't sign up for The Dreamers, you can ignore this email.</p>
    </div>
  </div>`;

  await getTransport().sendMail({
    from,
    to,
    subject: `${safeCode} is your The Dreamers verification code`,
    text: `${greeting}\n\nYour verification code is ${safeCode}. It expires in 10 minutes.`,
    html,
  });
}
