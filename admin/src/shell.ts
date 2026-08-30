// 全ページ共通のレイアウト: <head>の組み立て、サイドバーナビ、コマンドパレット、
// AIチャットパネル、リアルタイム更新バナーなど、ページ本体(templates.ts)を包む枠組み。

import { esc, PUBLIC_SITE_URL } from "./util";
import { baseStyle, SW_REGISTER_SCRIPT, THEME_BOOTSTRAP_SCRIPT } from "./styles";

export function htmlShell(title: string, bodyInner: string, nonce: string): string {
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>${esc(title)} | AI事業部</title>
  <link rel="manifest" href="/manifest.webmanifest" />
  <link rel="icon" href="/icon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/icon.svg" />
  <meta name="theme-color" content="#0a0e17" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@400;500;700&display=swap" />
  <style>${baseStyle}</style>
  <script nonce="${nonce}">${THEME_BOOTSTRAP_SCRIPT}</script>
</head>
<body>${bodyInner}<script nonce="${nonce}">${SW_REGISTER_SCRIPT}</script></body>
</html>`;
}

export type NavKey =
  | "orders"
  | "revenue"
  | "inquiries"
  | "sns"
  | "analytics"
  | "trash"
  | "activity"
  | "approvals"
  | "settings"
  | "clients"
  | "reports"
  | "search"
  | "org";

// サイドバー折り畳み時にも見分けられるよう、ナビ項目ごとに簡単なアイコンを用意する
const NAV_ICON_PATHS: Record<NavKey, string> = {
  org: '<path d="M3 10.5 12 4l9 6.5"/><path d="M5 9.5V19a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
  approvals: '<circle cx="12" cy="12" r="8.5"/><path d="m8 12.2 2.8 2.8L16.5 9"/>',
  inquiries: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  clients: '<circle cx="12" cy="8.5" r="3.5"/><path d="M4.5 19.5c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6"/>',
  orders: '<rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M9 8.5h6M9 12.5h6M9 16.5h3"/>',
  sns: '<circle cx="6" cy="12" r="2"/><circle cx="17" cy="6" r="2"/><circle cx="17" cy="18" r="2"/><path d="m7.7 11 7.6-3.8M7.7 13l7.6 3.8"/>',
  revenue: '<path d="M4 20V4"/><path d="M4 20h16"/><path d="m7 15.5 4-4.5 3 3 5-6"/>',
  reports: '<path d="M6.5 3h7l4 4v13.5a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M9 12h6M9 15.5h6M9 8.5h2"/>',
  activity: '<path d="M3 12h3.5l1.8 6 4-13 1.8 7H21"/>',
  analytics: '<path d="M4.5 20V12M11 20V5M17.5 20v-8"/><path d="M3 20h18"/>',
  trash: '<path d="M4.5 7h15"/><path d="M6.5 7l1 12.5A1.8 1.8 0 0 0 9.3 21h5.4a1.8 1.8 0 0 0 1.8-1.5L17.5 7"/><path d="M9.5 7V4.7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7"/>',
  settings: '<path d="M4 6.5h9M4 17.5h5.5"/><circle cx="16" cy="6.5" r="2"/><circle cx="12" cy="17.5" r="2"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.8-4.8"/>',
};

function navIcon(key: NavKey): string {
  return `<svg class="nav-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${NAV_ICON_PATHS[key]}</svg>`;
}

const NAV_SECTIONS: {
  key: string;
  label: string;
  items: { key: NavKey; href: string; label: string }[];
}[] = [
  {
    key: "home",
    label: "AI事業部(ホーム)",
    items: [
      { key: "org", href: "/", label: "組織図・全社サマリー" },
      { key: "approvals", href: "/approvals", label: "承認センター" },
    ],
  },
  {
    key: "eigyo",
    label: "営業部",
    items: [
      { key: "inquiries", href: "/inquiries", label: "お問い合わせ" },
      { key: "clients", href: "/clients", label: "クライアント一覧" },
    ],
  },
  {
    key: "seisaku",
    label: "制作部",
    items: [{ key: "orders", href: "/orders", label: "受注管理" }],
  },
  {
    key: "sns",
    label: "SNS部",
    items: [{ key: "sns", href: "/sns", label: "投稿一覧" }],
  },
  {
    key: "somu",
    label: "総務・経理部",
    items: [
      { key: "revenue", href: "/revenue", label: "売上" },
      { key: "reports", href: "/reports/monthly", label: "月次レポート" },
    ],
  },
  {
    key: "other",
    label: "その他",
    items: [
      { key: "activity", href: "/activity", label: "アクティビティ" },
      { key: "analytics", href: "/analytics", label: "アクセス解析" },
      { key: "trash", href: "/trash", label: "ゴミ箱" },
      { key: "settings", href: "/settings", label: "設定" },
    ],
  },
];

