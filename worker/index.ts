import { siteConfig } from "../src/lib/site";

export interface Env {
  ASSETS: Fetcher;
  DATA: KVNamespace;
  RESEND_API_KEY?: string;
  RESEND_WEBHOOK_SECRET?: string;
  TURNSTILE_SECRET_KEY?: string;
}

// Resendのサンドボックス送信元(独自ドメイン未検証のため)
const NOTIFY_FROM = `${siteConfig.siteNameShort} <onboarding@resend.dev>`;

type NotifyInquiry = {
  name: string;
  email: string;
  inquiryType: string;
  budget: string;
  message: string;
};

async function sendResendEmail(
  env: Env,
  payload: { to: string; replyTo?: string; subject: string; text: string }
): Promise<void> {
  if (!env.RESEND_API_KEY) return;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to: payload.to,
        ...(payload.replyTo ? { reply_to: payload.replyTo } : {}),
        subject: payload.subject,
        text: payload.text,
      }),
    });

    if (!res.ok) {
      console.error("Resend API error", res.status, await res.text());
    }
  } catch (err) {
    console.error("Failed to send email via Resend", err);
  }
}

async function sendNotificationEmail(env: Env, inquiry: NotifyInquiry): Promise<void> {
  await sendResendEmail(env, {
    to: siteConfig.email,
    replyTo: inquiry.email,
    subject: `【お問い合わせ】${inquiry.inquiryType} - ${inquiry.name}様`,
    text: [
      "サイトから新しいお問い合わせがありました。",
      "",
      `お名前: ${inquiry.name}`,
      `メールアドレス: ${inquiry.email}`,
      `種別: ${inquiry.inquiryType}`,
      `ご予算感: ${inquiry.budget || "未指定"}`,
      "",
      "お問い合わせ内容:",
      inquiry.message,
      "",
      "管理画面から返信できます。",
    ].join("\n"),
  });
}

async function sendConfirmationEmail(env: Env, inquiry: NotifyInquiry): Promise<void> {
  await sendResendEmail(env, {
    to: inquiry.email,
    replyTo: siteConfig.email,
    subject: `【${siteConfig.siteNameShort}】お問い合わせありがとうございます`,
    text: [
      `${inquiry.name} 様`,
      "",
      `この度は${siteConfig.siteNameShort}へお問い合わせいただき、ありがとうございます。`,
      "以下の内容で承りました。内容を確認のうえ、担当より折り返しご連絡いたします。",
      "",
      "---",
      `種別: ${inquiry.inquiryType}`,
      `ご予算感: ${inquiry.budget || "未指定"}`,
      "",
      inquiry.message,
      "---",
      "",
      "このメールは自動送信されています。返信いただいても担当に届きます。",
    ].join("\n"),
  });
}

async function verifyTurnstile(env: Env, token: string, ip: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;

  try {
    const form = new FormData();
    form.append("secret", env.TURNSTILE_SECRET_KEY);
    form.append("response", token);
    form.append("remoteip", ip);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    const result = (await res.json()) as { success: boolean };
    return result.success === true;
  } catch (err) {
    console.error("Turnstile verification failed", err);
    return false;
  }
}

const REQUIRED_FIELDS = ["name", "email", "inquiryType", "message"] as const;

const MAX_LENGTHS: Record<(typeof REQUIRED_FIELDS)[number] | "budget", number> = {
  name: 100,
  email: 254,
  inquiryType: 50,
  message: 4000,
  budget: 50,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RATE_LIMIT_WINDOW_SECONDS = 600; // 10分
const RATE_LIMIT_MAX_REQUESTS = 5;

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self' https://cloudflareinsights.com https://static.cloudflareinsights.com https://challenges.cloudflare.com",
    "frame-src https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
};

function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function isRateLimited(env: Env, ip: string): Promise<boolean> {
  const key = `ratelimit:contact:${ip}`;
  const current = Number((await env.DATA.get(key)) ?? "0");
  if (current >= RATE_LIMIT_MAX_REQUESTS) return true;

  await env.DATA.put(key, String(current + 1), {
    expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
  });
  return false;
}

