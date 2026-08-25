import {
  ORDER_SERVICE_TYPES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  SEO_PAGES,
  SPARE_BLOG_ROWS,
  SPARE_SERVICES_ROWS,
  SPARE_WORKS_ROWS,
  type BlogPost,
  type Inquiry,
  type Order,
  type ServiceMenu,
  type SeoMap,
  type WorkCase,
} from "./types";
import type { AnalyticsSummary } from "./analytics";

export function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const PUBLIC_SITE_URL = "https://freelance-hp.yorisoi-works.workers.dev";

const baseStyle = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Hiragino Kaku Gothic ProN", "Yu Gothic", system-ui, sans-serif;
    background: #f8f9fb;
    color: #171923;
  }
  .app { display: flex; min-height: 100vh; }
  aside {
    position: fixed;
    top: 0;
    left: 0;
    width: 220px;
    height: 100vh;
    overflow-y: auto;
    flex-shrink: 0;
    background: #1e3a5f;
    color: #fff;
    display: flex;
    flex-direction: column;
    padding: 20px 0;
  }
  aside .brand { padding: 0 20px 20px; font-weight: 700; font-size: 15px; border-bottom: 1px solid rgba(255,255,255,0.15); }
  aside nav { flex: 1; padding-top: 8px; }
  aside .nav-section-label {
    padding: 14px 20px 4px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: rgba(255,255,255,0.45);
    text-transform: uppercase;
  }
  aside nav a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 20px;
    color: rgba(255,255,255,0.85);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
  }
  aside nav a.active { background: rgba(255,255,255,0.14); color: #fff; font-weight: 700; }
  aside nav a:hover { background: rgba(255,255,255,0.08); }
  aside .badge {
    background: #e05252;
    color: #fff;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    padding: 1px 7px;
  }
  aside .footer { padding: 12px 20px 0; border-top: 1px solid rgba(255,255,255,0.15); margin-top: 12px; }
  aside .footer a { display: block; color: rgba(255,255,255,0.75); font-size: 13px; text-decoration: none; padding: 6px 0; }
  aside form button {
    width: 100%;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.4);
    color: #fff;
    border-radius: 8px;
    padding: 8px;
    cursor: pointer;
    font-size: 13px;
    margin-top: 8px;
  }
  main.content { flex: 1; margin-left: 220px; padding: 32px 40px 80px; max-width: 900px; }
  h1 { font-size: 22px; margin-top: 0; }
  h2 { font-size: 16px; color: #5b6472; margin-top: 0; }
  fieldset {
    border: 1px solid #e4e7ec;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    background: #fff;
  }
  legend { font-size: 12px; color: #5b6472; padding: 0 6px; }
  label { display: block; font-size: 13px; font-weight: 600; margin-top: 10px; margin-bottom: 4px; }
  input[type="text"], textarea, select {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #e4e7ec;
    border-radius: 8px;
    font-size: 16px;
    font-family: inherit;
    background: #fff;
  }
  textarea { min-height: 70px; resize: vertical; }
  .field-row { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
  .checkbox-row { display: flex; align-items: center; gap: 6px; margin-top: 10px; font-size: 13px; }
  .checkbox-row input { width: auto; }
  .save-bar { margin-top: 20px; }
  button.primary {
    background: #1e3a5f;
    color: #fff;
    border: none;
    border-radius: 999px;
    padding: 10px 28px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
  }
  button.small {
    background: #fff;
    color: #1e3a5f;
    border: 1px solid #1e3a5f;
    border-radius: 999px;
    padding: 5px 14px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }
  .hint { color: #5b6472; font-size: 13px; margin-top: 4px; }
  .banner {
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 14px;
  }
  .banner.ok { background: #e6f4ea; color: #1e7a34; }
  .banner.error { background: #fdecea; color: #b3261e; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-top: 24px; }
  .card {
    background: #fff;
    border: 1px solid #e4e7ec;
    border-radius: 12px;
    padding: 20px;
  }
  .card .num { font-size: 28px; font-weight: 700; color: #1e3a5f; }
  .card .label { font-size: 13px; color: #5b6472; margin-top: 4px; }
  .card a { font-size: 13px; color: #1e3a5f; }
  .inquiry-card { background: #fff; border: 1px solid #e4e7ec; border-radius: 12px; padding: 18px; margin-bottom: 14px; }
  .inquiry-card.unread { border-left: 4px solid #e05252; }
  .inquiry-meta { display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px; color: #5b6472; margin-bottom: 8px; }
  .inquiry-message { white-space: pre-wrap; font-size: 14px; margin: 10px 0; }
  .inquiry-actions { display: flex; gap: 8px; }
  .table-wrap { overflow-x: auto; border: 1px solid #e4e7ec; border-radius: 12px; background: #fff; }
  table.data { width: 100%; border-collapse: collapse; font-size: 13px; white-space: nowrap; }
  table.data th, table.data td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #e4e7ec; }
  table.data th { background: #f8f9fb; color: #5b6472; font-weight: 600; font-size: 12px; }
  table.data tbody tr:last-child td { border-bottom: none; }
  table.data tbody tr:hover { background: #f8f9fb; }
  table.data td.actions { display: flex; gap: 6px; }
  table.data td.actions form { display: inline; }
  .status-pill {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }
  .status-見積もり中 { background: #eef1f5; color: #5b6472; }
  .status-進行中 { background: #e4edf9; color: #1e3a5f; }
  .status-納品済み { background: #e6f4ea; color: #1e7a34; }
  .status-キャンセル { background: #fdecea; color: #b3261e; text-decoration: line-through; }
  .status-未入金 { background: #fdf3e0; color: #a3660a; }
  .status-入金済み { background: #e6f4ea; color: #1e7a34; }
  .overdue { color: #b3261e; font-weight: 700; }
  .revenue-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin: 24px 0; }
  .revenue-cards .card .num { font-size: 24px; }
  .add-bar { margin-top: 16px; margin-bottom: 20px; }
  .login-box {
    max-width: 360px;
    margin: 80px auto;
    background: #fff;
    border: 1px solid #e4e7ec;
    border-radius: 16px;
    padding: 32px;
  }
  .login-box h1 { text-align: center; margin-bottom: 24px; }
  .login-box button { width: 100%; margin-top: 20px; }

  @media (max-width: 720px) {
    .app { flex-direction: column; }
    aside {
      position: sticky;
      top: 0;
      left: auto;
      width: 100%;
      height: auto;
      overflow-y: visible;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px 12px;
      padding: 12px 16px;
      z-index: 10;
    }
    aside .brand { padding: 0; border-bottom: none; font-size: 13px; white-space: nowrap; }
    aside nav {
      flex: 1 1 100%;
      order: 3;
      display: flex;
      flex-direction: row;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      padding-top: 0;
      gap: 4px;
    }
    aside nav a { padding: 8px 12px; white-space: nowrap; }
    aside .nav-section-label { display: none; }
    aside .footer {
      border-top: none;
      margin-top: 0;
      padding: 0;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-left: auto;
    }
    aside .footer a { padding: 0; font-size: 12px; }
    aside form { display: inline-block; }
    aside form button { width: auto; margin-top: 0; padding: 6px 10px; font-size: 12px; }
    main.content { margin-left: 0; padding: 20px 16px 60px; }
    .login-box { margin: 40px auto; max-width: calc(100% - 32px); }

    /* 横長テーブルはカード型に組み替えて横スクロールをなくす */
    .table-wrap { overflow-x: visible; border: none; background: none; }
    table.data, table.data tbody, table.data tr, table.data td { display: block; width: 100%; }
    table.data { white-space: normal; }
    table.data thead { display: none; }
    table.data tbody tr {
      background: #fff;
      border: 1px solid #e4e7ec;
      border-radius: 12px;
      margin-bottom: 12px;
      padding: 4px 0;
    }
    table.data td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      font-size: 14px;
      border-bottom: 1px solid #f0f1f4;
      text-align: right;
    }
    table.data tbody tr td:last-child { border-bottom: none; }
    table.data td::before {
      content: attr(data-label);
      font-size: 12px;
      font-weight: 600;
      color: #5b6472;
      text-align: left;
      flex-shrink: 0;
    }
    table.data td:not([data-label])::before { content: none; }
    table.data td.hint { display: block; text-align: left; }
    table.data td.actions { justify-content: flex-end; padding-top: 14px; }
  }
`;

function htmlShell(title: string, bodyInner: string): string {
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>${esc(title)} | 管理画面</title>
  <style>${baseStyle}</style>
</head>
<body>${bodyInner}</body>
</html>`;
}

export function loginPage(errorMessage?: string): string {
  const body = `
    <div class="login-box">
      <h1>管理画面ログイン</h1>
      ${errorMessage ? `<div class="banner error">${esc(errorMessage)}</div>` : ""}
      <form method="post" action="/login">
        <label for="email">メールアドレス</label>
        <input type="text" id="email" name="email" required autocomplete="username" />
        <label for="password">パスワード</label>
        <input type="password" id="password" name="password" required autocomplete="current-password" />
        <button class="primary" type="submit">ログイン</button>
      </form>
    </div>
  `;
  return htmlShell("ログイン", body);
}

type NavKey =
  | "overview"
  | "orders"
  | "revenue"
  | "inquiries"
  | "analytics"
  | "works"
  | "services"
  | "blog"
  | "seo";

const NAV_SECTIONS: {
  label: string;
  items: { key: NavKey; href: string; label: string }[];
}[] = [
  {
    label: "業務管理",
    items: [
      { key: "overview", href: "/", label: "ダッシュボード" },
      { key: "orders", href: "/orders", label: "受注管理" },
      { key: "revenue", href: "/revenue", label: "売上" },
      { key: "inquiries", href: "/inquiries", label: "お問い合わせ" },
      { key: "analytics", href: "/analytics", label: "アクセス解析" },
    ],
  },
  {
    label: "サイトコンテンツ",
    items: [
      { key: "works", href: "/works", label: "実績" },
      { key: "services", href: "/services", label: "料金" },
      { key: "blog", href: "/blog", label: "お知らせ" },
      { key: "seo", href: "/seo", label: "SEO" },
    ],
  },
];

function shell(opts: {
  title: string;
  active: NavKey;
  unreadCount: number;
  overdueCount?: number;
  content: string;
}): string {
  const nav = NAV_SECTIONS.map((section) => {
    const items = section.items
      .map((item) => {
        let badgeCount = 0;
        if (item.key === "inquiries") badgeCount = opts.unreadCount;
        if (item.key === "orders") badgeCount = opts.overdueCount ?? 0;
        const badge = badgeCount > 0 ? `<span class="badge">${badgeCount}</span>` : "";
        return `<a href="${item.href}" class="${item.key === opts.active ? "active" : ""}">${esc(item.label)}${badge}</a>`;
      })
      .join("");
    return `<div class="nav-section-label">${esc(section.label)}</div>${items}`;
  }).join("");

  const body = `
    <div class="app">
      <aside>
        <div class="brand">ヨリソイワークス<br />管理画面</div>
        <nav>${nav}</nav>
        <div class="footer">
          <a href="${PUBLIC_SITE_URL}" target="_blank" rel="noreferrer">公開サイトを見る ↗</a>
          <form method="post" action="/logout"><button type="submit">ログアウト</button></form>
        </div>
      </aside>
      <main class="content">${opts.content}</main>
    </div>
  `;
  return htmlShell(opts.title, body);
}

function banner(message?: { type: "ok" | "error"; text: string }): string {
  if (!message) return "";
  return `<div class="banner ${message.type === "ok" ? "ok" : "error"}">${esc(message.text)}</div>`;
}

export function formatYen(n: number): string {
  return `${n.toLocaleString("ja-JP")}円`;
}

export function overviewPage(data: {
  worksCount: number;
  servicesCount: number;
  blogCount: number;
  unreadCount: number;
  inquiriesCount: number;
  thisMonthRevenue: number;
  unpaidTotal: number;
  inProgressCount: number;
  overdueCount: number;
  todayPageviews: number;
  message?: { type: "ok" | "error"; text: string };
}): string {
  const content = `
    <h1>ダッシュボード</h1>
    <p class="hint">各項目を編集すると、数十秒〜1分ほどで公開サイトに反映されます。</p>
    ${banner(data.message)}

    <h2 style="margin-top:28px">業務状況</h2>
    <div class="cards">
      <div class="card">
        <div class="num">${formatYen(data.thisMonthRevenue)}</div>
        <div class="label">今月の確定売上</div>
        <a href="/revenue">詳しく見る →</a>
      </div>
      <div class="card">
        <div class="num">${formatYen(data.unpaidTotal)}</div>
        <div class="label">未入金の合計</div>
        <a href="/orders">確認する →</a>
      </div>
      <div class="card">
        <div class="num">${data.inProgressCount}${data.overdueCount > 0 ? ` <span style="font-size:14px" class="overdue">(納期超過 ${data.overdueCount})</span>` : ""}</div>
        <div class="label">進行中の案件</div>
        <a href="/orders">確認する →</a>
      </div>
      <div class="card">
        <div class="num">${data.unreadCount} <span style="font-size:14px;color:#5b6472">/ ${data.inquiriesCount}</span></div>
        <div class="label">未読のお問い合わせ</div>
        <a href="/inquiries">確認する →</a>
      </div>
      <div class="card">
        <div class="num">${data.todayPageviews}</div>
        <div class="label">今日のページビュー</div>
        <a href="/analytics">詳しく見る →</a>
      </div>
    </div>

    <h2 style="margin-top:36px">サイトコンテンツ</h2>
    <div class="cards">
      <div class="card">
        <div class="num">${data.worksCount}</div>
        <div class="label">実績・制作事例</div>
        <a href="/works">編集する →</a>
      </div>
      <div class="card">
        <div class="num">${data.servicesCount}</div>
        <div class="label">サービス・料金</div>
        <a href="/services">編集する →</a>
      </div>
      <div class="card">
        <div class="num">${data.blogCount}</div>
        <div class="label">お知らせ</div>
        <a href="/blog">編集する →</a>
      </div>
    </div>
  `;
  return shell({
    title: "ダッシュボード",
    active: "overview",
    unreadCount: data.unreadCount,
    overdueCount: data.overdueCount,
    content,
  });
}

function workFieldset(index: number, work?: WorkCase): string {
  return `
    <fieldset>
      <legend>実績 ${index + 1}${work ? "" : "(新規)"}</legend>
      <label>タイトル</label>
      <input type="text" name="title_${index}" value="${esc(work?.title)}" />
      <label>カテゴリ (例: HP制作 / LP制作 / システム・Webアプリ開発)</label>
      <input type="text" name="category_${index}" value="${esc(work?.category)}" />
      <label>概要</label>
      <textarea name="summary_${index}">${esc(work?.summary)}</textarea>
      <label>ポイント(1行に1つ)</label>
      <textarea name="points_${index}">${esc(work?.points?.join("\n"))}</textarea>
      <div class="checkbox-row">
        <input type="checkbox" id="isSample_${index}" name="isSample_${index}" ${work?.isSample !== false ? "checked" : ""} />
        <label for="isSample_${index}" style="margin:0">対応イメージ(実案件でなくサンプルとして表示)</label>
      </div>
      ${
        work
          ? `<div class="checkbox-row">
        <input type="checkbox" id="delete_${index}" name="delete_${index}" />
        <label for="delete_${index}" style="margin:0;color:#b3261e">この実績を削除する</label>
      </div>`
          : ""
      }
    </fieldset>
  `;
}

export function worksPage(data: {
  works: WorkCase[];
  unreadCount: number;
  message?: { type: "ok" | "error"; text: string };
}): string {
  const rows = [
    ...data.works.map((w, i) => workFieldset(i, w)),
    ...Array.from({ length: SPARE_WORKS_ROWS }, (_, i) =>
      workFieldset(data.works.length + i)
    ),
  ].join("");

  const content = `
    <h1>実績・制作事例</h1>
    <h2>公開サイトの「実績」ページに表示される内容です</h2>
    ${banner(data.message)}
    <form method="post" action="/works">
      <input type="hidden" name="rowCount" value="${data.works.length + SPARE_WORKS_ROWS}" />
      ${rows}
      <div class="save-bar"><button class="primary" type="submit">保存する</button></div>
    </form>
  `;
  return shell({ title: "実績", active: "works", unreadCount: data.unreadCount, content });
}

function serviceFieldset(index: number, service?: ServiceMenu): string {
  return `
    <fieldset>
      <legend>サービス ${index + 1}${service ? "" : "(新規)"}</legend>
      <label>サービス名</label>
      <input type="text" name="name_${index}" value="${esc(service?.name)}" />
      <label>価格(例: 50,000円〜)</label>
      <input type="text" name="priceFrom_${index}" value="${esc(service?.priceFrom)}" />
      <label>納期目安</label>
      <input type="text" name="duration_${index}" value="${esc(service?.duration)}" />
      <label>説明文</label>
      <textarea name="description_${index}">${esc(service?.description)}</textarea>
      <label>対応範囲(1行に1つ)</label>
      <textarea name="scope_${index}">${esc(service?.scope?.join("\n"))}</textarea>
      ${
        service
          ? `<div class="checkbox-row">
        <input type="checkbox" id="delete_s_${index}" name="delete_${index}" />
        <label for="delete_s_${index}" style="margin:0;color:#b3261e">このサービスを削除する</label>
      </div>`
          : ""
      }
    </fieldset>
  `;
}

export function servicesPage(data: {
  services: ServiceMenu[];
  unreadCount: number;
  message?: { type: "ok" | "error"; text: string };
}): string {
  const rows = [
    ...data.services.map((s, i) => serviceFieldset(i, s)),
    ...Array.from({ length: SPARE_SERVICES_ROWS }, (_, i) =>
      serviceFieldset(data.services.length + i)
    ),
  ].join("");

  const content = `
    <h1>サービス・料金</h1>
    <h2>公開サイトの「サービス・料金」ページに表示される内容です</h2>
    ${banner(data.message)}
    <form method="post" action="/services">
      <input type="hidden" name="rowCount" value="${data.services.length + SPARE_SERVICES_ROWS}" />
      ${rows}
      <div class="save-bar"><button class="primary" type="submit">保存する</button></div>
    </form>
  `;
  return shell({ title: "料金", active: "services", unreadCount: data.unreadCount, content });
}

function blogFieldset(index: number, post?: BlogPost): string {
  return `
    <fieldset>
      <legend>お知らせ ${index + 1}${post ? "" : "(新規)"}</legend>
      <label>タイトル</label>
      <input type="text" name="title_${index}" value="${esc(post?.title)}" />
      <div class="field-row">
        <div>
          <label>カテゴリ (例: 考え方 / 料金 / SEO対策)</label>
          <input type="text" name="category_${index}" value="${esc(post?.category)}" />
        </div>
        <div>
          <label>公開日 (YYYY-MM-DD)</label>
          <input type="text" name="publishedAt_${index}" value="${esc(post?.publishedAt)}" placeholder="2026-08-25" />
        </div>
      </div>
      <label>一覧に表示する概要文</label>
      <textarea name="excerpt_${index}">${esc(post?.excerpt)}</textarea>
      <label>本文(段落を分けたい場合は空行を1行入れてください)</label>
      <textarea name="body_${index}" style="min-height:180px">${esc(post?.body)}</textarea>
      ${
        post
          ? `<div class="checkbox-row">
        <input type="checkbox" id="delete_${index}" name="delete_${index}" />
        <label for="delete_${index}" style="margin:0;color:#b3261e">このお知らせを削除する</label>
      </div>`
          : ""
      }
    </fieldset>
  `;
}

export function blogPage(data: {
  posts: BlogPost[];
  unreadCount: number;
  message?: { type: "ok" | "error"; text: string };
}): string {
  const rows = [
    ...data.posts.map((p, i) => blogFieldset(i, p)),
    ...Array.from({ length: SPARE_BLOG_ROWS }, (_, i) =>
      blogFieldset(data.posts.length + i)
    ),
  ].join("");

  const content = `
    <h1>お知らせ</h1>
    <h2>公開サイトの「お知らせ」ページに表示される内容です(新しい日付順に自動で並びます)</h2>
    ${banner(data.message)}
    <form method="post" action="/blog">
      <input type="hidden" name="rowCount" value="${data.posts.length + SPARE_BLOG_ROWS}" />
      ${rows}
      <div class="save-bar"><button class="primary" type="submit">保存する</button></div>
    </form>
  `;
  return shell({ title: "お知らせ", active: "blog", unreadCount: data.unreadCount, content });
}

export function seoPage(data: {
  seo: SeoMap;
  unreadCount: number;
  message?: { type: "ok" | "error"; text: string };
}): string {
  const rows = SEO_PAGES.map(({ key, path, label }) => {
    const entry = data.seo[path] ?? { title: "", description: "" };
    return `
      <fieldset>
        <legend>${esc(label)} (${esc(path)})</legend>
        <label>タイトル</label>
        <input type="text" name="seoTitle_${key}" value="${esc(entry.title)}" />
        <label>ディスクリプション</label>
        <textarea name="seoDescription_${key}">${esc(entry.description)}</textarea>
      </fieldset>
    `;
  }).join("");

  const content = `
    <h1>SEO設定</h1>
    <h2>検索結果に表示されるページごとのタイトル・descriptionです</h2>
    ${banner(data.message)}
    <form method="post" action="/seo">
      ${rows}
      <div class="save-bar"><button class="primary" type="submit">保存する</button></div>
    </form>
  `;
  return shell({ title: "SEO設定", active: "seo", unreadCount: data.unreadCount, content });
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
}

export function inquiriesPage(data: {
  inquiries: Inquiry[];
  unreadCount: number;
  message?: { type: "ok" | "error"; text: string };
}): string {
  const list =
    data.inquiries.length === 0
      ? `<p class="hint">まだお問い合わせはありません。</p>`
      : data.inquiries
          .map(
            (inq) => `
        <div class="inquiry-card ${inq.read ? "" : "unread"}">
          <div class="inquiry-meta">
            <span>${formatDate(inq.receivedAt)}</span>
            <span>${esc(inq.inquiryType)}</span>
            ${inq.budget ? `<span>予算: ${esc(inq.budget)}</span>` : ""}
            ${inq.read ? "" : `<span style="color:#e05252;font-weight:700">未読</span>`}
          </div>
          <div><strong>${esc(inq.name)}</strong> &lt;${esc(inq.email)}&gt;</div>
          <div class="inquiry-message">${esc(inq.message)}</div>
          <div class="inquiry-actions">
            <form method="post" action="/inquiries/${encodeURIComponent(inq.key)}/toggle-read">
              <button class="small" type="submit">${inq.read ? "未読にする" : "既読にする"}</button>
            </form>
            <form method="post" action="/inquiries/${encodeURIComponent(inq.key)}/delete" onsubmit="return confirm('この問い合わせを削除しますか？');">
              <button class="small" type="submit" style="color:#b3261e;border-color:#b3261e">削除</button>
            </form>
          </div>
        </div>
      `
          )
          .join("");

  const content = `
    <h1>お問い合わせ</h1>
    <h2>公開サイトのお問い合わせフォームから送信された内容です</h2>
    ${banner(data.message)}
    ${list}
  `;
  return shell({ title: "お問い合わせ", active: "inquiries", unreadCount: data.unreadCount, content });
}

function isOverdue(order: Order): boolean {
  if (order.status === "納品済み" || order.status === "キャンセル") return false;
  if (!order.dueDate) return false;
  return order.dueDate < new Date().toISOString().slice(0, 10);
}

function selectOptions(options: readonly string[], selected?: string): string {
  return options
    .map((o) => `<option value="${esc(o)}" ${o === selected ? "selected" : ""}>${esc(o)}</option>`)
    .join("");
}

export function ordersListPage(data: {
  orders: Order[];
  unreadCount: number;
  overdueCount: number;
  message?: { type: "ok" | "error"; text: string };
}): string {
  const sorted = [...data.orders].sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"));

  const rows =
    sorted.length === 0
      ? `<tr><td colspan="8" class="hint" style="white-space:normal">まだ受注データがありません。「新規追加」から登録してください。</td></tr>`
      : sorted
          .map((o) => {
            const overdue = isOverdue(o);
            return `
        <tr>
          <td data-label="クライアント">${esc(o.clientName)}</td>
          <td data-label="サービス">${esc(o.serviceType)}</td>
          <td data-label="金額">${formatYen(o.amount)}</td>
          <td data-label="受注日">${esc(o.orderDate)}</td>
          <td data-label="納期" class="${overdue ? "overdue" : ""}">${esc(o.dueDate)}${overdue ? " (超過)" : ""}</td>
          <td data-label="進捗"><span class="status-pill status-${esc(o.status)}">${esc(o.status)}</span></td>
          <td data-label="入金"><span class="status-pill status-${esc(o.paymentStatus)}">${esc(o.paymentStatus)}</span></td>
          <td class="actions">
            <a href="/orders/${encodeURIComponent(o.key)}/edit" class="small" style="text-decoration:none;display:inline-block;padding:5px 14px;border:1px solid #1e3a5f;border-radius:999px;color:#1e3a5f;font-size:12px;font-weight:700">編集</a>
            <form method="post" action="/orders/${encodeURIComponent(o.key)}/delete" onsubmit="return confirm('この受注を削除しますか？');">
              <button class="small" type="submit" style="color:#b3261e;border-color:#b3261e">削除</button>
            </form>
          </td>
        </tr>
      `;
          })
          .join("");

  const content = `
    <h1>受注管理</h1>
    <h2>LPなど外部で受けた案件の納期・金額・進捗を管理します</h2>
    ${banner(data.message)}
    <div class="add-bar">
      <a href="/orders/new" class="primary" style="text-decoration:none;display:inline-block;border-radius:999px;padding:10px 28px;font-size:14px;font-weight:700;background:#1e3a5f;color:#fff">+ 新規受注を追加</a>
    </div>
    <div class="table-wrap">
      <table class="data">
        <thead>
          <tr>
            <th>クライアント</th>
            <th>サービス</th>
            <th>金額</th>
            <th>受注日</th>
            <th>納期</th>
            <th>進捗</th>
            <th>入金</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
  return shell({
    title: "受注管理",
    active: "orders",
    unreadCount: data.unreadCount,
    overdueCount: data.overdueCount,
    content,
  });
}

export function orderFormPage(data: {
  order?: Order;
  unreadCount: number;
  overdueCount: number;
  message?: { type: "ok" | "error"; text: string };
}): string {
  const o = data.order;
  const action = o ? `/orders/${encodeURIComponent(o.key)}` : "/orders";

  const content = `
    <h1>${o ? "受注を編集" : "受注を新規追加"}</h1>
    <h2>LINEなど外部で受けたご依頼の情報を入力してください</h2>
    ${banner(data.message)}
    <form method="post" action="${action}">
      <fieldset>
        <label>クライアント名</label>
        <input type="text" name="clientName" value="${esc(o?.clientName)}" required />

        <div class="field-row">
          <div>
            <label>サービス種別</label>
            <select name="serviceType">${selectOptions(ORDER_SERVICE_TYPES, o?.serviceType)}</select>
          </div>
          <div>
            <label>金額(円)</label>
            <input type="text" inputmode="numeric" name="amount" value="${o ? o.amount : ""}" placeholder="150000" />
          </div>
        </div>

        <div class="field-row">
          <div>
            <label>受注日</label>
            <input type="text" name="orderDate" value="${esc(o?.orderDate)}" placeholder="2026-08-25" />
          </div>
          <div>
            <label>納期</label>
            <input type="text" name="dueDate" value="${esc(o?.dueDate)}" placeholder="2026-09-30" />
          </div>
        </div>

        <div class="field-row">
          <div>
            <label>進捗ステータス</label>
            <select name="status">${selectOptions(ORDER_STATUSES, o?.status)}</select>
          </div>
          <div>
            <label>入金状況</label>
            <select name="paymentStatus">${selectOptions(PAYMENT_STATUSES, o?.paymentStatus)}</select>
          </div>
        </div>

        <label>入金日(入金済みの場合)</label>
        <input type="text" name="paidDate" value="${esc(o?.paidDate)}" placeholder="2026-09-15" />

        <label>メモ</label>
        <textarea name="notes">${esc(o?.notes)}</textarea>
      </fieldset>
      <div class="save-bar">
        <button class="primary" type="submit">保存する</button>
        <a href="/orders" style="margin-left:12px;font-size:13px;color:#5b6472">キャンセルして戻る</a>
      </div>
    </form>
  `;
  return shell({
    title: o ? "受注を編集" : "受注を新規追加",
    active: "orders",
    unreadCount: data.unreadCount,
    overdueCount: data.overdueCount,
    content,
  });
}

export function revenuePage(data: {
  unreadCount: number;
  overdueCount: number;
  thisMonthRevenue: number;
  yearToDateRevenue: number;
  unpaidTotal: number;
  pipelineTotal: number;
  monthly: { month: string; total: number; count: number }[];
}): string {
  const rows =
    data.monthly.length === 0
      ? `<tr><td colspan="3" class="hint" style="white-space:normal">入金済みの受注データがまだありません。</td></tr>`
      : data.monthly
          .map(
            (m) => `
        <tr>
          <td data-label="月">${esc(m.month)}</td>
          <td data-label="売上">${formatYen(m.total)}</td>
          <td data-label="件数">${m.count}件</td>
        </tr>
      `
          )
          .join("");

  const content = `
    <h1>売上</h1>
    <h2>受注管理で「入金済み」にした金額をもとに集計しています</h2>

    <div class="revenue-cards">
      <div class="card">
        <div class="num">${formatYen(data.thisMonthRevenue)}</div>
        <div class="label">今月の確定売上</div>
      </div>
      <div class="card">
        <div class="num">${formatYen(data.yearToDateRevenue)}</div>
        <div class="label">今年の累計売上</div>
      </div>
      <div class="card">
        <div class="num">${formatYen(data.unpaidTotal)}</div>
        <div class="label">未入金の合計</div>
      </div>
      <div class="card">
        <div class="num">${formatYen(data.pipelineTotal)}</div>
        <div class="label">進行中・見積もり中の見込み額</div>
      </div>
    </div>

    <h2 style="margin-top:8px">月別の確定売上</h2>
    <div class="table-wrap" style="margin-top:12px">
      <table class="data">
        <thead><tr><th>月</th><th>売上</th><th>件数</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
  return shell({
    title: "売上",
    active: "revenue",
    unreadCount: data.unreadCount,
    overdueCount: data.overdueCount,
    content,
  });
}

function dailyBarChart(daily: { date: string; count: number }[]): string {
  if (daily.length === 0) return "";

  const width = 700;
  const height = 200;
  const paddingBottom = 28;
  const paddingTop = 12;
  const chartHeight = height - paddingBottom - paddingTop;
  const max = Math.max(1, ...daily.map((d) => d.count));
  const barGap = 6;
  const barWidth = (width - barGap * (daily.length - 1)) / daily.length;

  const bars = daily
    .map((d, i) => {
      const barHeight = Math.max(Math.round((d.count / max) * chartHeight), d.count > 0 ? 2 : 0);
      const x = i * (barWidth + barGap);
      const y = paddingTop + (chartHeight - barHeight);
      const label = d.date.slice(5).replace("-", "/");
      return `
        <rect x="${x.toFixed(1)}" y="${y}" width="${barWidth.toFixed(1)}" height="${barHeight}" rx="3" fill="#1e3a5f">
          <title>${esc(d.date)}: ${d.count}件</title>
        </rect>
        ${
          d.count > 0
            ? `<text x="${(x + barWidth / 2).toFixed(1)}" y="${y - 4}" font-size="10" fill="#1e3a5f" text-anchor="middle" font-weight="700">${d.count}</text>`
            : ""
        }
        <text x="${(x + barWidth / 2).toFixed(1)}" y="${height - 8}" font-size="9" fill="#5b6472" text-anchor="middle">${esc(label)}</text>
      `;
    })
    .join("");

  return `
    <div class="table-wrap" style="padding:16px 20px">
      <svg viewBox="0 0 ${width} ${height}" style="width:100%; height:auto; max-height:220px; display:block" role="img" aria-label="日別ページビュー推移">
        ${bars}
      </svg>
    </div>
  `;
}

export function analyticsPage(data: {
  summary: AnalyticsSummary;
  unreadCount: number;
  overdueCount: number;
}): string {
  const { summary } = data;

  const body = !summary.available
    ? `<div class="banner error">アクセス解析を取得できませんでした${summary.errorMessage ? `: ${esc(summary.errorMessage)}` : ""}。しばらくしてから再度お試しください。</div>`
    : `
      <div class="cards">
        <div class="card">
          <div class="num">${summary.today}</div>
          <div class="label">今日のページビュー</div>
        </div>
        <div class="card">
          <div class="num">${summary.last7Days}</div>
          <div class="label">直近7日間</div>
        </div>
        <div class="card">
          <div class="num">${summary.last30Days}</div>
          <div class="label">直近30日間</div>
        </div>
      </div>

      <h2 style="margin-top:32px">日別ページビュー(直近14日間)</h2>
      ${dailyBarChart(summary.dailyCounts)}

      <h2 style="margin-top:32px">よく見られているページ(直近30日間)</h2>
      <div class="table-wrap" style="margin-top:12px">
        <table class="data">
          <thead><tr><th>パス</th><th>ページビュー</th></tr></thead>
          <tbody>
            ${
              summary.topPages.length === 0
                ? `<tr><td colspan="2" class="hint" style="white-space:normal">まだデータがありません。サイトへのアクセスが増えると表示されます。</td></tr>`
                : summary.topPages
                    .map((p) => `<tr><td data-label="パス">${esc(p.path)}</td><td data-label="ページビュー">${p.count}</td></tr>`)
                    .join("")
            }
          </tbody>
        </table>
      </div>
      <p class="hint" style="margin-top:16px">Cloudflare Web Analyticsのデータです(Cookie不使用)。反映まで数分かかる場合があります。</p>
    `;

  const content = `
    <h1>アクセス解析</h1>
    <h2>公開サイトへのアクセス状況です</h2>
    ${body}
  `;
  return shell({
    title: "アクセス解析",
    active: "analytics",
    unreadCount: data.unreadCount,
    overdueCount: data.overdueCount,
    content,
  });
}
