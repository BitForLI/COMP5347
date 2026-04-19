/**
 * 通过 Resend 发送注册验证码。
 * 未配置 RESEND_API_KEY 时：开发环境仅在终端打印验证码；生产环境抛错。
 *
 * 注册「重发」与「首次发送」均为 POST /api/auth/register/send-code
 */

const RESEND_API = "https://api.resend.com/emails";

function buildContent(code) {
  const text = `你的验证码是：${code}（10 分钟内有效，请勿告诉他人。）`;
  const html = `<p>你的验证码是：<strong style="font-size:18px;letter-spacing:2px;">${code}</strong></p><p>10 分钟内有效，请勿告诉他人。</p>`;
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

async function sendRegistrationCodeEmail(to, code) {
  const from = (process.env.EMAIL_FROM || "miaomiao.emo@gmail.com").trim();
  const subject = "Quiz Game 注册验证码";
  const { text, html } = buildContent(code);

  const resendKey = (process.env.RESEND_API_KEY || "").trim();
  if (resendKey) {
    await sendViaResend({ to, from, subject, text, html, apiKey: resendKey });
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("未配置发信：请在环境变量中设置 RESEND_API_KEY");
  }

  // eslint-disable-next-line no-console
  console.warn(`[email] 未配置 RESEND_API_KEY，开发环境仅打印验证码：to=${to} code=${code}`);
}

module.exports = { sendRegistrationCodeEmail };
