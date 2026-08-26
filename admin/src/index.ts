import { Hono, type Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createSessionCookie, timingSafeEqual, verifySessionCookie } from "./auth";
import { getJsonFile, putJsonFile } from "./github";
import { getAnalyticsSummary, getTodayPageviews } from "./analytics";
import {
  computeRevenue,
  createOrder,
  getOrder,
  listOrders,
  ordersToCsv,
  putOrder,
} from "./orders";
import { listTrash, moveToTrash, purgeTrash, restoreFromTrash } from "./trash";
import {
  analyticsPage,
  blogPage,
  inquiriesPage,
  loginPage,
  orderFormPage,
  ordersListPage,
  overviewPage,
  revenuePage,
  seoPage,
  servicesPage,
  trashPage,
  worksPage,
} from "./templates";
import {
  ORDER_SERVICE_TYPES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  SEO_PAGES,
  type BlogPost,
  type Inquiry,
  type Order,
  type OrderStatus,
  type PaymentStatus,
  type ServiceMenu,
  type SeoMap,
  type WorkCase,
} from "./types";

type Bindings = {
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
  CONTENT_GITHUB_TOKEN: string;
  CF_ANALYTICS_TOKEN: string;
  RESEND_API_KEY?: string;
  DATA: KVNamespace;
};

// Resendのサンドボックス送信元(独自ドメイン未検証のため)
const NOTIFY_FROM = "ヨリソイワークス <onboarding@resend.dev>";
const OWNER_EMAIL = "takechin001031@icloud.com";