// コマンドパレット(Ctrl+K)から遷移できる先。ナビと同じ構造だが、テーマ切替などの操作も混ぜる。
const CMDK_DESTINATIONS: { label: string; href?: string; action?: string; hint: string }[] = [
  { label: "組織図・全社サマリー", href: "/", hint: "ホーム" },
  { label: "承認センター", href: "/approvals", hint: "承認待ちを一括確認" },
  { label: "お問い合わせ", href: "/inquiries", hint: "営業部" },
  { label: "クライアント一覧", href: "/clients", hint: "営業部" },
  { label: "受注を新規追加", href: "/orders/new", hint: "制作部" },
  { label: "受注管理", href: "/orders", hint: "制作部" },
  { label: "売上", href: "/revenue", hint: "総務・経理部" },
  { label: "月次レポート", href: "/reports/monthly", hint: "総務・経理部" },
  { label: "SNS投稿一覧", href: "/sns", hint: "SNS部" },
  { label: "アクティビティ", href: "/activity", hint: "履歴" },
  { label: "アクセス解析", href: "/analytics", hint: "" },
  { label: "ゴミ箱", href: "/trash", hint: "" },
  { label: "設定", href: "/settings", hint: "ログインID・パスワード" },
  { label: "ダーク/ライト表示を切り替え", action: "theme", hint: "操作" },
  { label: "ログアウト", action: "logout", hint: "操作" },
];

