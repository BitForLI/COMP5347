/**
 * 通过 Resend 发送注册验证码。
 * 未配置 RESEND_API_KEY 时：开发环境仅在终端打印验证码；生产环境抛错。
 *
 * 注册「重发」与「首次发送」均为 POST /api/auth/register/send-code
 */

const RESEND_API = "https://api.resend.com/emails";

function buildContent(code) {
  const text = `Your verification code is ${code}. It expires in 10 minutes. Do not share this code.`;
  const html = `<p>Your verification code is <strong style="font-size:18px;letter-spacing:2px;">${code}</strong>.</p><p>It expires in 10 minutes. Do not share this code.</p>`;
  return { text, html };
}

async function sendViaResend({ to, from, subject, text, html, apiKey }) {
  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text,
      html,
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    let msg = `Resend error: ${res.status}`;
    try {
      const j = JSON.parse(raw);
      if (j?.message) msg = j.message;
    } catch {
      msg += ` ${raw.slice(0, 200)}`;
    }
    const err = new Error(msg);
    err.status = 502;
    throw err;
  }
}

function resolveResendFrom() {
  const fallback = "Quiz Game <onboarding@resend.dev>";
  const raw = (process.env.EMAIL_FROM || "").trim();
  if (!raw) return fallback;
  // Resend only allows From on domains you verify; public mail hosts (e.g. @gmail.com) are rejected.
  if (/@gmail\.com\b/i.test(raw)) {
    // eslint-disable-next-line no-console
    console.warn("[email] EMAIL_FROM must not be a @gmail.com address; using Resend test sender instead.");
    return fallback;
  }
  return raw;
}

async function sendRegistrationCodeEmail(to, code) {
  const from = resolveResendFrom();
  const subject = "Quiz Game — verification code";
  const { text, html } = buildContent(code);

  const resendKey = (process.env.RESEND_API_KEY || "").trim();
  if (resendKey) {
    await sendViaResend({ to, from, subject, text, html, apiKey: resendKey });
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Email is not configured: set RESEND_API_KEY in the environment.");
  }

  // eslint-disable-next-line no-console
  console.warn(`[email] RESEND_API_KEY not set; printing code in dev only: to=${to} code=${code}`);
}

module.exports = { sendRegistrationCodeEmail };
