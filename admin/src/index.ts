import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import {
  createSessionCookie,
  getAdminAccount,
  hashPassword,
  setAdminAccount,
  timingSafeEqual,
  verifyPassword,
  verifySessionCookie,
} from "./auth";
import { getJsonFile, putJsonFile } from "./github";
import { askClaude, extractJson } from "./ai";
import { getAnalyticsSummary, getTodayPageviews } from "./analytics";
import { logActivity, listActivity } from "./activity";
import { LiveRoom, broadcastLive } from "./live";
import {
  computeRevenue,
  createOrder,
  getOrder,
  listOrders,
  ordersToCsv,
  putOrder,
} from "./orders";
import { listTrash, moveToTrash, purgeTrash, restoreFromTrash } from "./trash";
import { listSnsPosts, markSnsPostPosted, deleteSnsPost, createSnsPost } from "./sns";
import {
  activityPage,
  analyticsPage,
  approvalsPage,
  clientDetailPage,
  clientsListPage,
  inquiriesPage,
  loginPage,
  orderFormPage,
  ordersListPage,
  orgChartPage,
  printReportPage,
  revenuePage,
  searchPage,
  settingsPage,
  snsPage,
  trashPage,
} from "./templates";
import {
  ORDER_SERVICE_TYPES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  SNS_PLATFORMS,
  type BlogPost,
  type Inquiry,
  type Order,
  type OrderStatus,
  type PaymentStatus,
  type ServiceMenu,
  type SidebarCounts,
  type SnsPlatform,
  type WorkCase,
} from "./types";

export { LiveRoom };

type Bindings = {
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
  CONTENT_GITHUB_TOKEN: string;
  CF_ANALYTICS_TOKEN: string;
  RESEND_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  DATA: KVNamespace;
  LIVE: DurableObjectNamespace;
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

const app = new Hono<{ Bindings: Bindings }>();

// GitHub Contents APIやCloudflare Analytics APIへの外部呼び出しは、ホーム画面の表示
// のたびに毎回発生すると応答が遅くなる(かつ失敗しうる)ため、KVに短時間キャッシュする。
// 実績・料金・お知らせは頻繁には変わらないデータなので、多少の遅延反映は許容している。
async function cached<T>(
  env: Bindings,
  key: string,
  ttlSeconds: number,
  compute: () => Promise<T>
): Promise<T> {
  const raw = await env.DATA.get(key);
  if (raw) {
    try {
      return JSON.parse(raw) as T;
    } catch {
      // 壊れたキャッシュは無視して下で再取得する
    }
  }
  const value = await compute();
  await env.DATA.put(key, JSON.stringify(value), { expirationTtl: ttlSeconds });
  return value;
}

// サイドバーの常時バッジ・承認センター・ライブ配信で共通して使う「承認待ち」件数。
// ページごとに個別集計していたロジックを一本化した。
async function loadCore(env: Bindings): Promise<{
  inquiries: Inquiry[];
  orders: Order[];
  snsPosts: Awaited<ReturnType<typeof listSnsPosts>>;
  revenue: ReturnType<typeof computeRevenue>;
  counts: SidebarCounts;
}> {
  const [inquiries, orders, snsPosts] = await Promise.all([
    listInquiries(env),
    listOrders(env),
    listSnsPosts(env),
  ]);
  const revenue = computeRevenue(orders);
  const unreadCount = inquiries.filter((i) => !i.read).length;
  const snsDraftCount = snsPosts.filter((p) => p.status === "draft").length;
  const counts: SidebarCounts = {
    unreadCount,
    overdueCount: revenue.overdueCount,
    snsDraftCount,
    unpaidCount: revenue.unpaidCount,
    pendingTotal: unreadCount + revenue.overdueCount + snsDraftCount + revenue.unpaidCount,
  };
  return { inquiries, orders, snsPosts, revenue, counts };
}

// KVのlist()は無料枠で1日あたりの上限が低いため、サイドバーのバッジ表示だけのために
// 毎ページlist()を3回叩くと上限にすぐ達してしまう(実際に発生した)。そのため件数は
// summary:countsに1件のget/putでキャッシュし、実データが必要なページ(loadCore呼び出し側)
// でのみlist()を使う。キャッシュの更新はnotifyCounts()(更新系POSTの直後)でのみ行う。
const COUNTS_CACHE_KEY = "summary:counts";

// KVのlist()が失敗しても(クォータ超過など)ページ全体を落とさず、
// 空リスト+エラーバナーで表示するためのラッパー。
async function safeList<T>(promise: Promise<T[]>): Promise<{ items: T[]; error?: string }> {
  try {
    return { items: await promise };
  } catch (err) {
    console.error("[safeList] failed", err);
    return { items: [], error: (err as Error).message };
  }
}

const ZERO_COUNTS: SidebarCounts = {
  unreadCount: 0,
  overdueCount: 0,
  snsDraftCount: 0,
  unpaidCount: 0,
  pendingTotal: 0,
};

async function getSidebarCounts(env: Bindings): Promise<SidebarCounts> {
  const cached = await env.DATA.get(COUNTS_CACHE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached) as SidebarCounts;
    } catch {
      // 壊れたキャッシュは無視して下で再計算する
    }
  }
  // バッジ件数はあくまで補助表示のため、list()のクォータ超過などで取得に失敗しても
  // ページ全体を落とさず0件表示にフォールバックする(失敗時はキャッシュに書き込まず、次回再試行させる)。
  try {
    const { counts } = await loadCore(env);
    await env.DATA.put(COUNTS_CACHE_KEY, JSON.stringify(counts));
    return counts;
  } catch (err) {
    console.error("[getSidebarCounts] fallback failed", err);
    return ZERO_COUNTS;
  }
}

