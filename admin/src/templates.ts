import {
  SEO_PAGES,
  SPARE_SERVICES_ROWS,
  SPARE_WORKS_ROWS,
  type Inquiry,
  type ServiceMenu,
  type SeoMap,
  type WorkCase,
} from "./types";

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
    width: 220px;
    flex-shrink: 0;
    background: #1e3a5f;
    color: #fff;
    display: flex;
    flex-direction: column;
    padding: 20px 0;
  }
  aside .brand { padding: 0 20px 20px; font-weight: 700; font-size: 15px; border-bottom: 1px solid rgba(255,255,255,0.15); }
  aside nav { flex: 1; padding-top: 12px; }
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
  main.content { flex: 1; padding: 32px 40px 80px; max-width: 900px; }
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
  input[type="text"], textarea {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #e4e7ec;
    border-radius: 8px;
    font-size: 16px;
    font-family: inherit;
  }
  textarea { min-height: 70px; resize: vertical; }
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
      width: 100%;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px 12px;
      padding: 12px 16px;
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
    main.content { padding: 20px 16px 60px; }
    .login-box { margin: 40px auto; max-width: calc(100% - 32px); }
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
        <input type="text" id="password" name="password" required autocomplete="current-password" style="-webkit-text-security:disc;" />
        <button class="primary" type="submit">ログイン</button>
      </form>
    </div>
  `;
  return htmlShell("ログイン", body);
}

type NavKey = "overview" | "works" | "services" | "seo" | "inquiries";

const NAV_ITEMS: { key: NavKey; href: string; label: string }[] = [
  { key: "overview", href: "/", label: "ダッシュボード" },
  { key: "works", href: "/works", label: "実績" },
  { key: "services", href: "/services", label: "料金" },
  { key: "seo", href: "/seo", label: "SEO" },
  { key: "inquiries", href: "/inquiries", label: "お問い合わせ" },
];

function shell(opts: {
  title: string;
  active: NavKey;
  unreadCount: number;
  content: string;
}): string {
  const nav = NAV_ITEMS.map((item) => {
    const badge =
      item.key === "inquiries" && opts.unreadCount > 0
        ? `<span class="badge">${opts.unreadCount}</span>`
        : "";
    return `<a href="${item.href}" class="${item.key === opts.active ? "active" : ""}">${esc(item.label)}${badge}</a>`;
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

export function overviewPage(data: {
  worksCount: number;
  servicesCount: number;
  unreadCount: number;
  inquiriesCount: number;
  message?: { type: "ok" | "error"; text: string };
}): string {
  const content = `
    <h1>ダッシュボード</h1>
    <p class="hint">各項目を編集すると、数十秒〜1分ほどで公開サイトに反映されます。</p>
    ${banner(data.message)}
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
        <div class="num">${data.unreadCount} <span style="font-size:14px;color:#5b6472">/ ${data.inquiriesCount}</span></div>
        <div class="label">未読のお問い合わせ</div>
        <a href="/inquiries">確認する →</a>
      </div>
    </div>
  `;
  return shell({
    title: "ダッシュボード",
    active: "overview",
    unreadCount: data.unreadCount,
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