export function shell(opts: {
  title: string;
  active: NavKey;
  unreadCount: number;
  overdueCount?: number;
  pendingTotal?: number;
  wide?: boolean | "full";
  content: string;
  nonce: string;
}): string {
  const nonce = opts.nonce;
  const pendingTotal = opts.pendingTotal ?? 0;
  const nav = NAV_SECTIONS.map((section) => {
    const items = section.items
      .map((item) => {
        let badgeCount = 0;
        if (item.key === "inquiries") badgeCount = opts.unreadCount;
        if (item.key === "orders") badgeCount = opts.overdueCount ?? 0;
        if (item.key === "approvals") badgeCount = pendingTotal;
        const liveAttr = item.key === "approvals" ? ' data-live="pendingTotalBadge"' : "";
        const badge =
          badgeCount > 0
            ? `<span class="badge"${liveAttr}>${badgeCount}</span>`
            : item.key === "approvals"
            ? `<span class="badge" style="display:none"${liveAttr}>0</span>`
            : "";
        return `<a href="${item.href}" class="${item.key === opts.active ? "active" : ""}" title="${esc(item.label)}">${navIcon(item.key)}<span class="nav-label">${esc(item.label)}</span>${badge}</a>`;
      })
      .join("");
    const hasActive = section.items.some((item) => item.key === opts.active);
    return `<div class="nav-section" data-section="${section.key}">
      <button type="button" class="nav-section-toggle" aria-expanded="true" aria-controls="navsec-${section.key}">
        <span class="nav-section-label">${esc(section.label)}</span>
        <svg class="nav-section-chevron" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      <div class="nav-section-items" id="navsec-${section.key}" data-has-active="${hasActive}">${items}</div>
    </div>`;
  }).join("");

  const cmdkItems = CMDK_DESTINATIONS.map(
    (d, i) =>
      `<div class="cmdk-item" data-idx="${i}" data-href="${d.href ? esc(d.href) : ""}" data-action="${d.action ? esc(d.action) : ""}">
        <span>${esc(d.label)}</span>
        <span class="cmdk-hint">${esc(d.hint)}</span>
      </div>`
  ).join("");

  const body = `
    <div class="app">
      <aside id="appAside">
        <div class="brand-row">
          <div class="brand nav-label">ヨリソイワークス<br />AI事業部</div>
          <div class="brand-mark">YW</div>
          <button type="button" id="collapseBtn" class="collapse-btn" aria-label="サイドバーを折りたたむ" title="サイドバーを折りたたむ">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
          </button>
        </div>
        <button type="button" id="hamburgerBtn" class="hamburger-btn" aria-label="メニューを開く" aria-expanded="false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <nav>${nav}</nav>
        <div class="footer">
          <a href="${PUBLIC_SITE_URL}" target="_blank" rel="noreferrer" title="公開サイトを見る">
            <svg class="nav-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6"/></svg>
            <span class="nav-label">公開サイトを見る ↗</span>
          </a>
          <div class="notif-bell-wrap">
            <button type="button" id="notifBell" class="notif-bell" aria-label="通知" aria-haspopup="true" aria-expanded="false" title="通知">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span class="notif-dot" id="notifDot" style="display:none">0</span>
            </button>
            <div class="notif-panel" id="notifPanel" role="region" aria-label="通知一覧"></div>
          </div>
          <button type="button" id="cmdkTrigger" class="cmdk-trigger" aria-label="コマンドパレットを開く" title="クイック検索">
            <svg class="nav-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.8-4.8"/></svg>
            <span class="nav-label">クイック検索</span>
            <kbd class="nav-label">Ctrl K</kbd>
          </button>
          <button type="button" id="themeToggle" class="theme-toggle" aria-label="ライト/ダーク表示切り替え" title="表示切替">
            <svg class="icon-sun" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
            <svg class="icon-moon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            <span class="theme-toggle-label nav-label">表示切替</span>
          </button>
          <div class="palette-picker nav-label" role="group" aria-label="アクセントカラー">
            <button type="button" class="palette-swatch" data-palette="aurora" style="--sw-a:#2dd4ee;--sw-b:#8b5cf6" aria-label="Aurora(標準)"></button>
            <button type="button" class="palette-swatch" data-palette="forest" style="--sw-a:#16a34a;--sw-b:#0d9488" aria-label="Forest"></button>
            <button type="button" class="palette-swatch" data-palette="sunset" style="--sw-a:#fb923c;--sw-b:#ec4899" aria-label="Sunset"></button>
            <button type="button" class="palette-swatch" data-palette="ocean" style="--sw-a:#38bdf8;--sw-b:#6366f1" aria-label="Ocean"></button>
          </div>
          <button type="button" id="soundToggle" class="theme-toggle" aria-label="効果音の切り替え" title="効果音">
            <span id="soundIcon">🔇</span>
            <span id="soundLabel" class="nav-label">効果音オフ</span>
          </button>
          <form method="post" action="/logout" title="ログアウト">
            <button type="submit">
              <svg class="nav-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
              <span class="nav-label">ログアウト</span>
            </button>
          </form>
        </div>
      </aside>
      <main class="content">${opts.content}</main>
    </div>

    <div id="topLoadBar"></div>
    <div id="liveBanner" role="status">新しい更新があります・クリックで反映</div>
    <div class="confetti-container" id="confettiContainer"></div>
    <div id="kbdLiveRegion" class="sr-only" role="status" aria-live="polite"></div>

    <div class="kbd-help-overlay" id="kbdHelpOverlay" role="dialog" aria-modal="true" aria-label="キーボードショートカット">
      <div class="kbd-help-box">
        <h3>
          キーボードショートカット
          <button type="button" id="kbdHelpClose" aria-label="閉じる" style="background:none;border:none;color:var(--text-faint);cursor:pointer;font-size:16px;float:right">×</button>
        </h3>
        <div class="kbd-help-row"><span>コマンドパレットを開く</span><span>Ctrl / Cmd + K</span></div>
        <div class="kbd-help-row"><span>一覧で下・上に移動</span><span>J / K</span></div>
        <div class="kbd-help-row"><span>選択中の行を開く</span><span>Enter</span></div>
        <div class="kbd-help-row"><span>このヘルプを開く/閉じる</span><span>?</span></div>
      </div>
    </div>

    <div class="cmdk-overlay" id="cmdkOverlay">
      <div class="cmdk-box">
        <input type="text" id="cmdkInput" placeholder="ページを検索・移動... (Esc で閉じる)" autocomplete="off" />
        <div class="cmdk-list" id="cmdkList">${cmdkItems}</div>
        <div class="cmdk-empty" id="cmdkEmpty" style="display:none">Enter キーで全データから検索</div>
      </div>
    </div>

    <button type="button" class="chat-fab" id="chatFab" aria-label="PM AIに質問する">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
    </button>
    <div class="chat-panel" id="chatPanel">
      <div class="chat-head">
        <span>PM AI に質問</span>
        <button type="button" id="chatClose" aria-label="閉じる">×</button>
      </div>
      <div class="chat-body" id="chatBody">
        <div class="chat-msg system">実データ(未読件数・売上など)を踏まえて答えます。</div>
      </div>
      <form class="chat-form" id="chatForm">
        <input type="text" id="chatInput" placeholder="例: 今月の売上は？" autocomplete="off" />
        <button type="submit">送信</button>
      </form>
    </div>

    <script nonce="${nonce}">
      // モーダル(コマンドパレット・ショートカット一覧)共通のフォーカストラップ。
      // Tabで最後の要素から出たら先頭へ、Shift+Tabで先頭から出たら末尾へ戻す。
      function trapFocus(overlay, e) {
        if (e.key !== "Tab") return;
        var focusable = Array.prototype.slice
          .call(overlay.querySelectorAll('a[href], button, input, [tabindex]:not([tabindex="-1"])'))
          .filter(function (el) { return el.offsetParent !== null && !el.disabled; });
        if (focusable.length === 0) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }

      // data-confirm属性を持つフォームは送信前にconfirm()で確認する
      // (CSPでインラインonsubmit=を許可しないため、共通スクリプト側でまとめて処理する)
      document.querySelectorAll("form[data-confirm]").forEach(function (form) {
        form.addEventListener("submit", function (e) {
          if (!confirm(form.getAttribute("data-confirm"))) e.preventDefault();
        });
      });

      (function () {
        var printBtn = document.getElementById("printReportBtn");
        if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
      })();

      (function () {
        var btn = document.getElementById("themeToggle");
        if (!btn) return;
        var sun = btn.querySelector(".icon-sun");
        var moon = btn.querySelector(".icon-moon");
        var label = btn.querySelector(".theme-toggle-label");
        function resolved() {
          var stored = localStorage.getItem("theme");
          if (stored === "light" || stored === "dark") return stored;
          return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
        }
        function render() {
          var t = resolved();
          sun.style.display = t === "dark" ? "none" : "block";
          moon.style.display = t === "dark" ? "block" : "none";
          label.textContent = t === "dark" ? "ライトモード" : "ダークモード";
        }
        render();
        btn.addEventListener("click", function () {
          var next = resolved() === "dark" ? "light" : "dark";
          try {
            localStorage.setItem("theme", next);
          } catch (e) {}
          document.documentElement.setAttribute("data-theme", next);
          render();
        });
        window.__toggleTheme = function () {
          btn.click();
        };
      })();

      (function () {
        var aside = document.getElementById("appAside");
        var hamburger = document.getElementById("hamburgerBtn");
        if (!aside || !hamburger) return;
        hamburger.addEventListener("click", function () {
          var open = aside.classList.toggle("nav-open");
          hamburger.setAttribute("aria-expanded", open ? "true" : "false");
        });
        aside.addEventListener("click", function (e) {
          if (e.target === aside) aside.classList.remove("nav-open");
        });
        aside.querySelectorAll("nav a").forEach(function (a) {
          a.addEventListener("click", function () {
            aside.classList.remove("nav-open");
          });
        });
      })();

      // サイドバーの折りたたみ(デスクトップ幅のみ。閲覧者ごとの好みなのでブラウザに保存する)
      (function () {
        var btn = document.getElementById("collapseBtn");
        if (!btn) return;
        function isCollapsed() {
          return document.documentElement.getAttribute("data-sidebar") === "collapsed";
        }
        function render() {
          var collapsed = isCollapsed();
          btn.setAttribute("aria-label", collapsed ? "サイドバーを展開する" : "サイドバーを折りたたむ");
          btn.title = collapsed ? "サイドバーを展開する" : "サイドバーを折りたたむ";
        }
        render();
        btn.addEventListener("click", function () {
          var next = !isCollapsed();
          document.documentElement.setAttribute("data-sidebar", next ? "collapsed" : "expanded");
          try { localStorage.setItem("sidebar-collapsed", next ? "1" : "0"); } catch (e) {}
          render();
          if (window.__redrawOrgChart) setTimeout(window.__redrawOrgChart, 200);
        });
      })();

      // サイドバーの部門ごとの折りたたみ(アコーディオン式。閲覧者ごとの好みなのでブラウザに保存する)
      (function () {
        var STORAGE_KEY = "nav-collapsed-sections";
        function getCollapsedKeys() {
          try { return (localStorage.getItem(STORAGE_KEY) || "").split(",").filter(Boolean); } catch (e) { return []; }
        }
        function setCollapsedKeys(keys) {
          try { localStorage.setItem(STORAGE_KEY, keys.join(",")); } catch (e) {}
        }
        var stored = getCollapsedKeys();
        var sections = Array.prototype.slice.call(document.querySelectorAll(".nav-section"));
        sections.forEach(function (section) {
          var key = section.getAttribute("data-section");
          var toggle = section.querySelector(".nav-section-toggle");
          var items = section.querySelector(".nav-section-items");
          if (!toggle || !items) return;
          // 現在開いているページの部門は、保存された状態に関わらず必ず開いた状態にする
          var hasActive = items.getAttribute("data-has-active") === "true";
          function apply(collapsed) {
            section.classList.toggle("collapsed", collapsed);
            toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
          }
          apply(!hasActive && stored.indexOf(key) !== -1);
          toggle.addEventListener("click", function () {
            var next = !section.classList.contains("collapsed");
            apply(next);
            var keys = getCollapsedKeys().filter(function (k) { return k !== key; });
            if (next) keys.push(key);
            setCollapsedKeys(keys);
          });
        });
      })();

      (function () {
        var overlay = document.getElementById("cmdkOverlay");
        var input = document.getElementById("cmdkInput");
        var list = document.getElementById("cmdkList");
        var trigger = document.getElementById("cmdkTrigger");
        if (!overlay || !input || !list) return;
        var items = Array.prototype.slice.call(list.querySelectorAll(".cmdk-item"));
        var activeIdx = 0;

        function filtered() {
          return items.filter(function (el) { return el.style.display !== "none"; });
        }
        function setActive(idx) {
          var vis = filtered();
          vis.forEach(function (el) { el.classList.remove("active"); });
          if (vis.length === 0) return;
          activeIdx = ((idx % vis.length) + vis.length) % vis.length;
          vis[activeIdx].classList.add("active");
        }
        function runItem(el) {
          if (!el) return;
          var href = el.getAttribute("data-href");
          var action = el.getAttribute("data-action");
          if (action === "theme" && window.__toggleTheme) window.__toggleTheme();
          else if (action === "logout") {
            var f = document.createElement("form");
            f.method = "post"; f.action = "/logout"; document.body.appendChild(f); f.submit();
          } else if (href) location.href = href;
          close();
        }
        function open() {
          overlay.classList.add("open");
          input.value = "";
          items.forEach(function (el) { el.style.display = ""; });
          setActive(0);
          setTimeout(function () { input.focus(); }, 10);
        }
        function close() {
          overlay.classList.remove("open");
          input.blur();
        }
        if (trigger) trigger.addEventListener("click", open);
        document.addEventListener("keydown", function (e) {
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
            e.preventDefault();
            overlay.classList.contains("open") ? close() : open();
          } else if (overlay.classList.contains("open") && e.key === "Escape") {
            close();
          } else if (overlay.classList.contains("open")) {
            trapFocus(overlay, e);
          }
        });
        overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
        var emptyHint = document.getElementById("cmdkEmpty");
        input.addEventListener("input", function () {
          var q = input.value.trim().toLowerCase();
          items.forEach(function (el) {
            var text = el.textContent.toLowerCase();
            el.style.display = !q || text.indexOf(q) !== -1 ? "" : "none";
          });
          setActive(0);
          if (emptyHint) emptyHint.style.display = filtered().length === 0 && q ? "block" : "none";
        });
        input.addEventListener("keydown", function (e) {
          if (e.key === "ArrowDown") { e.preventDefault(); setActive(activeIdx + 1); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setActive(activeIdx - 1); }
          else if (e.key === "Enter") {
            e.preventDefault();
            var vis = filtered();
            var q = input.value.trim();
            if (vis.length === 0 && q) {
              location.href = "/search?q=" + encodeURIComponent(q);
              close();
            } else {
              runItem(vis[activeIdx]);
            }
          }
        });
        items.forEach(function (el) {
          el.addEventListener("click", function () { runItem(el); });
          el.addEventListener("mouseenter", function () {
            filtered().forEach(function (x) { x.classList.remove("active"); });
            el.classList.add("active");
          });
        });
      })();

      (function () {
        var fab = document.getElementById("chatFab");
        var panel = document.getElementById("chatPanel");
        var closeBtn = document.getElementById("chatClose");
        var form = document.getElementById("chatForm");
        var input = document.getElementById("chatInput");
        var body = document.getElementById("chatBody");
        if (!fab || !panel || !form || !input || !body) return;
        var history = [];

        function addMsg(role, text) {
          var div = document.createElement("div");
          div.className = "chat-msg " + role;
          div.textContent = text;
          body.appendChild(div);
          body.scrollTop = body.scrollHeight;
          return div;
        }
        fab.addEventListener("click", function () {
          panel.classList.toggle("open");
          if (panel.classList.contains("open")) setTimeout(function () { input.focus(); }, 10);
        });
        closeBtn.addEventListener("click", function () { panel.classList.remove("open"); input.blur(); });
        form.addEventListener("submit", function (e) {
          e.preventDefault();
          var msg = input.value.trim();
          if (!msg) return;
          addMsg("user", msg);
          history.push({ role: "user", text: msg });
          input.value = "";
          var thinking = addMsg("system", "考えています...");
          fetch("/assistant/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: msg, history: history }),
          })
            .then(function (r) { return r.json(); })
            .then(function (data) {
              thinking.remove();
              if (data.ok) {
                addMsg("ai", data.reply);
                history.push({ role: "ai", text: data.reply });
              } else {
                addMsg("system", data.message || "エラーが発生しました。");
              }
            })
            .catch(function () {
              thinking.remove();
              addMsg("system", "通信エラーが発生しました。");
            });
        });
      })();

      // 効果音(控えめ、既定オフ。Web Audio APIで合成するため音声ファイルは使わない)
      (function () {
        var btn = document.getElementById("soundToggle");
        var icon = document.getElementById("soundIcon");
        var label = document.getElementById("soundLabel");
        if (!btn) return;
        function enabled() {
          try { return localStorage.getItem("sound") === "on"; } catch (e) { return false; }
        }
        function render() {
          var on = enabled();
          if (icon) icon.textContent = on ? "🔊" : "🔇";
          if (label) label.textContent = on ? "効果音オン" : "効果音オフ";
        }
        render();
        btn.addEventListener("click", function () {
          try { localStorage.setItem("sound", enabled() ? "off" : "on"); } catch (e) {}
          render();
          window.__playChime && window.__playChime("toggle");
        });
        var ctx;
        window.__playChime = function (kind) {
          if (!enabled()) return;
          try {
            ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
            var notes = kind === "celebrate" ? [880, 1108, 1318] : kind === "toggle" ? [660] : [740, 988];
            notes.forEach(function (freq, i) {
              var osc = ctx.createOscillator();
              var gain = ctx.createGain();
              osc.type = "sine";
              osc.frequency.value = freq;
              var start = ctx.currentTime + i * 0.09;
              gain.gain.setValueAtTime(0.0001, start);
              gain.gain.exponentialRampToValueAtTime(0.12, start + 0.02);
              gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
              osc.connect(gain).connect(ctx.destination);
              osc.start(start);
              osc.stop(start + 0.4);
            });
          } catch (e) {}
        };
      })();

      // アクセントカラーパレット
      (function () {
        var buttons = Array.prototype.slice.call(document.querySelectorAll(".palette-swatch"));
        if (!buttons.length) return;
        function current() {
          try { return localStorage.getItem("palette") || "aurora"; } catch (e) { return "aurora"; }
        }
        function render() {
          var p = current();
          buttons.forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-palette") === p); });
        }
        render();
        buttons.forEach(function (b) {
          b.addEventListener("click", function () {
            var p = b.getAttribute("data-palette");
            try { localStorage.setItem("palette", p); } catch (e) {}
            if (p === "aurora") document.documentElement.removeAttribute("data-palette");
            else document.documentElement.setAttribute("data-palette", p);
            render();
          });
        });
      })();

      // 通知センター(ベル): アクティビティ履歴を取得して表示し、既読はlocalStorageで管理する
      (function () {
        var bell = document.getElementById("notifBell");
        var panel = document.getElementById("notifPanel");
        var dot = document.getElementById("notifDot");
        if (!bell || !panel || !dot) return;
        var lastSeenKey = "notif-last-seen";
        function lastSeen() {
          try { return Number(localStorage.getItem(lastSeenKey) || 0); } catch (e) { return 0; }
        }
        function render(entries) {
          if (!entries || entries.length === 0) {
            panel.innerHTML = '<div class="notif-empty">まだ通知はありません。</div>';
            return;
          }
          panel.innerHTML = entries.map(function (e) {
            var d = new Date(e.at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
            return '<div class="notif-item"><span class="notif-actor">' + e.actor + '</span>' + e.action +
              '<div>' + e.detail + '</div><div class="notif-meta">' + d + '</div></div>';
          }).join("");
          var seen = lastSeen();
          var unread = entries.filter(function (e) { return e.at > seen; }).length;
          if (unread > 0) { dot.style.display = "flex"; dot.textContent = String(Math.min(unread, 99)); }
          else dot.style.display = "none";
        }
        function load() {
          fetch("/notifications")
            .then(function (r) { return r.json(); })
            .then(function (data) { render(data.entries || []); })
            .catch(function () {});
        }
        bell.addEventListener("click", function () {
          var opening = !panel.classList.contains("open");
          panel.classList.toggle("open");
          bell.setAttribute("aria-expanded", opening ? "true" : "false");
          if (opening) {
            load();
            try { localStorage.setItem(lastSeenKey, String(Date.now())); } catch (e) {}
            setTimeout(function () { dot.style.display = "none"; }, 300);
          }
        });
        document.addEventListener("click", function (e) {
          if (!panel.contains(e.target) && e.target !== bell && !bell.contains(e.target)) {
            panel.classList.remove("open");
            bell.setAttribute("aria-expanded", "false");
          }
        });
        load();
      })();

      // ページ遷移の体感速度: リンク・フォーム送信時にトップの読み込みバーを表示する
      (function () {
        var bar = document.getElementById("topLoadBar");
        if (!bar) return;
        function start() {
          bar.classList.add("active");
          bar.style.width = "0%";
          requestAnimationFrame(function () { bar.style.width = "82%"; });
        }
        document.addEventListener("click", function (e) {
          var a = e.target.closest && e.target.closest("a[href]");
          if (!a) return;
          var href = a.getAttribute("href") || "";
          if (href.indexOf("/") === 0 && !a.target && !e.metaKey && !e.ctrlKey) start();
        });
        document.addEventListener("submit", function (e) {
          if (e.target && e.target.tagName === "FORM") start();
        });
        window.addEventListener("pageshow", function () {
          bar.style.width = "100%";
          setTimeout(function () { bar.classList.remove("active"); bar.style.width = "0%"; }, 200);
        });
      })();

      // キーボード操作: 一覧をJ/Kで移動、Enterで開く、?でヘルプ表示
      (function () {
        var overlay = document.getElementById("kbdHelpOverlay");
        var closeBtn = document.getElementById("kbdHelpClose");
        var rows = Array.prototype.slice.call(document.querySelectorAll("table.data tbody tr[data-href]"));
        var liveRegion = document.getElementById("kbdLiveRegion");
        var idx = -1;
        var lastFocused = null;
        function isEditing() {
          var el = document.activeElement;
          if (!el) return false;
          var tag = el.tagName;
          return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
        }
        function setIdx(n) {
          if (!rows.length) return;
          if (idx >= 0 && rows[idx]) rows[idx].classList.remove("kbd-active");
          idx = ((n % rows.length) + rows.length) % rows.length;
          rows[idx].classList.add("kbd-active");
          rows[idx].scrollIntoView({ block: "nearest" });
          if (liveRegion) {
            var label = rows[idx].getAttribute("data-row-label") || (idx + 1) + "行目";
            liveRegion.textContent = label + "を選択中(" + (idx + 1) + " / " + rows.length + "件)";
          }
        }
        function openHelp() {
          lastFocused = document.activeElement;
          overlay.classList.add("open");
          if (closeBtn) closeBtn.focus();
        }
        function closeHelp() {
          overlay.classList.remove("open");
          if (lastFocused && lastFocused.focus) lastFocused.focus();
        }
        document.addEventListener("keydown", function (e) {
          if (overlay.classList.contains("open")) {
            if (e.key === "Escape") { closeHelp(); return; }
            trapFocus(overlay, e);
            return;
          }
          if (isEditing()) return;
          if (e.key === "?") {
            openHelp();
          } else if (e.key === "j" || e.key === "J") {
            setIdx(idx + 1);
          } else if (e.key === "k" || e.key === "K") {
            setIdx(idx - 1);
          } else if (e.key === "Enter" && idx >= 0 && rows[idx]) {
            location.href = rows[idx].getAttribute("data-href");
          }
        });
        if (overlay) {
          overlay.addEventListener("click", function (e) { if (e.target === overlay) closeHelp(); });
        }
        if (closeBtn) closeBtn.addEventListener("click", closeHelp);
      })();

      // 達成を祝うマイクロインタラクション(承認待ちが0件になった瞬間)
      (function () {
        var container = document.getElementById("confettiContainer");
        if (!container) return;
        var colors = ["#2dd4ee", "#8b5cf6", "#34d399", "#fbbf24", "#fb7185"];
        window.__celebrate = function () {
          for (var i = 0; i < 24; i++) {
            var piece = document.createElement("div");
            piece.className = "confetti-piece";
            piece.style.left = Math.random() * 100 + "vw";
            piece.style.background = colors[i % colors.length];
            piece.style.animationDelay = Math.random() * 0.4 + "s";
            piece.style.transform = "rotate(" + Math.random() * 360 + "deg)";
            container.appendChild(piece);
            (function (p) { setTimeout(function () { p.remove(); }, 2400); })(piece);
          }
          window.__playChime && window.__playChime("celebrate");
        };
        // 既にホーム画面で0件だった場合、1日1回だけ祝う(毎回は鬱陶しいため)。
        // ただしエラーバナー表示中(取得失敗によるフォールバックの0件)は本当の0件ではないため祝わない。
        var zeroCard = document.querySelector('[data-live="pendingTotalCard"] .num');
        if (zeroCard && !document.querySelector(".banner.error")) {
          var today = new Date().toISOString().slice(0, 10);
          var flagKey = "celebrated-" + today;
          var already = false;
          try { already = sessionStorage.getItem(flagKey) === "1"; } catch (e) {}
          var n = parseInt(zeroCard.textContent, 10);
          if (n === 0 && !already) {
            try { sessionStorage.setItem(flagKey, "1"); } catch (e) {}
            setTimeout(function () { window.__celebrate(); }, 600);
          }
        }
      })();

      // ok系バナーが表示されたときの完了音
      (function () {
        if (document.querySelector(".banner.ok")) {
          window.__playChime && window.__playChime("ok");
        }
      })();

      (function () {
        var banner = document.getElementById("liveBanner");
        var badge = document.querySelector('[data-live="pendingTotalBadge"]');
        if (!banner) return;
        var prevPending = null;
        function isEditing() {
          var el = document.activeElement;
          if (!el) return false;
          var tag = el.tagName;
          return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
        }
        function updateBadge(counts) {
          if (!badge) return;
          if (counts.pendingTotal > 0) {
            badge.textContent = String(counts.pendingTotal);
            badge.style.display = "";
          } else {
            badge.style.display = "none";
          }
        }
        function connect() {
          try {
            var proto = location.protocol === "https:" ? "wss:" : "ws:";
            var ws = new WebSocket(proto + "//" + location.host + "/live/ws");
            ws.onmessage = function (ev) {
              try {
                var data = JSON.parse(ev.data);
                if (data.type === "counts") {
                  updateBadge(data);
                  if (prevPending !== null && prevPending > 0 && data.pendingTotal === 0 && window.__celebrate) {
                    window.__celebrate();
                  }
                  prevPending = data.pendingTotal;
                  if (!isEditing()) banner.classList.add("show");
                }
              } catch (e) {}
            };
            ws.onclose = function () { setTimeout(connect, 4000); };
            ws.onerror = function () { ws.close(); };
          } catch (e) {}
        }
        banner.addEventListener("click", function () {
          banner.classList.remove("show");
          location.reload();
        });
        connect();
      })();
    </script>
  `;
  return htmlShell(opts.title, body, nonce);
}

export function banner(message?: { type: "ok" | "error"; text: string }): string {
  if (!message) return "";
  return `<div class="banner ${message.type === "ok" ? "ok" : "error"}">${esc(message.text)}</div>`;
}
