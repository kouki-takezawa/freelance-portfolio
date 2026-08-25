export interface Env {
  ASSETS: Fetcher;
  DATA: KVNamespace;
  RESEND_API_KEY?: string;
}

const REQUIRED_FIELDS = ["name", "email", "inquiryType", "message"] as const;

// Resend sandbox sender (no custom domain verified yet — see README).
const NOTIFY_FROM = "Yorisoi Works <onboarding@resend.dev>";
const NOTIFY_TO = "takechin001031@icloud.com";

type Inquiry = {
  name: string;
  email: string;
  inquiryType: string;
  budget: string;
  message: string;
};

async function sendNotificationEmail(env: Env, inquiry: Inquiry): Promise<void> {
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
        to: NOTIFY_TO,
        reply_to: inquiry.email,
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
        ].join("\n"),
      }),
    });

    if (!res.ok) {
      console.error("Resend API error", res.status, await res.text());
    }
  } catch (err) {
    console.error("Failed to send notification email", err);
  }
}

async function handleContact(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  for (const field of REQUIRED_FIELDS) {
    if (!data[field] || typeof data[field] !== "string") {
      return Response.json({ error: "missing_fields" }, { status: 400 });
    }
  }

  const inquiry: Inquiry = {
    name: data.name as string,
    email: data.email as string,
    inquiryType: data.inquiryType as string,
    budget: (data.budget as string) ?? "",
    message: data.message as string,
  };

  const id = crypto.randomUUID();
  const receivedAt = Date.now();
  const key = `inquiry:${receivedAt}:${id}`;

  await env.DATA.put(
    key,
    JSON.stringify({
      id,
      ...inquiry,
      receivedAt,
      read: false,
    }),
    { metadata: { read: false } }
  );

  ctx.waitUntil(sendNotificationEmail(env, inquiry));

  return Response.json({ ok: true });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact" && request.method === "POST") {
      return handleContact(request, env, ctx);
    }

    return env.ASSETS.fetch(request);
  },
};