// 更新系のPOST後、接続中のブラウザへ最新の承認待ち件数を即時反映しつつキャッシュも更新する。
async function notifyCounts(env: Bindings): Promise<void> {
  const { counts } = await loadCore(env);
  await env.DATA.put(COUNTS_CACHE_KEY, JSON.stringify(counts));
  await broadcastLive(env, { type: "counts", ...counts });
}

// 更新系のPOSTハンドラの末尾で繰り返し使う「操作履歴に記録しつつ件数を更新通知する」を1行にまとめる。
// レスポンスは待たせず、バックグラウンドで実行する(c.executionCtx.waitUntil)。
function afterMutation(
  c: { env: Bindings; executionCtx: { waitUntil: (promise: Promise<unknown>) => void } },
  actor: string,
  action: string,
  detail: string
): void {
  c.executionCtx.waitUntil(Promise.all([logActivity(c.env, actor, action, detail), notifyCounts(c.env)]));
}

// 承認センターなど「戻り先」を指定できるフォームから呼ばれた場合はそちらへ、
// 指定がなければ従来どおりのデフォルト遷移先へリダイレクトする。
function redirectBack(c: { req: { query: (key: string) => string | undefined }; redirect: (url: string) => Response }, fallback: string): Response {
  const back = c.req.query("return");
  return c.redirect(back && back.startsWith("/") ? back : fallback);
}

// 一覧画面の一括操作(bulk-*)エンドポイントが共通で受け取る `{ keys: string[] }` を検証して取り出す。
async function parseBulkKeys(c: { req: { json: () => Promise<unknown> } }): Promise<string[]> {
  try {
    const body = (await c.req.json()) as { keys?: unknown };
    if (!Array.isArray(body.keys)) return [];
    return body.keys.filter((k): k is string => typeof k === "string");
  } catch {
    return [];
  }
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
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
};