async function sendReplyEmail(
  env: Bindings,
  inquiry: Inquiry,
  message: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!env.RESEND_API_KEY) {
    return { ok: false, error: "RESEND_API_KEYが設定されていないため送信できません。" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to: inquiry.email,
        reply_to: OWNER_EMAIL,
        subject: `Re: お問い合わせありがとうございます(${inquiry.inquiryType})`,
        text: [
          `${inquiry.name} 様`,
          "",
          message,
          "",
          "---",
          "このメールに直接返信いただくことでも、担当者に届きます。",
        ].join("\n"),
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return { ok: false, error: `Resend API error (${res.status}): ${detail}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

async function sendSecurityAlertEmail(env: Bindings, subject: string, text: string): Promise<void> {
  if (!env.RESEND_API_KEY) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: NOTIFY_FROM, to: OWNER_EMAIL, subject, text }),
    });
    if (!res.ok) console.error("Resend API error", res.status, await res.text());
  } catch (err) {
    console.error("Failed to send security alert email", err);
  }
}

const COOKIE_NAME = "admin_session";

type AppContext = Context<{ Bindings: Bindings }>;

const app = new Hono<{ Bindings: Bindings }>();

function slugify(text: string): string {
  const cleaned = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9぀-ヿ゠-ヿ一-龯]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "item";
}

async function getUnreadCount(env: Bindings): Promise<number> {
  // list()のmetadataはKVの結果整合性により削除直後も古い値を返すことがあるため、
  // 実際の値を取得して判定する(お問い合わせ一覧と同じロジックに揃える)
  const inquiries = await listInquiries(env);
  return inquiries.filter((i) => !i.read).length;
}

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
};

app.use("*", async (c, next) => {
  await next();
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    c.header(key, value);
  }
});

// SameSite=Laxのcookieでは防ぎきれない場合に備えたCSRF対策の保険
app.use("*", async (c, next) => {
  const method = c.req.method;
  if (method !== "GET" && method !== "HEAD") {
    const origin = c.req.header("Origin");
    if (origin && origin !== new URL(c.req.url).origin) {
      return c.text("Forbidden", 403);
    }
  }
  await next();
});

const LOGIN_RATE_LIMIT_WINDOW_SECONDS = 60 * 15;
const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 8;

app.get("/login", (c) => c.html(loginPage()));

app.post("/login", async (c) => {
  const ip = c.req.header("CF-Connecting-IP") ?? "unknown";
  const rateLimitKey = `loginattempt:${ip}`;

  const attempts = Number((await c.env.DATA.get(rateLimitKey)) ?? "0");
  if (attempts >= LOGIN_RATE_LIMIT_MAX_ATTEMPTS) {
    return c.html(
      loginPage("ログイン試行回数が多すぎます。しばらくしてから再度お試しください。"),
      429
    );
  }

  const body = await c.req.parseBody();
  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");

  const okEmail = timingSafeEqual(email.toLowerCase(), c.env.ADMIN_EMAIL.toLowerCase());
  const okPassword = timingSafeEqual(password, c.env.ADMIN_PASSWORD);

  if (!okEmail || !okPassword) {
    const nextAttempts = attempts + 1;
    await c.env.DATA.put(rateLimitKey, String(nextAttempts), {
      expirationTtl: LOGIN_RATE_LIMIT_WINDOW_SECONDS,
    });
    if (nextAttempts === LOGIN_RATE_LIMIT_MAX_ATTEMPTS) {
      c.executionCtx.waitUntil(
        sendSecurityAlertEmail(
          c.env,
          "【セキュリティ警告】管理画面へのログイン試行が多発しています",
          [
            `IPアドレス ${ip} から、短時間に${LOGIN_RATE_LIMIT_MAX_ATTEMPTS}回のログイン失敗がありました。`,
            "この後しばらくの間、このIPからのログインはブロックされます。",
            "心当たりがない場合は、ADMIN_PASSWORDの変更を検討してください。",
          ].join("\n")
        )
      );
    }
    return c.html(loginPage("メールアドレスまたはパスワードが違います"), 401);
  }

  await c.env.DATA.delete(rateLimitKey);

  const cookieValue = await createSessionCookie(email, c.env.SESSION_SECRET);
  setCookie(c, COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return c.redirect("/");
});

app.post("/logout", (c) => {
  deleteCookie(c, COOKIE_NAME, { path: "/" });
  return c.redirect("/login");
});

// 以降のルートは認証必須
app.use("/*", async (c, next) => {
  const cookieValue = getCookie(c, COOKIE_NAME);
  const email = await verifySessionCookie(cookieValue, c.env.SESSION_SECRET);
  if (!email) {
    return c.redirect("/login");
  }
  await next();
});

app.get("/", async (c) => {
  try {
    const [works, services, blog, orders, inquiries, todayPageviews] =
      await Promise.all([
        getJsonFile<WorkCase[]>(c.env.CONTENT_GITHUB_TOKEN, "content/works.json"),
        getJsonFile<ServiceMenu[]>(c.env.CONTENT_GITHUB_TOKEN, "content/services.json"),
        getJsonFile<BlogPost[]>(c.env.CONTENT_GITHUB_TOKEN, "content/blog.json"),
        listOrders(c.env),
        listInquiries(c.env),
        getTodayPageviews(c.env.CF_ANALYTICS_TOKEN),
      ]);
    const revenue = computeRevenue(orders);
    return c.html(
      overviewPage({
        worksCount: works.value.length,
        servicesCount: services.value.length,
        blogCount: blog.value.length,
        unreadCount: inquiries.filter((i) => !i.read).length,
        inquiriesCount: inquiries.length,
        thisMonthRevenue: revenue.thisMonthRevenue,
        unpaidTotal: revenue.unpaidTotal,
        inProgressCount: revenue.inProgressCount,
        overdueCount: revenue.overdueCount,
        todayPageviews,
      })
    );
  } catch (err) {
    return c.html(
      overviewPage({
        worksCount: 0,
        servicesCount: 0,
        blogCount: 0,
        unreadCount: 0,
        inquiriesCount: 0,
        thisMonthRevenue: 0,
        unpaidTotal: 0,
        inProgressCount: 0,
        overdueCount: 0,
        todayPageviews: 0,
        message: { type: "error", text: (err as Error).message },
      }),
      500
    );
  }
});

app.get("/works", async (c) => {
  try {
    const [works, unreadCount] = await Promise.all([
      getJsonFile<WorkCase[]>(c.env.CONTENT_GITHUB_TOKEN, "content/works.json"),
      getUnreadCount(c.env),
    ]);
    return c.html(worksPage({ works: works.value, unreadCount }));
  } catch (err) {
    const unreadCount = await getUnreadCount(c.env);
    return c.html(
      worksPage({ works: [], unreadCount, message: { type: "error", text: (err as Error).message } }),
      500
    );
  }
});

app.post("/works", async (c) => {
  const body = await c.req.parseBody();
  const rowCount = Number(body.rowCount ?? 0);
  const items: WorkCase[] = [];

  for (let i = 0; i < rowCount; i++) {
    const title = String(body[`title_${i}`] ?? "").trim();
    const isDelete = body[`delete_${i}`] === "on";
    if (!title || isDelete) continue;

    items.push({
      slug: slugify(title),
      title,
      category: String(body[`category_${i}`] ?? "").trim(),
      summary: String(body[`summary_${i}`] ?? "").trim(),
      points: String(body[`points_${i}`] ?? "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      isSample: body[`isSample_${i}`] === "on",
    });
  }

  return saveContentAndRedisplay(c, {
    path: "content/works.json",
    value: items,
    label: "実績",
    render: async (message) => {
      const unreadCount = await getUnreadCount(c.env);
      return worksPage({ works: items, unreadCount, message });
    },
  });
});

app.get("/services", async (c) => {
  try {
    const [services, unreadCount] = await Promise.all([
      getJsonFile<ServiceMenu[]>(c.env.CONTENT_GITHUB_TOKEN, "content/services.json"),
      getUnreadCount(c.env),
    ]);
    return c.html(servicesPage({ services: services.value, unreadCount }));
  } catch (err) {
    const unreadCount = await getUnreadCount(c.env);
    return c.html(
      servicesPage({
        services: [],
        unreadCount,
        message: { type: "error", text: (err as Error).message },
      }),
      500
    );
  }
});

app.post("/services", async (c) => {
  const body = await c.req.parseBody();
  const rowCount = Number(body.rowCount ?? 0);
  const items: ServiceMenu[] = [];

  for (let i = 0; i < rowCount; i++) {
    const name = String(body[`name_${i}`] ?? "").trim();
    const isDelete = body[`delete_${i}`] === "on";
    if (!name || isDelete) continue;

    items.push({
      slug: slugify(name),
      name,
      priceFrom: String(body[`priceFrom_${i}`] ?? "").trim(),
      duration: String(body[`duration_${i}`] ?? "").trim(),
      description: String(body[`description_${i}`] ?? "").trim(),
      scope: String(body[`scope_${i}`] ?? "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    });
  }

  return saveContentAndRedisplay(c, {
    path: "content/services.json",
    value: items,
    label: "料金",
    render: async (message) => {
      const unreadCount = await getUnreadCount(c.env);
      return servicesPage({ services: items, unreadCount, message });
    },
  });
});

app.get("/seo", async (c) => {
  try {
    const [seo, unreadCount] = await Promise.all([
      getJsonFile<SeoMap>(c.env.CONTENT_GITHUB_TOKEN, "content/seo.json"),
      getUnreadCount(c.env),
    ]);
    return c.html(seoPage({ seo: seo.value, unreadCount }));
  } catch (err) {
    const unreadCount = await getUnreadCount(c.env);
    return c.html(
      seoPage({ seo: {}, unreadCount, message: { type: "error", text: (err as Error).message } }),
      500
    );
  }
});

app.post("/seo", async (c) => {
  const body = await c.req.parseBody();
  const seo: SeoMap = {};

  for (const { path, key } of SEO_PAGES) {
    seo[path] = {
      title: String(body[`seoTitle_${key}`] ?? "").trim(),
      description: String(body[`seoDescription_${key}`] ?? "").trim(),
    };
  }

  return saveContentAndRedisplay(c, {
    path: "content/seo.json",
    value: seo,
    label: "SEO設定",
    render: async (message) => {
      const unreadCount = await getUnreadCount(c.env);
      return seoPage({ seo, unreadCount, message });
    },
  });
});

app.get("/blog", async (c) => {
  try {
    const [blog, unreadCount] = await Promise.all([
      getJsonFile<BlogPost[]>(c.env.CONTENT_GITHUB_TOKEN, "content/blog.json"),
      getUnreadCount(c.env),
    ]);
    return c.html(blogPage({ posts: blog.value, unreadCount }));
  } catch (err) {
    const unreadCount = await getUnreadCount(c.env);
    return c.html(
      blogPage({ posts: [], unreadCount, message: { type: "error", text: (err as Error).message } }),
      500
    );
  }
});

app.post("/blog", async (c) => {
  const body = await c.req.parseBody();
  const rowCount = Number(body.rowCount ?? 0);
  const items: BlogPost[] = [];

  for (let i = 0; i < rowCount; i++) {
    const title = String(body[`title_${i}`] ?? "").trim();
    const isDelete = body[`delete_${i}`] === "on";
    if (!title || isDelete) continue;

    items.push({
      slug: slugify(title),
      title,
      category: String(body[`category_${i}`] ?? "").trim() || "お知らせ",
      excerpt: String(body[`excerpt_${i}`] ?? "").trim(),
      publishedAt:
        String(body[`publishedAt_${i}`] ?? "").trim() ||
        new Date().toISOString().slice(0, 10),
      body: String(body[`body_${i}`] ?? "").trim(),
    });
  }

  return saveContentAndRedisplay(c, {
    path: "content/blog.json",
    value: items,
    label: "お知らせ",
    render: async (message) => {
      const unreadCount = await getUnreadCount(c.env);
      return blogPage({ posts: items, unreadCount, message });
    },
  });
});

app.get("/orders", async (c) => {
  const [orders, unreadCount] = await Promise.all([
    listOrders(c.env),
    getUnreadCount(c.env),
  ]);
  const revenue = computeRevenue(orders);
  return c.html(
    ordersListPage({ orders, unreadCount, overdueCount: revenue.overdueCount })
  );
});

app.get("/orders/export.csv", async (c) => {
  const orders = await listOrders(c.env);
  const csv = ordersToCsv(orders);
  const today = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${today}.csv"`,
    },
  });
});

