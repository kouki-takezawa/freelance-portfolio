export interface Env {
  ASSETS: Fetcher;
  DATA: KVNamespace;
}

const REQUIRED_FIELDS = ["name", "email", "inquiryType", "message"] as const;

async function handleContact(request: Request, env: Env): Promise<Response> {
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

  const id = crypto.randomUUID();
  const receivedAt = Date.now();
  const key = `inquiry:${receivedAt}:${id}`;

  await env.DATA.put(
    key,
    JSON.stringify({
      id,
      name: data.name,
      email: data.email,
      inquiryType: data.inquiryType,
      budget: data.budget ?? "",
      message: data.message,
      receivedAt,
      read: false,
    })
  );

  return Response.json({ ok: true });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact" && request.method === "POST") {
      return handleContact(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