app.use("*", async (c, next) => {
  await next();
  // WebSocketアップグレード応答(101)はヘッダーが不変のため、セキュリティヘッダーの付与をスキップする
  if (c.res.status === 101) return;
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

  const account = await getAdminAccount(c.env);
  const okEmail = timingSafeEqual(email.toLowerCase(), account.email.toLowerCase());
  const okPassword = await verifyPassword(password, account.passwordHash);

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

  const cookieValue = await createSessionCookie(account.email, c.env.SESSION_SECRET);
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

// 認証ゲート: いったん無効化中(2026-08-29)。再度有効化する場合は下のコメントを外す。
// この間、ログイン画面(/login)は残っているが、未ログインでも全ルートにアクセスできる。
// お問い合わせ・受注・売上・コンテンツ編集が誰でも閲覧・操作可能な状態なので注意。
//
// app.use("/*", async (c, next) => {
//   const cookieValue = getCookie(c, COOKIE_NAME);
//   const email = await verifySessionCookie(cookieValue, c.env.SESSION_SECRET);
//   if (!email) {
//     return c.redirect("/login");
//   }
//   await next();
// });

app.get("/", async (c) => {
  try {
    const [works, services, blog, orders, inquiries, snsPosts, todayPageviews] =
      await Promise.all([
        cached(c.env, "ghcache:works", 600, () =>
          getJsonFile<WorkCase[]>(c.env.CONTENT_GITHUB_TOKEN, "content/works.json")
        ),
        cached(c.env, "ghcache:services", 600, () =>
          getJsonFile<ServiceMenu[]>(c.env.CONTENT_GITHUB_TOKEN, "content/services.json")
        ),
        cached(c.env, "ghcache:blog", 300, () =>
          getJsonFile<BlogPost[]>(c.env.CONTENT_GITHUB_TOKEN, "content/blog.json")
        ),
        listOrders(c.env),
        listInquiries(c.env),
        listSnsPosts(c.env),
        cached(c.env, "analytics:todayPageviews", 60, () =>
          getTodayPageviews(c.env.CF_ANALYTICS_TOKEN)
        ),
      ]);
    const revenue = computeRevenue(orders);
    const unreadCount = inquiries.filter((i) => !i.read).length;
    const snsDraftCount = snsPosts.filter((p) => p.status === "draft").length;
    return c.html(
      orgChartPage({
        worksCount: works.value.length,
        servicesCount: services.value.length,
        blogCount: blog.value.length,
        unreadCount,
        inquiriesCount: inquiries.length,
        thisMonthRevenue: revenue.thisMonthRevenue,
        unpaidTotal: revenue.unpaidTotal,
        unpaidCount: revenue.unpaidCount,
        quotingCount: revenue.quotingCount,
        inProgressCount: revenue.inProgressCount,
        deliveredCount: revenue.deliveredCount,
        overdueCount: revenue.overdueCount,
        snsDraftCount,
        snsPostedCount: snsPosts.filter((p) => p.status === "posted").length,
        todayPageviews,
        pendingTotal: unreadCount + revenue.overdueCount + snsDraftCount + revenue.unpaidCount,
      })
    );
  } catch (err) {
    return c.html(
      orgChartPage({
        worksCount: 0,
        servicesCount: 0,
        blogCount: 0,
        unreadCount: 0,
        inquiriesCount: 0,
        thisMonthRevenue: 0,
        unpaidTotal: 0,
        unpaidCount: 0,
        quotingCount: 0,
        inProgressCount: 0,
        deliveredCount: 0,
        overdueCount: 0,
        snsDraftCount: 0,
        snsPostedCount: 0,
        todayPageviews: 0,
        pendingTotal: 0,
        message: { type: "error", text: (err as Error).message },
      }),
      500
    );
  }
});

app.get("/org", (c) => c.redirect("/"));

app.get("/sns", async (c) => {
  const [{ items: snsPosts, error }, counts] = await Promise.all([
    safeList(listSnsPosts(c.env)),
    getSidebarCounts(c.env),
  ]);
  return c.html(
    snsPage({
      posts: snsPosts,
      ...counts,
      message: error ? { type: "error", text: `データの取得に失敗しました: ${error}` } : undefined,
    })
  );
});

app.post("/sns/:key/posted", async (c) => {
  const key = decodeURIComponent(c.req.param("key"));
  await markSnsPostPosted(c.env, key);
  afterMutation(c, "SNS運用AI", "SNS投稿を承認", `${key} を投稿済みにしました`);
  return redirectBack(c, "/sns");
});

app.post("/sns/:key/delete", async (c) => {
  const key = decodeURIComponent(c.req.param("key"));
  await deleteSnsPost(c.env, key);
  afterMutation(c, "社長", "SNS投稿案を削除", key);
  return redirectBack(c, "/sns");
});

app.post("/sns/bulk-posted", async (c) => {
  const keys = await parseBulkKeys(c);
  for (const key of keys) {
    await markSnsPostPosted(c.env, key);
  }
  if (keys.length > 0) afterMutation(c, "SNS運用AI", "SNS投稿を一括承認", `${keys.length}件`);
  return c.json({ ok: true, count: keys.length });
});

app.post("/sns/bulk-delete", async (c) => {
  const keys = await parseBulkKeys(c);
  for (const key of keys) {
    await deleteSnsPost(c.env, key);
  }
  if (keys.length > 0) afterMutation(c, "社長", "SNS投稿案を一括削除", `${keys.length}件`);
  return c.json({ ok: true, count: keys.length });
});

app.get("/orders", async (c) => {
  const [{ items: orders, error }, counts] = await Promise.all([
    safeList(listOrders(c.env)),
    getSidebarCounts(c.env),
  ]);
  const q = (c.req.query("q") ?? "").trim();
  const sort = c.req.query("sort") ?? "dueDate";
  const dir = c.req.query("dir") === "desc" ? "desc" : "asc";

  const filtered = q
    ? orders.filter((o) =>
        [o.clientName, o.notes, o.serviceType].some((v) =>
          v.toLowerCase().includes(q.toLowerCase())
        )
      )
    : orders;

  const selectedKey = c.req.query("selected");
  const selectedOrder = selectedKey ? orders.find((o) => o.key === selectedKey) : undefined;

  return c.html(
    ordersListPage({
      orders: filtered,
      ...counts,
      currentFilter: { q, sort, dir },
      selectedOrder,
      message: error ? { type: "error", text: `データの取得に失敗しました: ${error}` } : undefined,
    })
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
  const counts = await getSidebarCounts(c.env);

  const fromInquiry = c.req.query("fromInquiry");
  const prefill = fromInquiry ? await buildOrderPrefillFromInquiry(c.env, fromInquiry) : undefined;

  return c.html(orderFormPage({ prefill, ...counts }));
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
  afterMutation(c, "営業AI", "受注を追加", `${order.clientName}(${order.serviceType})`);
  return c.redirect("/orders");
});

app.get("/orders/:key/edit", async (c) => {
  const key = decodeURIComponent(c.req.param("key"));
  const [order, counts] = await Promise.all([getOrder(c.env, key), getSidebarCounts(c.env)]);
  if (!order) return c.redirect("/orders");
  return c.html(orderFormPage({ order, ...counts }));
});

// "/orders/:key" は1セグメントの汎用パターンなので、"/orders/bulk-delete" と衝突しないよう
// 先に一括操作の固定パスを登録しておく(Honoはルート登録順に最初のマッチを採用するため)。
app.post("/orders/bulk-delete", async (c) => {
  const keys = await parseBulkKeys(c);
  let count = 0;
  for (const key of keys) {
    const raw = await c.env.DATA.get(key);
    if (!raw) continue;
    const order = JSON.parse(raw) as Omit<Order, "key">;
    await moveToTrash(c.env, "order", key, `${order.clientName}(${order.serviceType})`, raw);
    count++;
  }
  if (count > 0) afterMutation(c, "社長", "受注を一括削除", `${count}件`);
  return c.json({ ok: true, count });
});

app.post("/orders/:key", async (c) => {
  const key = decodeURIComponent(c.req.param("key"));
  const existing = await getOrder(c.env, key);
  if (!existing) return c.redirect("/orders");
  const body = await c.req.parseBody();
  const updates = parseOrderForm(body);
  await putOrder(c.env, { ...existing, ...updates, key });
  afterMutation(c, "経理AI", "受注を更新", `${updates.clientName}(${updates.status}・${updates.paymentStatus})`);
  return c.redirect("/orders");
});

app.post("/orders/:key/delete", async (c) => {
  const key = decodeURIComponent(c.req.param("key"));
  const raw = await c.env.DATA.get(key);
  if (raw) {
    const order = JSON.parse(raw) as Omit<Order, "key">;
    await moveToTrash(c.env, "order", key, `${order.clientName}(${order.serviceType})`, raw);
    afterMutation(c, "社長", "受注を削除", `${order.clientName}(${order.serviceType})`);
  }
  return c.redirect("/orders");
});

function parseOrderForm(
  body: Record<string, string | File>
): Omit<Order, "key" | "id" | "createdAt"> {
  const amountRaw = String(body.amount ?? "").replace(/[^0-9]/g, "");
  const paymentStatus = (PAYMENT_STATUSES as readonly string[]).includes(String(body.paymentStatus))
    ? (String(body.paymentStatus) as PaymentStatus)
    : "未入金";
  const paidDateInput = String(body.paidDate ?? "").trim();
  // 入金済みにしたのに入金日を空欄のまま保存すると売上集計から漏れるため、今日の日付を補う
  const paidDate =
    paymentStatus === "入金済み" && !paidDateInput
      ? new Date().toISOString().slice(0, 10)
      : paidDateInput;

  return {
    clientName: String(body.clientName ?? "").trim(),
    serviceType: String(body.serviceType ?? "").trim(),
    amount: amountRaw ? Number(amountRaw) : 0,
    orderDate: String(body.orderDate ?? "").trim(),
    dueDate: String(body.dueDate ?? "").trim(),
    status: (ORDER_STATUSES as readonly string[]).includes(String(body.status))
      ? (String(body.status) as OrderStatus)
      : "見積もり中",
    paymentStatus,
    paidDate,
    notes: String(body.notes ?? "").trim(),
  };
}

app.get("/revenue", async (c) => {
  const [{ items: orders, error }, cachedCounts] = await Promise.all([
    safeList(listOrders(c.env)),
    getSidebarCounts(c.env),
  ]);
  const revenue = computeRevenue(orders);
  // overdue/unpaidはこのページで取得済みのordersからそのまま正確に出せるため、キャッシュより優先する
  const counts: SidebarCounts = {
    ...cachedCounts,
    overdueCount: revenue.overdueCount,
    unpaidCount: revenue.unpaidCount,
    pendingTotal: cachedCounts.unreadCount + revenue.overdueCount + cachedCounts.snsDraftCount + revenue.unpaidCount,
  };
  return c.html(
    revenuePage({
      ...counts,
      thisMonthRevenue: revenue.thisMonthRevenue,
      yearToDateRevenue: revenue.yearToDateRevenue,
      unpaidTotal: revenue.unpaidTotal,
      pipelineTotal: revenue.pipelineTotal,
      monthly: revenue.monthly,
      message: error ? { type: "error", text: `データの取得に失敗しました: ${error}` } : undefined,
    })
  );
});

app.get("/analytics", async (c) => {
  const [summary, counts] = await Promise.all([
    getAnalyticsSummary(c.env.CF_ANALYTICS_TOKEN),
    getSidebarCounts(c.env),
  ]);
  return c.html(analyticsPage({ summary, ...counts }));
});

app.get("/inquiries", async (c) => {
  const [{ items: inquiries, error }, cachedCounts] = await Promise.all([
    safeList(listInquiries(c.env)),
    getSidebarCounts(c.env),
  ]);
  // unreadCountはこのページで取得済みのinquiriesからそのまま正確に出せるため、キャッシュより優先する
  const unreadCount = inquiries.filter((i) => !i.read).length;
  const counts: SidebarCounts = {
    ...cachedCounts,
    unreadCount,
    pendingTotal:
      unreadCount + cachedCounts.overdueCount + cachedCounts.snsDraftCount + cachedCounts.unpaidCount,
  };

  const unreadOnly = c.req.query("unread") === "1";
  const type = c.req.query("type") ?? "";
  const q = (c.req.query("q") ?? "").trim();
  const filtered = inquiries.filter((i) => {
    if (unreadOnly && i.read) return false;
    if (type && i.inquiryType !== type) return false;
    if (
      q &&
      ![i.name, i.email, i.message].some((v) => v.toLowerCase().includes(q.toLowerCase()))
    )
      return false;
    return true;
  });
  const allTypes = [...new Set(inquiries.map((i) => i.inquiryType))].filter(Boolean);

  return c.html(
    inquiriesPage({
      inquiries: filtered,
      allTypes,
      ...counts,
      currentFilter: { unreadOnly, type, q },
      message: error ? { type: "error", text: `データの取得に失敗しました: ${error}` } : undefined,
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
    afterMutation(
      c,
      "営業AI",
      nextRead ? "お問い合わせを既読にした" : "お問い合わせを未読に戻した",
      inquiry.name
    );
  }
  return redirectBack(c, "/inquiries");
});

app.post("/inquiries/:key/delete", async (c) => {
  const key = decodeURIComponent(c.req.param("key"));
  const raw = await c.env.DATA.get(key);
  if (raw) {
    const inquiry = JSON.parse(raw) as Omit<Inquiry, "key">;
    await moveToTrash(c.env, "inquiry", key, `${inquiry.name} <${inquiry.email}>`, raw);
    afterMutation(c, "社長", "お問い合わせを削除", inquiry.name);
  }
  return c.redirect("/inquiries");
});

app.post("/inquiries/bulk-read", async (c) => {
  const keys = await parseBulkKeys(c);
  let count = 0;
  for (const key of keys) {
    const raw = await c.env.DATA.get(key);
    if (!raw) continue;
    const inquiry = JSON.parse(raw) as Inquiry;
    await c.env.DATA.put(key, JSON.stringify({ ...inquiry, read: true }), { metadata: { read: true } });
    count++;
  }
  if (count > 0) afterMutation(c, "営業AI", "お問い合わせを一括既読", `${count}件`);
  return c.json({ ok: true, count });
});

app.post("/inquiries/bulk-delete", async (c) => {
  const keys = await parseBulkKeys(c);
  let count = 0;
  for (const key of keys) {
    const raw = await c.env.DATA.get(key);
    if (!raw) continue;
    const inquiry = JSON.parse(raw) as Omit<Inquiry, "key">;
    await moveToTrash(c.env, "inquiry", key, `${inquiry.name} <${inquiry.email}>`, raw);
    count++;
  }
  if (count > 0) afterMutation(c, "社長", "お問い合わせを一括削除", `${count}件`);
  return c.json({ ok: true, count });
});

app.get("/trash", async (c) => {
  const [{ items, error }, counts] = await Promise.all([
    safeList(listTrash(c.env)),
    getSidebarCounts(c.env),
  ]);
  return c.html(
    trashPage({
      items,
      ...counts,
      message: error ? { type: "error", text: `データの取得に失敗しました: ${error}` } : undefined,
    })
  );
});

app.post("/trash/:key/restore", async (c) => {
  const key = decodeURIComponent(c.req.param("key"));
  await restoreFromTrash(c.env, key);
  afterMutation(c, "社長", "ゴミ箱から復元", key);
  return c.redirect("/trash");
});

app.post("/trash/:key/purge", async (c) => {
  const key = decodeURIComponent(c.req.param("key"));
  await purgeTrash(c.env, key);
  c.executionCtx.waitUntil(logActivity(c.env, "社長", "完全に削除", key));
  return c.redirect("/trash");
});

app.post("/inquiries/:key/reply", async (c) => {
  const key = decodeURIComponent(c.req.param("key"));
  const body = await c.req.parseBody();
  const message = String(body.message ?? "").trim();

  const [inquiries, cachedCounts] = await Promise.all([
    listInquiries(c.env),
    getSidebarCounts(c.env),
  ]);
  const countsFor = (list: Inquiry[]): SidebarCounts => {
    const unreadCount = list.filter((i) => !i.read).length;
    return {
      ...cachedCounts,
      unreadCount,
      pendingTotal:
        unreadCount + cachedCounts.overdueCount + cachedCounts.snsDraftCount + cachedCounts.unpaidCount,
    };
  };
  const allTypes = [...new Set(inquiries.map((i) => i.inquiryType))].filter(Boolean);
  const currentFilter = { unreadOnly: false, type: "", q: "" };

  const raw = await c.env.DATA.get(key);
  if (!raw || !message) {
    return c.html(inquiriesPage({ inquiries, allTypes, ...countsFor(inquiries), currentFilter }));
  }

  const inquiry = { ...(JSON.parse(raw) as Inquiry), key };
  const result = await sendReplyEmail(c.env, inquiry, message);

  if (!result.ok) {
    return c.html(
      inquiriesPage({
        inquiries,
        allTypes,
        ...countsFor(inquiries),
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
  afterMutation(c, "営業AI", "返信を送信", `${inquiry.name} 様へ返信`);

  // 変更点はこの1件の既読化のみとわかっているため、再度list()する代わりにメモリ上で反映する
  const refreshed = inquiries.map((i) => (i.key === key ? updated : i));
  return c.html(
    inquiriesPage({
      inquiries: refreshed,
      allTypes: [...new Set(refreshed.map((i) => i.inquiryType))].filter(Boolean),
      ...countsFor(refreshed),
      currentFilter,
      message: { type: "ok", text: "返信を送信しました。" },
    })
  );
});

// --- マーケティング/SEO部・SNS部の自律更新(要 ANTHROPIC_API_KEY) ---

type AutomationResult = {
  blogPost?: { title: string; category: string; excerpt: string; body: string };
  snsPost?: { platform: SnsPlatform; caption: string; body: string };
};

function slugifyForBlog(text: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9぀-ヿ゠-ヿ一-龯]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return (base || "post") + "-" + Date.now().toString(36);
}

async function runContentAutomation(env: Bindings): Promise<{ ok: boolean; message: string }> {
  if (!env.ANTHROPIC_API_KEY) {
    return { ok: false, message: "ANTHROPIC_API_KEYが未設定のためスキップしました" };
  }

  const [services, blog, snsPosts] = await Promise.all([
    getJsonFile<ServiceMenu[]>(env.CONTENT_GITHUB_TOKEN, "content/services.json"),
    getJsonFile<BlogPost[]>(env.CONTENT_GITHUB_TOKEN, "content/blog.json"),
    listSnsPosts(env),
  ]);

  const recentTitles = blog.value.slice(0, 8).map((p) => p.title);
  const recentSns = snsPosts.slice(0, 8).map((p) => `[${p.platform}] ${p.caption}`);
  const servicesSummary = services.value.map((s) => `${s.name}(${s.priceFrom})`).join("、");

  const systemPrompt = [
    "あなたは「ヨリソイワークス」という個人事業主向けHP/LP/システム開発サービスの、",
    "マーケティング/SEO部とSNS部を兼任するAI社員です。",
    "会社の実際のサービス: " + servicesSummary,
    "拠点は栃木県、個人事業主・小さな会社向けにリモート対応しています。",
    "誠実で誇張しない、地に足のついたトーンで書いてください。実績や数字を捏造しないこと。",
    "必ず以下のJSON形式のみを出力してください(前後に説明文をつけないこと):",
    '{"blogPost":{"title":"...","category":"...","excerpt":"...","body":"..."},"snsPost":{"platform":"note|Threads|Instagram","caption":"...","body":"..."}}',
  ].join("\n");

  const userPrompt = [
    "以下は直近のブログ記事タイトルです。内容が重複しない新しい記事を1本考えてください:",
    recentTitles.length ? recentTitles.map((t) => "- " + t).join("\n") : "(まだ記事はありません)",
    "",
    "以下は直近のSNS投稿です。内容が重複しない新しい投稿を1本考えてください(プラットフォームは note/Threads/Instagram から選択):",
    recentSns.length ? recentSns.join("\n") : "(まだ投稿はありません)",
  ].join("\n");

  const responseText = await askClaude(env.ANTHROPIC_API_KEY, systemPrompt, userPrompt);
  const result = extractJson<AutomationResult>(responseText);
  const logs: string[] = [];

  if (result.blogPost) {
    const current = await getJsonFile<BlogPost[]>(env.CONTENT_GITHUB_TOKEN, "content/blog.json");
    const newPost: BlogPost = {
      slug: slugifyForBlog(result.blogPost.title),
      title: result.blogPost.title,
      category: result.blogPost.category || "お知らせ",
      excerpt: result.blogPost.excerpt,
      publishedAt: new Date().toISOString().slice(0, 10),
      body: result.blogPost.body,
    };
    await putJsonFile(
      env.CONTENT_GITHUB_TOKEN,
      "content/blog.json",
      [newPost, ...current.value],
      current.sha,
      "マーケティング/SEO部AIが新しいお知らせを自動作成"
    );
    // ホーム画面のキャッシュ(ghcache:blog)が古いまま残らないよう、更新後に破棄しておく
    await env.DATA.delete("ghcache:blog");
    logs.push(`ブログ:「${newPost.title}」を追加`);
  }

  if (result.snsPost && (SNS_PLATFORMS as readonly string[]).includes(result.snsPost.platform)) {
    await createSnsPost(env, result.snsPost);
    logs.push(`SNS下書き: [${result.snsPost.platform}] ${result.snsPost.caption}`);
  }

  const message = logs.join(" / ") || "生成結果が空でした";
  await Promise.all([
    logActivity(env, "マーケターAI", "content/SNS自律更新を実行", message),
    notifyCounts(env),
  ]);
  return { ok: true, message };
}

app.post("/automation/run-content", async (c) => {
  try {
    const result = await runContentAutomation(c.env);
    return c.json(result, result.ok ? 200 : 503);
  } catch (err) {
    return c.json({ ok: false, message: (err as Error).message }, 500);
  }
});

// --- 承認センター: 各部門の承認待ちを1画面に集約する ---

app.get("/approvals", async (c) => {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const { inquiries, orders, snsPosts, counts } = await loadCore(c.env);
    return c.html(
      approvalsPage({
        ...counts,
        unreadInquiries: inquiries.filter((i) => !i.read),
        overdueOrders: orders.filter(
          (o) => o.status !== "納品済み" && o.status !== "キャンセル" && o.dueDate && o.dueDate < today
        ),
        snsDrafts: snsPosts.filter((p) => p.status === "draft"),
        unpaidOrders: orders.filter((o) => o.paymentStatus === "未入金" && o.status !== "キャンセル"),
      })
    );
  } catch (err) {
    return c.html(
      approvalsPage({
        ...ZERO_COUNTS,
        unreadInquiries: [],
        overdueOrders: [],
        snsDrafts: [],
        unpaidOrders: [],
        message: { type: "error", text: `データの取得に失敗しました: ${(err as Error).message}` },
      }),
      500
    );
  }
});

// --- アクティビティ: 誰が(AIが)いつ何をしたかの履歴 ---

app.get("/activity", async (c) => {
  const [{ items: entries, error }, counts] = await Promise.all([
    safeList(listActivity(c.env, 200)),
    getSidebarCounts(c.env),
  ]);
  return c.html(
    activityPage({
      entries,
      ...counts,
      message: error ? { type: "error", text: `データの取得に失敗しました: ${error}` } : undefined,
    })
  );
});

// --- AIチャットパネル(既存のClaude連携を使い、実データを踏まえて質問に答える) ---

app.post("/assistant/chat", async (c) => {
  if (!c.env.ANTHROPIC_API_KEY) {
    return c.json({ ok: false, message: "ANTHROPIC_API_KEYが未設定のため利用できません。" }, 503);
  }

  const body = await c.req.json<{ message?: string; history?: { role: string; text: string }[] }>();
  const userMessage = String(body.message ?? "").trim();
  if (!userMessage) return c.json({ ok: false, message: "メッセージが空です。" }, 400);

  try {
    const { counts, revenue, snsPosts } = await loadCore(c.env);
    const systemPrompt = [
      "あなたは「ヨリソイワークス」のAI事業部で、経営管理部の「PM AI」として社長からの質問に答えます。",
      "以下は現在の実データのスナップショットです。数字はこれ以外を捏造しないこと:",
      `未読のお問い合わせ: ${counts.unreadCount}件`,
      `納期超過の受注: ${counts.overdueCount}件`,
      `SNS投稿の下書き(承認待ち): ${counts.snsDraftCount}件`,
      `未入金の受注: ${counts.unpaidCount}件・合計 ${revenue.unpaidTotal.toLocaleString("ja-JP")}円`,
      `今月の確定売上: ${revenue.thisMonthRevenue.toLocaleString("ja-JP")}円`,
      `今年の累計売上: ${revenue.yearToDateRevenue.toLocaleString("ja-JP")}円`,
      `進行中・見積もり中の見込み額: ${revenue.pipelineTotal.toLocaleString("ja-JP")}円`,
      `SNS投稿済み総数: ${snsPosts.filter((p) => p.status === "posted").length}件`,
      "簡潔に、日本語の丁寧語で答えてください。詳細を確認できるページがあれば、パスを案内してください(/inquiries /orders /revenue /sns /approvals /activity)。",
    ].join("\n");

    const history = (body.history ?? []).slice(-10);
    const conversation = [
      ...history.map((h) => `${h.role === "user" ? "社長" : "PM AI"}: ${h.text}`),
      `社長: ${userMessage}`,
    ].join("\n\n");

    const reply = await askClaude(c.env.ANTHROPIC_API_KEY, systemPrompt, conversation);
    return c.json({ ok: true, reply });
  } catch (err) {
    return c.json({ ok: false, message: (err as Error).message }, 500);
  }
});

// --- リアルタイム反映用WebSocket(Durable Object 1部屋を全ページで共有) ---

app.get("/live/ws", async (c) => {
  const id = c.env.LIVE.idFromName("global");
  const stub = c.env.LIVE.get(id);
  return stub.fetch(c.req.raw);
});

// --- PWA(ホーム画面への追加) ---

// アイコン・マニフェスト・SWはほぼ変化しないため、ブラウザキャッシュを効かせてページ遷移のたびの再取得を防ぐ
const STATIC_ASSET_CACHE = "public, max-age=86400";

app.get("/manifest.webmanifest", (c) => {
  return c.json(
    {
      name: "ヨリソイワークス AI事業部",
      short_name: "AI事業部",
      description: "AIが各事業部を担当する、ヨリソイワークスの経営管理ダッシュボード",
      start_url: "/",
      display: "standalone",
      background_color: "#0a0e17",
      theme_color: "#0a0e17",
      icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }],
    },
    200,
    { "Content-Type": "application/manifest+json", "Cache-Control": STATIC_ASSET_CACHE }
  );
});

app.get("/icon.svg", (c) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2dd4ee"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs><rect width="100" height="100" rx="20" fill="#0a0e17"/><circle cx="50" cy="50" r="30" fill="url(#g)"/></svg>`;
  return c.body(svg, 200, { "Content-Type": "image/svg+xml", "Cache-Control": STATIC_ASSET_CACHE });
});

app.get("/sw.js", (c) => {
  // データはすべて機微情報のため積極的なキャッシュは行わず、PWAとしてインストール可能にするだけの最小構成
  const sw = `self.addEventListener("fetch", function () {});`;
  return c.body(sw, 200, { "Content-Type": "application/javascript", "Cache-Control": STATIC_ASSET_CACHE });
});

// --- 設定: ログインID・パスワードの確認・変更 ---
// 認証ゲートは現在無効化されているため(§6参照)、ここだけは「現在のパスワード」の
// 入力を必須にして、URLを知っているだけの第三者が変更できないようにしている。

app.get("/settings", async (c) => {
  const [account, counts] = await Promise.all([getAdminAccount(c.env), getSidebarCounts(c.env)]);
  return c.html(settingsPage({ email: account.email, ...counts }));
});

app.post("/settings/account", async (c) => {
  const body = await c.req.parseBody();
  const newEmail = String(body.email ?? "").trim();
  const currentPassword = String(body.currentPassword ?? "");

  const [account, counts] = await Promise.all([getAdminAccount(c.env), getSidebarCounts(c.env)]);

  if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    return c.html(
      settingsPage({
        email: account.email,
        ...counts,
        message: { type: "error", text: "正しいメールアドレスを入力してください。" },
      })
    );
  }
  if (!(await verifyPassword(currentPassword, account.passwordHash))) {
    return c.html(
      settingsPage({
        email: account.email,
        ...counts,
        message: { type: "error", text: "現在のパスワードが違います。" },
      }),
      401
    );
  }

  await setAdminAccount(c.env, { ...account, email: newEmail });
  c.executionCtx.waitUntil(logActivity(c.env, "社長", "ログインIDを変更", newEmail));
  return c.html(
    settingsPage({
      email: newEmail,
      ...counts,
      message: { type: "ok", text: "ログインIDを更新しました。" },
    })
  );
});

app.post("/settings/password", async (c) => {
  const body = await c.req.parseBody();
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");
  const confirmPassword = String(body.confirmPassword ?? "");

  const [account, counts] = await Promise.all([getAdminAccount(c.env), getSidebarCounts(c.env)]);

  if (!(await verifyPassword(currentPassword, account.passwordHash))) {
    return c.html(
      settingsPage({
        email: account.email,
        ...counts,
        message: { type: "error", text: "現在のパスワードが違います。" },
      }),
      401
    );
  }
  if (newPassword.length < 8) {
    return c.html(
      settingsPage({
        email: account.email,
        ...counts,
        message: { type: "error", text: "新しいパスワードは8文字以上にしてください。" },
      })
    );
  }
  if (newPassword !== confirmPassword) {
    return c.html(
      settingsPage({
        email: account.email,
        ...counts,
        message: { type: "error", text: "新しいパスワード(確認)が一致しません。" },
      })
    );
  }

  await setAdminAccount(c.env, { ...account, passwordHash: await hashPassword(newPassword) });
  c.executionCtx.waitUntil(logActivity(c.env, "社長", "パスワードを変更", "-"));
  return c.html(
    settingsPage({
      email: account.email,
      ...counts,
      message: { type: "ok", text: "パスワードを変更しました。次回ログインから新しいパスワードが必要です。" },
    })
  );
});

// --- クライアント一覧・詳細(受注のclientNameとお問い合わせのnameが一致するものを同一視) ---

app.get("/clients", async (c) => {
  try {
    const { orders, inquiries, counts } = await loadCore(c.env);
    const map = new Map<
      string,
      { name: string; orderCount: number; inquiryCount: number; lastActivity: number }
    >();
    for (const o of orders) {
      if (!o.clientName) continue;
      const entry = map.get(o.clientName) ?? { name: o.clientName, orderCount: 0, inquiryCount: 0, lastActivity: 0 };
      entry.orderCount += 1;
      entry.lastActivity = Math.max(entry.lastActivity, o.createdAt);
      map.set(o.clientName, entry);
    }
    for (const i of inquiries) {
      if (!i.name) continue;
      const entry = map.get(i.name) ?? { name: i.name, orderCount: 0, inquiryCount: 0, lastActivity: 0 };
      entry.inquiryCount += 1;
      entry.lastActivity = Math.max(entry.lastActivity, i.receivedAt);
      map.set(i.name, entry);
    }
    return c.html(clientsListPage({ ...counts, clients: [...map.values()] }));
  } catch (err) {
    return c.html(
      clientsListPage({
        ...ZERO_COUNTS,
        clients: [],
        message: { type: "error", text: `データの取得に失敗しました: ${(err as Error).message}` },
      }),
      500
    );
  }
});

app.get("/clients/:name", async (c) => {
  const name = decodeURIComponent(c.req.param("name"));
  try {
    const { orders, inquiries, counts } = await loadCore(c.env);
    return c.html(
      clientDetailPage({
        ...counts,
        name,
        orders: orders.filter((o) => o.clientName === name),
        inquiries: inquiries.filter((i) => i.name === name),
      })
    );
  } catch (err) {
    return c.html(
      clientDetailPage({
        ...ZERO_COUNTS,
        name,
        orders: [],
        inquiries: [],
        message: { type: "error", text: `データの取得に失敗しました: ${(err as Error).message}` },
      }),
      500
    );
  }
});

// --- 全データ横断検索 ---

app.get("/search", async (c) => {
  const q = (c.req.query("q") ?? "").trim();
  const counts = await getSidebarCounts(c.env);
  if (!q) {
    return c.html(searchPage({ ...counts, q, results: { orders: [], inquiries: [], snsPosts: [], activity: [] } }));
  }

  const qLower = q.toLowerCase();
  const has = (values: string[]) => values.some((v) => v.toLowerCase().includes(qLower));
  const [{ items: orders }, { items: inquiries }, { items: snsPosts }, { items: activity }] = await Promise.all([
    safeList(listOrders(c.env)),
    safeList(listInquiries(c.env)),
    safeList(listSnsPosts(c.env)),
    safeList(listActivity(c.env, 200)),
  ]);

  return c.html(
    searchPage({
      ...counts,
      q,
      results: {
        orders: orders.filter((o) => has([o.clientName, o.notes, o.serviceType])).slice(0, 20),
        inquiries: inquiries.filter((i) => has([i.name, i.email, i.message])).slice(0, 20),
        snsPosts: snsPosts.filter((p) => has([p.caption, p.body])).slice(0, 20),
        activity: activity.filter((e) => has([e.actor, e.action, e.detail])).slice(0, 20),
      },
    })
  );
});

// --- 月次経営レポート(印刷/PDF向け) ---

app.get("/reports/monthly", async (c) => {
  const month = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long" });
  try {
    const { snsPosts, revenue, counts } = await loadCore(c.env);
    return c.html(
      printReportPage({
        ...counts,
        month,
        thisMonthRevenue: revenue.thisMonthRevenue,
        yearToDateRevenue: revenue.yearToDateRevenue,
        unpaidTotal: revenue.unpaidTotal,
        pipelineTotal: revenue.pipelineTotal,
        unreadInquiriesCount: counts.unreadCount,
        overdueOrdersCount: counts.overdueCount,
        snsDraftCount: counts.snsDraftCount,
        snsPostedCount: snsPosts.filter((p) => p.status === "posted").length,
        monthly: revenue.monthly,
      })
    );
  } catch (err) {
    return c.html(
      printReportPage({
        ...ZERO_COUNTS,
        month,
        thisMonthRevenue: 0,
        yearToDateRevenue: 0,
        unpaidTotal: 0,
        pipelineTotal: 0,
        unreadInquiriesCount: 0,
        overdueOrdersCount: 0,
        snsDraftCount: 0,
        snsPostedCount: 0,
        monthly: [],
        message: { type: "error", text: `データの取得に失敗しました: ${(err as Error).message}` },
      }),
      500
    );
  }
});

// --- 通知センター(ベル)向けの直近アクティビティ ---

app.get("/notifications", async (c) => {
  const { items } = await safeList(listActivity(c.env, 20));
  return c.json({ entries: items });
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

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    ctx.waitUntil(
      runContentAutomation(env)
        .then((r) => console.log("[content-automation]", r.message))
        .catch((err) => console.error("[content-automation] failed", err))
    );
  },
};