async function handleContact(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  if (await isRateLimited(env, ip)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  // ハニーポット: 人間には見えない項目が埋まっていればボットとみなし、静かに成功を返す
  if (typeof data.company === "string" && data.company.trim() !== "") {
    return Response.json({ ok: true });
  }

  const turnstileToken = typeof data["cf-turnstile-response"] === "string" ? data["cf-turnstile-response"] : "";
  if (!(await verifyTurnstile(env, turnstileToken, ip))) {
    return Response.json({ error: "turnstile_failed" }, { status: 400 });
  }

  for (const field of REQUIRED_FIELDS) {
    const value = data[field];
    if (!value || typeof value !== "string" || value.length > MAX_LENGTHS[field]) {
      return Response.json({ error: "missing_fields" }, { status: 400 });
    }
  }

  const email = data.email as string;
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "invalid_email" }, { status: 400 });
  }

  const budget = typeof data.budget === "string" ? data.budget : "";
  if (budget.length > MAX_LENGTHS.budget) {
    return Response.json({ error: "invalid_budget" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const receivedAt = Date.now();
  const key = `inquiry:${receivedAt}:${id}`;

  const inquiry: NotifyInquiry = {
    name: data.name as string,
    email,
    inquiryType: data.inquiryType as string,
    budget,
    message: data.message as string,
  };

  await env.DATA.put(
    key,
    JSON.stringify({
      id,
      ...inquiry,
      receivedAt,
      read: false,
      replies: [],
    }),
    { metadata: { read: false } }
  );

  ctx.waitUntil(sendNotificationEmail(env, inquiry));
  ctx.waitUntil(sendConfirmationEmail(env, inquiry));

  return Response.json({ ok: true });
}

// Resend webhookはSvix形式で署名される: https://resend.com/docs/dashboard/webhooks/verify-webhooks-requests
async function verifySvixSignature(
  secret: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  body: string
): Promise<boolean> {
  const secretBytes = Uint8Array.from(atob(secret.replace(/^whsec_/, "")), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signedContent = `${svixId}.${svixTimestamp}.${body}`;
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedContent));
  const expected = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

  return svixSignature
    .split(" ")
    .map((part) => part.split(",")[1])
    .filter(Boolean)
    .some((sig) => sig === expected);
}

async function handleResendWebhook(request: Request, env: Env): Promise<Response> {
  if (!env.RESEND_WEBHOOK_SECRET) return new Response("not configured", { status: 404 });

  const svixId = request.headers.get("svix-id") ?? "";
  const svixTimestamp = request.headers.get("svix-timestamp") ?? "";
  const svixSignature = request.headers.get("svix-signature") ?? "";
  const body = await request.text();

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("missing signature headers", { status: 400 });
  }

  const valid = await verifySvixSignature(env.RESEND_WEBHOOK_SECRET, svixId, svixTimestamp, svixSignature, body);
  if (!valid) {
    return new Response("invalid signature", { status: 401 });
  }

  let event: { type?: string; data?: { to?: string[]; subject?: string } };
  try {
    event = JSON.parse(body);
  } catch {
    return new Response("invalid json", { status: 400 });
  }

  const ALERT_TYPES = new Set(["email.bounced", "email.complained", "email.delivery_delayed"]);
  if (event.type && ALERT_TYPES.has(event.type)) {
    await sendResendEmail(env, {
      to: siteConfig.email,
      subject: `【メール配信エラー】${event.type}`,
      text: [
        `Resendから配信エラーの通知がありました: ${event.type}`,
        "",
        `宛先: ${(event.data?.to ?? []).join(", ") || "不明"}`,
        `件名: ${event.data?.subject ?? "不明"}`,
        "",
        "Resendダッシュボードの Logs で詳細を確認してください。",
      ].join("\n"),
    });
  }

  return Response.json({ ok: true });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact" && request.method === "POST") {
      return withSecurityHeaders(await handleContact(request, env, ctx));
    }

    if (url.pathname === "/api/resend-webhook" && request.method === "POST") {
      return withSecurityHeaders(await handleResendWebhook(request, env));
    }

    return withSecurityHeaders(await env.ASSETS.fetch(request));
  },
};
