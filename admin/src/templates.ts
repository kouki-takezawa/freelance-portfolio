import {
  SEO_PAGES,
  SPARE_SERVICES_ROWS,
  SPARE_WORKS_ROWS,
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

const baseStyle = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Hiragino Kaku Gothic ProN", "Yu Gothic", system-ui, sans-serif;
    background: #f8f9fb;
    color: #171923;
  }
  header {
    background: #1e3a5f;
    color: #fff;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  header a { color: #fff; text-decoration: none; font-weight: 700; }
  header nav a { margin-right: 16px; font-weight: 500; opacity: 0.9; }
  header form { display: inline; }
  header button {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.5);
    color: #fff;
    border-radius: 999px;
    padding: 6px 14px;
    cursor: pointer;
    font-size: 13px;
  }
  main { max-width: 880px; margin: 0 auto; padding: 32px 24px 80px; }
  h1 { font-size: 22px; }
  h2 { font-size: 18px; border-bottom: 2px solid #e4e7ec; padding-bottom: 8px; margin-top: 48px; }
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
    font-size: 14px;
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
  .hint { color: #5b6472; font-size: 13px; margin-top: 4px; }
  .banner {
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 14px;
  }
  .banner.ok { background: #e6f4ea; color: #1e7a34; }
  .banner.error { background: #fdecea; color: #b3261e; }
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
`;

function layout(title: string, body: string, loggedIn: boolean): string {
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>${esc(title)} | 管理画面</title>
  <style>${baseStyle}</style>
</head>
<body>
  ${
    loggedIn
      ? `<header>
    <a href="/">ヨリソイワークス管理画面</a>
    <div>
      <nav style="display:inline">
        <a href="/#works">実績</a>
        <a href="/#services">料金</a>
        <a href="/#seo">SEO</a>
      </nav>
      <form method="post" action="/logout"><button type="submit">ログアウト</button></form>
    </div>
  </header>`
      : ""
  }
  <main>${body}</main>
</body>
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
  return layout("ログイン", body, false);
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

export function dashboardPage(data: {
  works: WorkCase[];
  services: ServiceMenu[];
  seo: SeoMap;
  message?: { type: "ok" | "error"; text: string };
}): string {
  const workRows = [
    ...data.works.map((w, i) => workFieldset(i, w)),
    ...Array.from({ length: SPARE_WORKS_ROWS }, (_, i) =>
      workFieldset(data.works.length + i)
    ),
  ].join("");

  const serviceRows = [
    ...data.services.map((s, i) => serviceFieldset(i, s)),
    ...Array.from({ length: SPARE_SERVICES_ROWS }, (_, i) =>
      serviceFieldset(data.services.length + i)
    ),
  ].join("");

  const seoRows = SEO_PAGES.map(({ key, path, label }) => {
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

  const banner = data.message
    ? `<div class="banner ${data.message.type === "ok" ? "ok" : "error"}">${esc(data.message.text)}</div>`
    : "";

  const body = `
    <h1>サイトコンテンツ管理</h1>
    <p class="hint">保存すると数十秒〜1分ほどでサイトに反映されます(GitHubへコミット→自動デプロイ)。</p>
    ${banner}

    <h2 id="works">実績・制作事例</h2>
    <form method="post" action="/works">
      <input type="hidden" name="rowCount" value="${data.works.length + SPARE_WORKS_ROWS}" />
      ${workRows}
      <div class="save-bar"><button class="primary" type="submit">実績を保存</button></div>
    </form>

    <h2 id="services">サービス・料金</h2>
    <form method="post" action="/services">
      <input type="hidden" name="rowCount" value="${data.services.length + SPARE_SERVICES_ROWS}" />
      ${serviceRows}
      <div class="save-bar"><button class="primary" type="submit">料金を保存</button></div>
    </form>

    <h2 id="seo">SEO設定(ページごとのタイトル・description)</h2>
    <form method="post" action="/seo">
      ${seoRows}
      <div class="save-bar"><button class="primary" type="submit">SEO設定を保存</button></div>
    </form>
  `;

  return layout("ダッシュボード", body, true);
}
