export interface Env {
  ASSETS: Fetcher;
  DATA: KVNamespace;
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
    "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self' https://cloudflareinsights.com https://static.cloudflareinsights.com",
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

async function handleContact(request: Request, env: Env): Promise<Response> {
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

  await env.DATA.put(
    key,
    JSON.stringify({
      id,
      name: data.name,
      email,
      inquiryType: data.inquiryType,
      budget,
      message: data.message,
      receivedAt,
      read: false,
    }),
    { metadata: { read: false } }
  );

  return Response.json({ ok: true });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact" && request.method === "POST") {
      return withSecurityHeaders(await handleContact(request, env));
    }

    return withSecurityHeaders(await env.ASSETS.fetch(request));
  },
};
