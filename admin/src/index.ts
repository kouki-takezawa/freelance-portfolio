import { Hono, type Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createSessionCookie, timingSafeEqual, verifySessionCookie } from "./auth";
import { getJsonFile, putJsonFile } from "./github";
import {
  computeRevenue,
  createOrder,
  deleteOrder,
  getOrder,
  listOrders,
  putOrder,
} from "./orders";
import {
  blogPage,
  inquiriesPage,
  loginPage,
  orderFormPage,
  ordersListPage,
  overviewPage,
  revenuePage,
  seoPage,
  servicesPage,
  worksPage,
} from "./templates";
import {
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
  DATA: KVNamespace;
};

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
  const { keys } = await env.DATA.list({ prefix: "inquiry:" });
  return keys.filter((k) => (k.metadata as { read?: boolean } | null)?.read === false).length;
}

app.get("/login", (c) => c.html(loginPage()));

app.post("/login", async (c) => {
  const body = await c.req.parseBody();
  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");

  const okEmail = timingSafeEqual(email.toLowerCase(), c.env.ADMIN_EMAIL.toLowerCase());
  const okPassword = timingSafeEqual(password, c.env.ADMIN_PASSWORD);

  if (!okEmail || !okPassword) {
    return c.html(loginPage("メールアドレスまたはパスワードが違います"), 401);
  }

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
    const [works, services, blog, orders, unreadCount, inquiriesCount] = await Promise.all([
      getJsonFile<WorkCase[]>(c.env.CONTENT_GITHUB_TOKEN, "content/works.json"),
      getJsonFile<ServiceMenu[]>(c.env.CONTENT_GITHUB_TOKEN, "content/services.json"),
      getJsonFile<BlogPost[]>(c.env.CONTENT_GITHUB_TOKEN, "content/blog.json"),
      listOrders(c.env),
      getUnreadCount(c.env),
      c.env.DATA.list({ prefix: "inquiry:" }).then((r) => r.keys.length),
    ]);
    const revenue = computeRevenue(orders);
    return c.html(
      overviewPage({
        worksCount: works.value.length,
        servicesCount: services.value.length,
        blogCount: blog.value.length,
        unreadCount,
        inquiriesCount,
        thisMonthRevenue: revenue.thisMonthRevenue,
        unpaidTotal: revenue.unpaidTotal,
        inProgressCount: revenue.inProgressCount,
        overdueCount: revenue.overdueCount,
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
        message: { type: "error", text: (err as Error).message },
      }),
      500
    );
  }
});

app.get("/works", async (c) => {
  const [works, unreadCount] = await Promise.all([
    getJsonFile<WorkCase[]>(c.env.CONTENT_GITHUB_TOKEN, "content/works.json"),
    getUnreadCount(c.env),
  ]);
  return c.html(worksPage({ works: works.value, unreadCount }));
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
  const [services, unreadCount] = await Promise.all([
    getJsonFile<ServiceMenu[]>(c.env.CONTENT_GITHUB_TOKEN, "content/services.json"),
    getUnreadCount(c.env),
  ]);
  return c.html(servicesPage({ services: services.value, unreadCount }));
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
  const [seo, unreadCount] = await Promise.all([
    getJsonFile<SeoMap>(c.env.CONTENT_GITHUB_TOKEN, "content/seo.json"),
    getUnreadCount(c.env),
  ]);
  return c.html(seoPage({ seo: seo.value, unreadCount }));
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
  const [blog, unreadCount] = await Promise.all([
    getJsonFile<BlogPost[]>(c.env.CONTENT_GITHUB_TOKEN, "content/blog.json"),
    getUnreadCount(c.env),
  ]);
  return c.html(blogPage({ posts: blog.value, unreadCount }));
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

app.get("/orders/new", async (c) => {
  const [orders, unreadCount] = await Promise.all([
    listOrders(c.env),
    getUnreadCount(c.env),
  ]);
  const revenue = computeRevenue(orders);
  return c.html(orderFormPage({ unreadCount, overdueCount: revenue.overdueCount }));
});

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
  await deleteOrder(c.env, key);
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

app.get("/inquiries", async (c) => {
  const inquiries = await listInquiries(c.env);
  const unreadCount = inquiries.filter((i) => !i.read).length;
  return c.html(inquiriesPage({ inquiries, unreadCount }));
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
  await c.env.DATA.delete(key);
  return c.redirect("/inquiries");
});

async function listInquiries(env: Bindings): Promise<Inquiry[]> {
  const { keys } = await env.DATA.list({ prefix: "inquiry:" });
  const values = await Promise.all(
    keys.map(async (k) => {
      const raw = await env.DATA.get(k.name);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Omit<Inquiry, "key">;
      return { ...parsed, key: k.name } as Inquiry;
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