app.get("/orders/new", async (c) => {
  const [orders, unreadCount] = await Promise.all([
    listOrders(c.env),
    getUnreadCount(c.env),
  ]);
  const revenue = computeRevenue(orders);

  const fromInquiry = c.req.query("fromInquiry");
  const prefill = fromInquiry ? await buildOrderPrefillFromInquiry(c.env, fromInquiry) : undefined;

  return c.html(orderFormPage({ prefill, unreadCount, overdueCount: revenue.overdueCount }));
});

async function buildOrderPrefillFromInquiry(
  env: Bindings,
  inquiryKey: string
): Promise<Partial<Order> | undefined> {
  const raw = await env.DATA.get(inquiryKey);
  if (!raw) return undefined;
  const inquiry = JSON.parse(raw) as Inquiry;

  const serviceType = (ORDER_SERVICE_TYPES as readonly string[]).includes(inquiry.inquiryType)
    ? inquiry.inquiryType
    : "その他";

  return {
    clientName: inquiry.name,
    serviceType,
    orderDate: new Date().toISOString().slice(0, 10),
    notes: [
      `お問い合わせから自動作成(${new Date(inquiry.receivedAt).toLocaleDateString("ja-JP")})`,
      `メール: ${inquiry.email}`,
      inquiry.budget ? `予算感: ${inquiry.budget}` : "",
      "",
      inquiry.message,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

app.post("/orders", async (c) => {
  const body = await c.req.parseBody();
  const order = parseOrderForm(body);
  await createOrder(c.env, { ...order, id: crypto.randomUUID(), createdAt: Date.now() });
  return c.redirect("/orders");
});

app.get("/orders/:key/edit", async (c) => {
  const key = decodeURIComponent(c.req.param("key"));
  const [order, orders, unreadCount] = await Promise.all([
    getOrder(c.env, key),
    listOrders(c.env),
    getUnreadCount(c.env),
  ]);
  if (!order) return c.redirect("/orders");
  const revenue = computeRevenue(orders);
  return c.html(orderFormPage({ order, unreadCount, overdueCount: revenue.overdueCount }));
});

app.post("/orders/:key", async (c) => {
  const key = decodeURIComponent(c.req.param("key"));
  const existing = await getOrder(c.env, key);
  if (!existing) return c.redirect("/orders");
  const body = await c.req.parseBody();
  const updates = parseOrderForm(body);
  await putOrder(c.env, { ...existing, ...updates, key });
  return c.redirect("/orders");
});

app.post("/orders/:key/delete", async (c) => {
  const key = decodeURIComponent(c.req.param("key"));
  const raw = await c.env.DATA.get(key);
  if (raw) {
    const order = JSON.parse(raw) as Omit<Order, "key">;
    await moveToTrash(c.env, "order", key, `${order.clientName}(${order.serviceType})`, raw);
  }
  return c.redirect("/orders");
});

function parseOrderForm(
  body: Record<string, string | File>
): Omit<Order, "key" | "id" | "createdAt"> {
  const amountRaw = String(body.amount ?? "").replace(/[^0-9]/g, "");
  return {
    clientName: String(body.clientName ?? "").trim(),
    serviceType: String(body.serviceType ?? "").trim(),
    amount: amountRaw ? Number(amountRaw) : 0,
    orderDate: String(body.orderDate ?? "").trim(),
    dueDate: String(body.dueDate ?? "").trim(),
    status: (ORDER_STATUSES as readonly string[]).includes(String(body.status))
      ? (String(body.status) as OrderStatus)
      : "見積もり中",
    paymentStatus: (PAYMENT_STATUSES as readonly string[]).includes(String(body.paymentStatus))
      ? (String(body.paymentStatus) as PaymentStatus)
      : "未入金",
    paidDate: String(body.paidDate ?? "").trim(),
    notes: String(body.notes ?? "").trim(),
  };
}

app.get("/revenue", async (c) => {
  const [orders, unreadCount] = await Promise.all([
    listOrders(c.env),
    getUnreadCount(c.env),
  ]);
  const revenue = computeRevenue(orders);
  return c.html(
    revenuePage({
      unreadCount,
      overdueCount: revenue.overdueCount,
      thisMonthRevenue: revenue.thisMonthRevenue,
      yearToDateRevenue: revenue.yearToDateRevenue,
      unpaidTotal: revenue.unpaidTotal,
      pipelineTotal: revenue.pipelineTotal,
      monthly: revenue.monthly,
    })
  );
});

app.get("/analytics", async (c) => {
  const [summary, orders, unreadCount] = await Promise.all([
    getAnalyticsSummary(c.env.CF_ANALYTICS_TOKEN),
    listOrders(c.env),
    getUnreadCount(c.env),
  ]);
  const revenue = computeRevenue(orders);
  return c.html(
    analyticsPage({ summary, unreadCount, overdueCount: revenue.overdueCount })
  );
});

app.get("/inquiries", async (c) => {
  const inquiries = await listInquiries(c.env);
  const unreadCount = inquiries.filter((i) => !i.read).length;

  const unreadOnly = c.req.query("unread") === "1";
  const type = c.req.query("type") ?? "";
  const filtered = inquiries.filter((i) => {
    if (unreadOnly && i.read) return false;
    if (type && i.inquiryType !== type) return false;
    return true;
  });
  const allTypes = [...new Set(inquiries.map((i) => i.inquiryType))].filter(Boolean);

  return c.html(
    inquiriesPage({
      inquiries: filtered,
      allTypes,
      unreadCount,
      currentFilter: { unreadOnly, type },
    })
  );
});

app.post("/inquiries/:key/toggle-read", async (c) => {
  const key = decodeURIComponent(c.req.param("key"));
  const raw = await c.env.DATA.get(key);
  if (raw) {
    const inquiry = JSON.parse(raw) as Inquiry;
    const nextRead = !inquiry.read;
    await c.env.DATA.put(key, JSON.stringify({ ...inquiry, read: nextRead }), {
      metadata: { read: nextRead },
    });
  }
  return c.redirect("/inquiries");
});

app.post("/inquiries/:key/delete", async (c) => {
  const key = decodeURIComponent(c.req.param("key"));
  const raw = await c.env.DATA.get(key);
  if (raw) {
    const inquiry = JSON.parse(raw) as Omit<Inquiry, "key">;
    await moveToTrash(c.env, "inquiry", key, `${inquiry.name} <${inquiry.email}>`, raw);
  }
  return c.redirect("/inquiries");
});

app.get("/trash", async (c) => {
  const [items, unreadCount] = await Promise.all([listTrash(c.env), getUnreadCount(c.env)]);
  return c.html(trashPage({ items, unreadCount }));
});

app.post("/trash/:key/restore", async (c) => {
  const key = decodeURIComponent(c.req.param("key"));
  await restoreFromTrash(c.env, key);
  return c.redirect("/trash");
});

app.post("/trash/:key/purge", async (c) => {
  const key = decodeURIComponent(c.req.param("key"));
  await purgeTrash(c.env, key);
  return c.redirect("/trash");
});

app.post("/inquiries/:key/reply", async (c) => {
  const key = decodeURIComponent(c.req.param("key"));
  const body = await c.req.parseBody();
  const message = String(body.message ?? "").trim();

  const inquiries = await listInquiries(c.env);
  const unreadCount = inquiries.filter((i) => !i.read).length;
  const allTypes = [...new Set(inquiries.map((i) => i.inquiryType))].filter(Boolean);
  const currentFilter = { unreadOnly: false, type: "" };

  const raw = await c.env.DATA.get(key);
  if (!raw || !message) {
    return c.html(inquiriesPage({ inquiries, allTypes, unreadCount, currentFilter }));
  }

  const inquiry = { ...(JSON.parse(raw) as Inquiry), key };
  const result = await sendReplyEmail(c.env, inquiry, message);

  if (!result.ok) {
    return c.html(
      inquiriesPage({
        inquiries,
        allTypes,
        unreadCount,
        currentFilter,
        message: { type: "error", text: `返信の送信に失敗しました: ${result.error}` },
      }),
      500
    );
  }

  const updated: Inquiry = {
    ...inquiry,
    read: true,
    replies: [...(inquiry.replies ?? []), { message, sentAt: Date.now() }],
  };
  await c.env.DATA.put(key, JSON.stringify(updated), { metadata: { read: true } });

  const refreshed = await listInquiries(c.env);
  return c.html(
    inquiriesPage({
      inquiries: refreshed,
      allTypes: [...new Set(refreshed.map((i) => i.inquiryType))].filter(Boolean),
      unreadCount: refreshed.filter((i) => !i.read).length,
      currentFilter,
      message: { type: "ok", text: "返信を送信しました。" },
    })
  );
});

async function listInquiries(env: Bindings): Promise<Inquiry[]> {
  const { keys } = await env.DATA.list({ prefix: "inquiry:" });
  const values = await Promise.all(
    keys.map(async (k) => {
      const raw = await env.DATA.get(k.name);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<Omit<Inquiry, "key">>;
      return { ...parsed, replies: parsed.replies ?? [], key: k.name } as Inquiry;
    })
  );
  return values
    .filter((v): v is Inquiry => v !== null)
    .sort((a, b) => b.receivedAt - a.receivedAt);
}

async function saveContentAndRedisplay(
  c: AppContext,
  opts: {
    path: string;
    value: unknown;
    label: string;
    render: (message: { type: "ok" | "error"; text: string }) => Promise<string>;
  }
) {
  try {
    const current = await getJsonFile(c.env.CONTENT_GITHUB_TOKEN, opts.path);
    await putJsonFile(
      c.env.CONTENT_GITHUB_TOKEN,
      opts.path,
      opts.value,
      current.sha,
      `管理画面から${opts.label}を更新`
    );
    const html = await opts.render({
      type: "ok",
      text: `${opts.label}を保存しました。まもなくサイトに反映されます。`,
    });
    return c.html(html);
  } catch (err) {
    const html = await opts.render({ type: "error", text: (err as Error).message });
    return c.html(html, 500);
  }
}

export default app;
