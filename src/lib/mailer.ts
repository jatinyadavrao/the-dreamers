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

export async function sendOtpEmail(to: string, code: string, name?: string): Promise<void> {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "";
  const greeting = name ? `Hi ${name},` : "Hi,";
  const html = `
  <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#05060f;border-radius:16px;color:#e7ecff">
    <h1 style="margin:0 0 4px;font-size:22px;background:linear-gradient(120deg,#818cf8,#e879f9,#22d3ee);-webkit-background-clip:text;background-clip:text;color:transparent">The Dreamers</h1>
    <p style="color:#94a3b8;margin:0 0 24px;font-size:13px">Verify your email</p>
    <p style="margin:0 0 16px">${greeting}</p>
    <p style="margin:0 0 20px;color:#cbd5e1">Use this code to verify your account. It expires in 10 minutes.</p>
    <div style="font-size:36px;font-weight:800;letter-spacing:10px;text-align:center;padding:18px;border-radius:12px;background:rgba(129,140,248,0.12);border:1px solid rgba(129,140,248,0.3)">${code}</div>
    <p style="margin:24px 0 0;color:#64748b;font-size:12px">If you didn't sign up for The Dreamers, you can ignore this email.</p>
  </div>`;

  await getTransport().sendMail({
    from,
    to,
    subject: `${code} is your The Dreamers verification code`,
    text: `${greeting}\n\nYour verification code is ${code}. It expires in 10 minutes.`,
    html,
  });
}
