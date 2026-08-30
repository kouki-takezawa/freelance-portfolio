import {
  DEPARTMENTS,
  ORDER_SERVICE_TYPES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type ActivityEntry,
  type Department,
  type Inquiry,
  type Order,
  type SidebarCounts,
  type SnsPost,
} from "./types";
import type { AnalyticsSummary } from "./analytics";
import type { TrashItem } from "./trash";
import { esc, formatYen, PUBLIC_SITE_URL } from "./util";
import { banner, htmlShell, shell } from "./shell";

export function loginPage(errorMessage: string | undefined, nonce: string): string {
  const body = `
    <div class="login-box">
      <h1>AI事業部 ログイン</h1>
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
  return htmlShell("ログイン", body, nonce);
}

type DeptStat = { count: number; href: string; detail?: string };

// AI社員の役職名から色相を決め、小さな発光オーブを添える(実行中は脈打つように光る)
function roleHue(role: string): number {
  let hash = 0;
  for (let i = 0; i < role.length; i++) hash = (hash * 31 + role.charCodeAt(i)) >>> 0;
  return hash % 360;
}
function roleAvatar(role: string, live: boolean): string {
  return `<span class="ai-avatar${live ? " ai-avatar-active" : ""}" style="--avatar-hue:${roleHue(role)}" aria-hidden="true"></span>`;
}

function deptBox(dept: Department, stat?: DeptStat, phaseCounts?: Record<string, number>): string {
  const phases = dept.phases
    .map((phase) => {
      const liveCount = phaseCounts?.[phase.name];
      const isLive = liveCount !== undefined && liveCount > 0;
      const live = isLive ? `<span class="org-phase-live">実行中 ${liveCount}件</span>` : "";
      return `
        <li class="${phase.requiresApproval ? "approval" : ""}">
          ${roleAvatar(phase.role, isLive)}<span class="org-phase-role">${esc(phase.role)}</span>${esc(phase.name)}${
            phase.requiresApproval ? " (社長承認)" : ""
          }${live}
        </li>
      `;
    })
    .join("");

  const external = stat?.href.startsWith("http");
  const nameInner = esc(dept.name);
  const name = stat
    ? `<a href="${stat.href}"${external ? ' target="_blank" rel="noreferrer"' : ""}>${nameInner}</a>`
    : nameInner;
  const badge =
    stat && stat.count > 0
      ? `<span class="org-badge" tabindex="0">${stat.count}${
          stat.detail
            ? `<span class="org-tooltip" role="tooltip">${esc(stat.detail)}</span>`
            : ""
        }</span>`
      : "";

  return `
    <div class="org-box">
      ${badge}
      <div class="org-name">${name}</div>
      <div class="org-mission">${esc(dept.mission)}</div>
      <ul class="org-phase-list">${phases}</ul>
    </div>
  `;
}

// 実データのしきい値だけで判断する「AI社員の日替わりひとこと」(数字を捏造しない)
function aiDailyComment(data: {
  unreadCount: number;
  overdueCount: number;
  snsDraftCount: number;
  unpaidCount: number;
  thisMonthRevenue: number;
}): { role: string; text: string } {
  const candidates: { role: string; text: string }[] = [];
  if (data.overdueCount > 0) {
    candidates.push({ role: "エンジニアAI", text: `納期超過の受注が${data.overdueCount}件あります。ご確認ください。` });
  }
  if (data.snsDraftCount > 0) {
    candidates.push({ role: "SNS運用AI", text: `SNS投稿案が${data.snsDraftCount}件、承認をお待ちしています。` });
  }
  if (data.unpaidCount > 0) {
    candidates.push({ role: "経理AI", text: `未入金の受注が${data.unpaidCount}件あります。入金確認をお願いします。` });
  }
  if (data.unreadCount > 0) {
    candidates.push({ role: "営業AI", text: `未読のお問い合わせが${data.unreadCount}件あります。` });
  }
  if (data.thisMonthRevenue > 0) {
    candidates.push({ role: "経理AI", text: `今月の確定売上は${formatYen(data.thisMonthRevenue)}です。` });
  }
  if (candidates.length === 0) {
    candidates.push({ role: "PM AI", text: "承認待ちは0件です。順調に進んでいます。" });
  }
  const dayIndex = Math.floor(Date.now() / 86400000);
  return candidates[dayIndex % candidates.length];
}

// データが空のときの共通デザイン(色だけに頼らないよう、アイコン+見出し+補足の3段構成にする)
function emptyState(icon: string, title: string, hint: string): string {
  return `
    <div class="empty-state">
      <div class="empty-icon">${icon}</div>
      <div class="empty-title">${esc(title)}</div>
      <div class="empty-hint">${esc(hint)}</div>
    </div>
  `;
}

const EMPTY_ICON_INBOX = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="100%" height="100%"><path d="M4 12h4l2 3h4l2-3h4"/><path d="M5 12 3.5 6.5A2 2 0 0 1 5.4 4h13.2a2 2 0 0 1 1.9 2.5L19 12"/><path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"/></svg>`;
const EMPTY_ICON_CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="100%" height="100%"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>`;
const EMPTY_ICON_TRASH = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="100%" height="100%"><path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></svg>`;
const EMPTY_ICON_CHART = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="100%" height="100%"><path d="M4 20V4"/><path d="M4 20h16"/><path d="M7 20v-6M12 20v-9M17 20v-4"/></svg>`;

// 一覧画面の一括操作バー(テーブル/リスト上部に固定表示、行チェックボックスは各ページで class="row-check" data-key="..." を付ける)
// selectAllId を渡すと、テーブル見出しに専用チェックボックスが無いカード型一覧向けに、バー自体に「すべて選択」を内蔵する
function bulkBar(actions: { id: string; label: string; danger?: boolean }[], selectAllId?: string): string {
  return `
    <div class="bulk-bar${selectAllId ? " bulk-bar-persistent" : ""}" id="bulkBar">
      <span class="bulk-count-group">
        ${selectAllId ? `<input type="checkbox" id="${esc(selectAllId)}" aria-label="すべて選択" />` : ""}
        <span id="bulkCount">0件選択中</span>
      </span>
      <div class="bulk-actions">
        ${actions
          .map(
            (a) =>
              `<button type="button" class="small" id="${esc(a.id)}"${a.danger ? ` style="color:var(--danger);border-color:var(--danger)"` : ""}>${esc(a.label)}</button>`
          )
          .join("")}
        <button type="button" class="small" id="bulkClearBtn">選択解除</button>
      </div>
    </div>
  `;
}

// bulkBarと対になるクライアントJS。同一ページ内に複数呼ばない(id重複)前提
function bulkActionsScript(opts: {
  selectAllId: string;
  actions: { id: string; endpoint: string; confirmText?: string }[];
  nonce: string;
}): string {
  return `
  <script nonce="${opts.nonce}">
    (function () {
      var checks = Array.prototype.slice.call(document.querySelectorAll(".row-check"));
      var selectAll = document.getElementById(${JSON.stringify(opts.selectAllId)});
      var bar = document.getElementById("bulkBar");
      var countEl = document.getElementById("bulkCount");
      function update() {
        var selected = checks.filter(function (c) { return c.checked; });
        if (bar) bar.classList.toggle("show", selected.length > 0);
        if (countEl) countEl.textContent = selected.length + "件選択中";
        if (selectAll) selectAll.checked = checks.length > 0 && selected.length === checks.length;
      }
      checks.forEach(function (c) { c.addEventListener("change", update); });
      if (selectAll) {
        selectAll.addEventListener("change", function () {
          checks.forEach(function (c) { c.checked = selectAll.checked; });
          update();
        });
      }
      var clearBtn = document.getElementById("bulkClearBtn");
      if (clearBtn) {
        clearBtn.addEventListener("click", function () {
          checks.forEach(function (c) { c.checked = false; });
          if (selectAll) selectAll.checked = false;
          update();
        });
      }
      ${opts.actions
        .map(
          (a) => `
      var btn_${a.id} = document.getElementById(${JSON.stringify(a.id)});
      if (btn_${a.id}) {
        btn_${a.id}.addEventListener("click", function () {
          var keys = checks.filter(function (c) { return c.checked; }).map(function (c) { return c.getAttribute("data-key"); });
          if (keys.length === 0) return;
          ${a.confirmText ? `if (!confirm(keys.length + ${JSON.stringify(a.confirmText)})) return;` : ""}
          fetch(${JSON.stringify(a.endpoint)}, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keys: keys }),
          }).then(function () { location.reload(); });
        });
      }`
        )
        .join("")}
      update();
    })();
  </script>
  `;
}

export function orgChartPage(data: {
  unreadCount: number;
  inquiriesCount: number;
  overdueCount: number;
  quotingCount: number;
  inProgressCount: number;
  deliveredCount: number;
  thisMonthRevenue: number;
  unpaidTotal: number;
  unpaidCount: number;
  worksCount: number;
  servicesCount: number;
  blogCount: number;
  snsDraftCount: number;
  snsPostedCount: number;
  todayPageviews: number;
  pendingTotal: number;
  message?: { type: "ok" | "error"; text: string };
  nonce: string;
}): string {
  const depts = DEPARTMENTS.filter((d) => d.code !== "kanri");
  const kanri = DEPARTMENTS.find((d) => d.code === "kanri")!;

  // count: バッジで表示する「要確認・要承認」件数。0件ならバッジは出さない。
  const deptStats: Partial<Record<Department["code"], DeptStat>> = {
    eigyo: {
      count: data.unreadCount,
      href: "/inquiries",
      detail: `未読のお問い合わせが${data.unreadCount}件あります`,
    },
    seisaku: {
      count: data.overdueCount,
      href: "/orders",
      detail: `納期を超過している受注が${data.overdueCount}件あります`,
    },
    marketing: { count: 0, href: `${PUBLIC_SITE_URL}/works` },
    sns: {
      count: data.snsDraftCount,
      href: "/sns",
      detail: `投稿の下書きが${data.snsDraftCount}件、投稿の承認待ちです`,
    },
    cs: { count: 0, href: "/orders" },
    somu: {
      count: data.unpaidCount,
      href: "/revenue",
      detail: `未入金の受注が${data.unpaidCount}件あります`,
    },
  };

  // 実データに基づく「いまこのフェーズに何件あるか」。追跡できないフェーズは表示しない(実在しない数字を作らない)。
  const deptPhaseCounts: Partial<Record<Department["code"], Record<string, number>>> = {
    eigyo: { "送信・フォローアップ": data.unreadCount },
    seisaku: { "要件定義": data.quotingCount, "納品・デプロイ": data.overdueCount },
    sns: { "投稿文・画像案作成": data.snsDraftCount, "投稿": data.snsDraftCount },
    somu: { "送付・記帳": data.unpaidCount },
  };

  const comment = aiDailyComment(data);

  const content = `
    <h1>AI事業部</h1>
    <p class="hint">会社の情報はすべてここに集約されています。各部門のカードから、その部門が扱っているデータへ直接移動できます。</p>
    ${banner(data.message)}

    <div class="ai-comment">
      ${roleAvatar(comment.role, false)}
      <div><span class="ai-comment-role">${esc(comment.role)}:</span>${esc(comment.text)}</div>
    </div>

    <h2 style="margin-top:28px">承認待ち</h2>
    <div class="card" style="max-width:360px" data-live="pendingTotalCard">
      <div class="num">${data.pendingTotal}<span style="font-size:14px;color:var(--text-faint)"> 件</span></div>
      <div class="label">社長の確認・承認待ち(合計)</div>
      <div style="margin-top:12px"><a href="/approvals" style="font-size:13px;font-weight:700">承認センターを開く →</a></div>
    </div>

    <h2 style="margin-top:36px">組織図</h2>
    <h3 style="margin-top:0;font-size:14px;font-weight:400;color:var(--text-faint)">AIが各部門を担当し、フェーズの最後は必ず社長の承認を経て実行します。部門カードはドラッグで並び替えできます</h3>
    <div class="org-legend">
      <span><span class="dot" style="background:var(--surface-2);border:1px solid var(--border)"></span>AIが自律的に進めるフェーズ</span>
      <span><span class="dot" style="background:var(--danger-soft)"></span>社長の承認が必要なフェーズ</span>
    </div>
    <div class="org-autofit" id="orgAutofit">
    <div class="org-chart" id="orgChart">
      <svg class="org-curves" aria-hidden="true">
        <defs>
          <linearGradient id="orgCurveGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#8b5cf6" />
            <stop offset="100%" stop-color="#2dd4ee" />
          </linearGradient>
        </defs>
      </svg>
      <div class="org-box ceo">
        <div class="org-name">社長（あなた）</div>
        <div class="org-role">最終承認者・全権限</div>
      </div>
      <div class="org-box kanri" style="margin-top:36px">
        <div class="org-name">${esc(kanri.name)}</div>
        <div class="org-role">${esc(kanri.mission)}</div>
        <ul class="org-phase-list" style="text-align:left">
          ${kanri.phases
            .map(
              (phase) =>
                `<li>${roleAvatar(phase.role, false)}<span class="org-phase-role">${esc(phase.role)}</span>${esc(phase.name)} — ${esc(phase.description)}</li>`
            )
            .join("")}
        </ul>
      </div>
      <div class="org-branches" id="orgBranches">
        ${depts.map((d) => `<div draggable="true" data-code="${d.code}">${deptBox(d, deptStats[d.code], deptPhaseCounts[d.code])}</div>`).join("")}
      </div>
    </div>
    </div>
    <script nonce="${data.nonce}">
      (function () {
        // ドラッグ&ドロップで部門カードの並び順を変更し、ブラウザに保存する(見る人ごとの好みなのでKVには保存しない)
        var branches = document.getElementById("orgBranches");
        if (branches) {
          var wrappers = Array.prototype.slice.call(branches.children);
          try {
            var saved = JSON.parse(localStorage.getItem("orgOrder") || "null");
            if (saved && saved.length) {
              saved.forEach(function (code) {
                var el = wrappers.filter(function (w) { return w.getAttribute("data-code") === code; })[0];
                if (el) branches.appendChild(el);
              });
            }
          } catch (e) {}
          var dragEl = null;
          branches.querySelectorAll(":scope > div").forEach(function (el) {
            el.addEventListener("dragstart", function () { dragEl = el; el.classList.add("dragging"); });
            el.addEventListener("dragend", function () {
              el.classList.remove("dragging");
              branches.querySelectorAll(".drag-over").forEach(function (x) { x.classList.remove("drag-over"); });
              try {
                var order = Array.prototype.slice.call(branches.children).map(function (w) { return w.getAttribute("data-code"); });
                localStorage.setItem("orgOrder", JSON.stringify(order));
              } catch (e) {}
              if (window.__redrawOrgChart) window.__redrawOrgChart();
            });
            el.addEventListener("dragover", function (e) {
              e.preventDefault();
              if (el !== dragEl) el.classList.add("drag-over");
            });
            el.addEventListener("dragleave", function () { el.classList.remove("drag-over"); });
            el.addEventListener("drop", function (e) {
              e.preventDefault();
              el.classList.remove("drag-over");
              if (!dragEl || dragEl === el) return;
              var children = Array.prototype.slice.call(branches.children);
              if (children.indexOf(dragEl) < children.indexOf(el)) branches.insertBefore(dragEl, el.nextSibling);
              else branches.insertBefore(dragEl, el);
            });
          });
        }

        var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var flowPaths = [];
        var animStarted = false;

        function draw() {
          var chart = document.getElementById("orgChart");
          var svg = chart && chart.querySelector(".org-curves");
          if (!chart || !svg) return;
          var ceo = chart.querySelector(".org-box.ceo");
          var kanri = chart.querySelector(".org-box.kanri");
          var deptBoxes = chart.querySelectorAll(".org-branches > div > .org-box");
          var chartRect = chart.getBoundingClientRect();
          var defs = svg.querySelector("defs");
          while (svg.lastChild) svg.removeChild(svg.lastChild);
          if (defs) svg.appendChild(defs);
          flowPaths = [];

          function pt(el, edge) {
            var r = el.getBoundingClientRect();
            return {
              x: r.left + r.width / 2 - chartRect.left,
              y: (edge === "top" ? r.top : r.bottom) - chartRect.top,
            };
          }
          function curve(p1, p2) {
            var midY = (p1.y + p2.y) / 2;
            var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute(
              "d",
              "M" + p1.x + "," + p1.y + " C" + p1.x + "," + midY + " " + p2.x + "," + midY + " " + p2.x + "," + p2.y
            );
            path.setAttribute("class", "org-curve-path");
            svg.appendChild(path);
            var dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            dot.setAttribute("cx", String(p2.x));
            dot.setAttribute("cy", String(p2.y));
            dot.setAttribute("r", "3.5");
            dot.setAttribute("class", "org-curve-dot");
            svg.appendChild(dot);

            if (!reduceMotion) {
              var flowDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
              flowDot.setAttribute("r", "2.6");
              flowDot.setAttribute("class", "org-flow-dot");
              svg.appendChild(flowDot);
              flowPaths.push({ path: path, dot: flowDot, offset: Math.random() });
            }
          }
          if (ceo && kanri) curve(pt(ceo, "bottom"), pt(kanri, "top"));
          if (kanri && deptBoxes.length) {
            var start = pt(kanri, "bottom");
            deptBoxes.forEach(function (box) {
              curve(start, pt(box, "top"));
            });
          }

          if (!reduceMotion && !animStarted) {
            animStarted = true;
            var SPEED_MS = 2600;
            function tick(ts) {
              flowPaths.forEach(function (f) {
                try {
                  var len = f.path.getTotalLength();
                  var t = ((ts / SPEED_MS + f.offset) % 1 + 1) % 1;
                  var p = f.path.getPointAtLength(t * len);
                  f.dot.setAttribute("cx", String(p.x));
                  f.dot.setAttribute("cy", String(p.y));
                } catch (e) {}
              });
              requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
          }
        }
        // 組織図セクション自体が画面の高さに収まりきらないときだけ、自動で縮小する。
        // ページ上部の見出しなどを含めた全体を1画面に収めようとすると常に大きく縮小することに
        // なってしまうため、「組織図までスクロールしたときに、その部分が画面に収まるか」で判断する
        // (スマホ幅ではカードが縦積みで長くなるため対象外にし、通常どおりスクロールに任せる)
        var autofit = document.getElementById("orgAutofit");
        function applyAutofit() {
          if (!autofit) return;
          autofit.style.transform = "";
          autofit.style.marginBottom = "";
          if (window.innerWidth <= 720) return;
          var naturalHeight = autofit.scrollHeight;
          var available = window.innerHeight - 32;
          var scale = available / naturalHeight;
          if (scale >= 0.999 || scale < 0.55) return;
          autofit.style.transform = "scale(" + scale + ")";
          autofit.style.marginBottom = (naturalHeight * scale - naturalHeight) + "px";
        }
        function refresh() {
          applyAutofit();
          draw();
        }
        window.__redrawOrgChart = refresh;
        refresh();
        window.addEventListener("resize", refresh);
        window.addEventListener("load", refresh);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
        setTimeout(refresh, 100);
      })();
    </script>
  `;
  return shell({
    title: "AI事業部",
    active: "org",
    unreadCount: data.unreadCount,
    overdueCount: data.overdueCount,
    pendingTotal: data.pendingTotal,
    wide: "full",
    content,
    nonce: data.nonce,
  });
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
}

function defaultReplyTemplate(name: string): string {
  return `${name} 様\n\nお問い合わせいただきありがとうございます。ヨリソイワークスです。\n\n\n\n---\nヨリソイワークス`;
}

export function inquiriesPage(data: {
  inquiries: Inquiry[];
  allTypes: string[];
  unreadCount: number;
  overdueCount?: number;
  pendingTotal?: number;
  currentFilter: { unreadOnly: boolean; type: string; q?: string };
  message?: { type: "ok" | "error"; text: string };
  nonce: string;
}): string {
  const { unreadOnly, type } = data.currentFilter;
  const q = data.currentFilter.q ?? "";
  const filterBar = `
    <div class="inquiry-filter-bar">
      <a href="/inquiries" class="filter-chip ${!unreadOnly && !type ? "active" : ""}">すべて</a>
      <a href="/inquiries?unread=1" class="filter-chip ${unreadOnly ? "active" : ""}">未読のみ</a>
      ${data.allTypes
        .map(
          (t) =>
            `<a href="/inquiries?type=${encodeURIComponent(t)}" class="filter-chip ${type === t ? "active" : ""}">${esc(t)}</a>`
        )
        .join("")}
    </div>
    <form method="get" action="/inquiries" class="list-toolbar">
      ${unreadOnly ? `<input type="hidden" name="unread" value="1" />` : ""}
      ${type ? `<input type="hidden" name="type" value="${esc(type)}" />` : ""}
      <input type="text" name="q" value="${esc(q)}" placeholder="名前・メール・本文で検索" />
      <button class="small" type="submit">検索</button>
      ${q ? `<a href="/inquiries" class="hint">クリア</a>` : ""}
    </form>
  `;

  const list =
    data.inquiries.length === 0
      ? unreadOnly || type || q
        ? emptyState(EMPTY_ICON_INBOX, "条件に一致するお問い合わせはありません", "検索条件を変えてお試しください。")
        : emptyState(EMPTY_ICON_INBOX, "まだお問い合わせはありません", "公開サイトのフォームから届くと、ここに表示されます。")
      : data.inquiries
          .map(
            (inq) => `
        <div class="inquiry-card ${inq.read ? "" : "unread"}">
          <div class="inquiry-meta">
            <input type="checkbox" class="row-check" data-key="${esc(inq.key)}" aria-label="${esc(inq.name)}を選択" />
            <span>${formatDate(inq.receivedAt)}</span>
            <span>${esc(inq.inquiryType)}</span>
            ${inq.budget ? `<span>予算: ${esc(inq.budget)}</span>` : ""}
            ${inq.read ? "" : `<span style="color:var(--danger);font-weight:700">未読</span>`}
          </div>
          <div class="inquiry-thread">
            <div class="thread-msg from-customer">
              <div class="thread-msg-head">${esc(inq.name)} &lt;${esc(inq.email)}&gt;</div>
              <div class="thread-msg-body">${esc(inq.message)}</div>
            </div>
            ${(inq.replies ?? [])
              .map(
                (r) => `
              <div class="thread-msg from-owner">
                <div class="thread-msg-head">あなたの返信・${formatDate(r.sentAt)}</div>
                <div class="thread-msg-body">${esc(r.message)}</div>
              </div>
            `
              )
              .join("")}
          </div>
          <details class="inquiry-reply-toggle" ${inq.replies && inq.replies.length > 0 ? "" : "open"}>
            <summary>返信する</summary>
            <form method="post" action="/inquiries/${encodeURIComponent(inq.key)}/reply" class="inquiry-reply-form">
              <textarea name="message" rows="6">${esc(defaultReplyTemplate(inq.name))}</textarea>
              <button class="small" type="submit">返信を送信</button>
            </form>
          </details>
          <div class="inquiry-actions">
            <a href="/orders/new?fromInquiry=${encodeURIComponent(inq.key)}" class="small" style="text-decoration:none;display:inline-block;padding:5px 14px;border:1px solid var(--accent);border-radius:999px;color:var(--accent);font-size:12px;font-weight:700">この内容で受注を作成</a>
            <form method="post" action="/inquiries/${encodeURIComponent(inq.key)}/toggle-read">
              <button class="small" type="submit">${inq.read ? "未読にする" : "既読にする"}</button>
            </form>
            <form method="post" action="/inquiries/${encodeURIComponent(inq.key)}/delete" data-confirm="この問い合わせを削除しますか？">
              <button class="small" type="submit" style="color:var(--danger);border-color:var(--danger)">削除</button>
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
    ${filterBar}
    ${data.inquiries.length > 0 ? bulkBar([{ id: "bulkReadBtn", label: "既読にする" }, { id: "bulkDeleteBtn", label: "削除", danger: true }], "selectAllInquiries") : ""}
    ${list}
    ${
      data.inquiries.length > 0
        ? bulkActionsScript({
            selectAllId: "selectAllInquiries",
            actions: [
              { id: "bulkReadBtn", endpoint: "/inquiries/bulk-read" },
              { id: "bulkDeleteBtn", endpoint: "/inquiries/bulk-delete", confirmText: "件のお問い合わせを削除します。よろしいですか？" },
            ],
            nonce: data.nonce,
          })
        : ""
    }
  `;
  return shell({
    title: "お問い合わせ",
    active: "inquiries",
    unreadCount: data.unreadCount,
    overdueCount: data.overdueCount,
    pendingTotal: data.pendingTotal,
    content,
    nonce: data.nonce,
  });
}

const SNS_PLATFORM_COLOR: Record<string, string> = {
  // 白文字を乗せるバッジ色のため、いずれもコントラスト比4.5:1以上を確保した濃色にしている
  note: "#0b7d6c",
  Threads: "#171923",
  Instagram: "#c13584",
};

const SNS_PLATFORM_ICON: Record<string, string> = {
  note: `<svg class="sns-icon" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="16" font-size="12" text-anchor="middle" fill="currentColor">n</text></svg>`,
  Threads: `<svg class="sns-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a9 9 0 1 0 9 9c0-3-1.5-5-4-5.5"/><path d="M9 12c0-3 1.5-4.5 4-4.5s3.5 1.5 3.5 3.5c0 3-2 3.5-3.5 5"/></svg>`,
  Instagram: `<svg class="sns-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>`,
};

export function snsPage(data: {
  posts: SnsPost[];
  unreadCount: number;
  overdueCount: number;
  pendingTotal?: number;
  message?: { type: "ok" | "error"; text: string };
  nonce: string;
}): string {
  const drafts = data.posts.filter((p) => p.status === "draft");
  const posted = data.posts.filter((p) => p.status === "posted");

  const postCard = (post: SnsPost) => `
    <div class="inquiry-card">
      <div class="inquiry-meta">
        <input type="checkbox" class="row-check" data-key="${esc(post.key)}" aria-label="${esc(post.caption)}を選択" />
        <span class="status-pill" style="background:${SNS_PLATFORM_COLOR[post.platform] ?? "#4b5670"};color:#fff">${SNS_PLATFORM_ICON[post.platform] ?? ""}${esc(post.platform)}</span>
        <span>${formatDate(post.createdAt)}</span>
      </div>
      <div class="inquiry-thread">
        <div class="thread-msg from-customer" style="max-width:100%">
          <div class="thread-msg-head">${esc(post.caption)}</div>
          <div class="thread-msg-body">${esc(post.body)}</div>
        </div>
      </div>
      <div class="inquiry-actions">
        ${
          post.status === "draft"
            ? `<form method="post" action="/sns/${encodeURIComponent(post.key)}/posted">
                <button class="small" type="submit">投稿済みにする</button>
              </form>`
            : ""
        }
        <form method="post" action="/sns/${encodeURIComponent(post.key)}/delete" data-confirm="この投稿案を削除しますか？">
          <button class="small" type="submit" style="color:var(--danger);border-color:var(--danger)">削除</button>
        </form>
      </div>
    </div>
  `;

  const content = `
    <h1>SNS投稿</h1>
    <h2>note・Threads・Instagramの投稿案です。AIが下書きし、投稿は社長の承認を経て実施します</h2>
    ${banner(data.message)}
    ${data.posts.length > 0 ? bulkBar([{ id: "bulkPostedBtn", label: "投稿済みにする" }, { id: "bulkDeleteBtn", label: "削除", danger: true }], "selectAllSns") : ""}
    <h2 style="margin-top:28px">下書き(${drafts.length})</h2>
    ${drafts.length === 0 ? emptyState(EMPTY_ICON_CHECK, "下書きはありません", "SNS運用AIが新しい投稿案を考えると、ここに表示されます。") : drafts.map(postCard).join("")}
    <h2 style="margin-top:32px">投稿済み(${posted.length})</h2>
    ${posted.length === 0 ? emptyState(EMPTY_ICON_INBOX, "まだ投稿済みのものはありません", "下書きを承認すると、ここに移動します。") : posted.map(postCard).join("")}
    ${
      data.posts.length > 0
        ? bulkActionsScript({
            selectAllId: "selectAllSns",
            actions: [
              { id: "bulkPostedBtn", endpoint: "/sns/bulk-posted" },
              { id: "bulkDeleteBtn", endpoint: "/sns/bulk-delete", confirmText: "件の投稿案を削除します。よろしいですか？" },
            ],
            nonce: data.nonce,
          })
        : ""
    }
  `;
  return shell({
    title: "SNS投稿",
    active: "sns",
    unreadCount: data.unreadCount,
    overdueCount: data.overdueCount,
    pendingTotal: data.pendingTotal,
    content,
    nonce: data.nonce,
  });
}

export function trashPage(data: {
  items: TrashItem[];
  unreadCount: number;
  overdueCount?: number;
  pendingTotal?: number;
  message?: { type: "ok" | "error"; text: string };
  nonce: string;
}): string {
  const list =
    data.items.length === 0
      ? emptyState(EMPTY_ICON_TRASH, "ゴミ箱は空です", "削除したお問い合わせ・受注は30日間ここに残ります。")
      : data.items
          .map(
            (item) => `
        <div class="inquiry-card">
          <div class="inquiry-meta">
            <span>${item.kind === "inquiry" ? "お問い合わせ" : "受注"}</span>
            <span>削除日時: ${formatDate(item.deletedAt)}</span>
          </div>
          <div><strong>${esc(item.summary)}</strong></div>
          <div class="inquiry-actions">
            <form method="post" action="/trash/${encodeURIComponent(item.key)}/restore">
              <button class="small" type="submit">元に戻す</button>
            </form>
            <form method="post" action="/trash/${encodeURIComponent(item.key)}/purge" data-confirm="完全に削除します。元に戻せません。よろしいですか？">
              <button class="small" type="submit" style="color:var(--danger);border-color:var(--danger)">完全に削除</button>
            </form>
          </div>
        </div>
      `
          )
          .join("");

  const content = `
    <h1>ゴミ箱</h1>
    <h2>削除したお問い合わせ・受注データです。30日間はここに残り、その後自動的に完全削除されます</h2>
    ${banner(data.message)}
    ${list}
  `;
  return shell({
    title: "ゴミ箱",
    active: "trash",
    unreadCount: data.unreadCount,
    overdueCount: data.overdueCount,
    pendingTotal: data.pendingTotal,
    content,
    nonce: data.nonce,
  });
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

const ORDER_SORT_FIELDS: Record<string, (o: Order) => string | number> = {
  dueDate: (o) => o.dueDate || "9999-99",
  orderDate: (o) => o.orderDate || "9999-99",
  amount: (o) => o.amount,
  clientName: (o) => o.clientName,
};
const ORDER_SORT_LABELS: Record<string, string> = {
  dueDate: "納期",
  orderDate: "受注日",
  amount: "金額",
  clientName: "クライアント名",
};

export function ordersListPage(data: {
  orders: Order[];
  unreadCount: number;
  overdueCount: number;
  pendingTotal?: number;
  currentFilter?: { q: string; sort: string; dir: "asc" | "desc" };
  selectedOrder?: Order;
  message?: { type: "ok" | "error"; text: string };
  nonce: string;
}): string {
  const filter = data.currentFilter ?? { q: "", sort: "dueDate", dir: "asc" as const };
  const sortKey = ORDER_SORT_FIELDS[filter.sort] ? filter.sort : "dueDate";
  const dirMul = filter.dir === "desc" ? -1 : 1;
  const getKey = ORDER_SORT_FIELDS[sortKey];
  const sorted = [...data.orders].sort((a, b) => {
    const av = getKey(a);
    const bv = getKey(b);
    if (av < bv) return -1 * dirMul;
    if (av > bv) return 1 * dirMul;
    return 0;
  });

  const toolbar = `
    <form method="get" action="/orders" class="list-toolbar">
      <input type="text" name="q" value="${esc(filter.q)}" placeholder="クライアント名・メモで検索" />
      <select name="sort">
        ${Object.entries(ORDER_SORT_LABELS)
          .map(([key, label]) => `<option value="${key}" ${key === sortKey ? "selected" : ""}>${esc(label)}順</option>`)
          .join("")}
      </select>
      <select name="dir">
        <option value="asc" ${filter.dir === "asc" ? "selected" : ""}>昇順</option>
        <option value="desc" ${filter.dir === "desc" ? "selected" : ""}>降順</option>
      </select>
      <button class="small" type="submit">絞り込み</button>
      ${filter.q ? `<a href="/orders" class="hint">クリア</a>` : ""}
    </form>
  `;

  function selectHref(o: Order): string {
    const params = new URLSearchParams();
    if (filter.q) params.set("q", filter.q);
    if (filter.sort !== "dueDate") params.set("sort", filter.sort);
    if (filter.dir !== "asc") params.set("dir", filter.dir);
    params.set("selected", o.key);
    return `/orders?${params.toString()}`;
  }

  const rows =
    sorted.length === 0
      ? `<tr><td colspan="9" style="white-space:normal">${emptyState(EMPTY_ICON_INBOX, "まだ受注データがありません", "「新規追加」から登録してください。")}</td></tr>`
      : sorted
          .map((o) => {
            const overdue = isOverdue(o);
            const selected = data.selectedOrder?.key === o.key;
            return `
        <tr data-href="${esc(selectHref(o))}" data-row-label="${esc(o.clientName)}(${esc(o.serviceType)})" class="${selected ? "row-selected" : ""}">
          <td class="check-cell" data-label=""><input type="checkbox" class="row-check" data-key="${esc(o.key)}" aria-label="${esc(o.clientName)}を選択" /></td>
          <td data-label="クライアント">${esc(o.clientName)}</td>
          <td data-label="サービス">${esc(o.serviceType)}</td>
          <td data-label="金額">${formatYen(o.amount)}</td>
          <td data-label="受注日">${esc(o.orderDate)}</td>
          <td data-label="納期" class="${overdue ? "overdue" : ""}">${esc(o.dueDate)}${overdue ? " (超過)" : ""}</td>
          <td data-label="進捗"><span class="status-pill status-${esc(o.status)}">${esc(o.status)}</span></td>
          <td data-label="入金"><span class="status-pill status-${esc(o.paymentStatus)}">${esc(o.paymentStatus)}</span></td>
          <td class="actions">
            <a href="${esc(selectHref(o))}" class="small" style="text-decoration:none;display:inline-block;padding:5px 14px;border:1px solid var(--accent);border-radius:999px;color:var(--accent);font-size:12px;font-weight:700">開く</a>
            <form method="post" action="/orders/${encodeURIComponent(o.key)}/delete" data-confirm="この受注を削除しますか？">
              <button class="small" type="submit" style="color:var(--danger);border-color:var(--danger)">削除</button>
            </form>
          </td>
        </tr>
      `;
          })
          .join("");

  const detailPane = data.selectedOrder
    ? `
      <div class="detail-pane">
        <h2>
          ${esc(data.selectedOrder.clientName)}を編集
          <a href="/orders" class="close-detail">✕ 閉じる</a>
        </h2>
        ${orderFormFields({
          order: data.selectedOrder,
          cancelHref: "/orders",
          formId: "detailOrderForm",
          nonce: data.nonce,
        })}
      </div>
    `
    : "";

  const content = `
    <h1>受注管理</h1>
    <h2>LPなど外部で受けた案件の納期・金額・進捗を管理します。行をクリックすると右側で編集できます</h2>
    ${banner(data.message)}
    <div class="add-bar">
      <a href="/orders/new" class="primary" style="text-decoration:none;display:inline-block;border-radius:999px;padding:10px 28px;font-size:14px;font-weight:700;background:linear-gradient(135deg,var(--accent),var(--accent-2));color:var(--accent-contrast)">+ 新規受注を追加</a>
      <a href="/orders/export.csv" class="small" style="text-decoration:none;display:inline-block;padding:9px 20px;border:1px solid var(--border);border-radius:999px;color:var(--text-soft);font-size:13px;font-weight:700;margin-left:10px">CSVダウンロード</a>
    </div>
    <div class="master-detail${data.selectedOrder ? " has-detail" : ""}">
      <div>
        ${toolbar}
        <div class="table-wrap">
          ${sorted.length > 0 ? bulkBar([{ id: "bulkDeleteBtn", label: "選択した受注を削除", danger: true }]) : ""}
          <table class="data">
            <thead>
              <tr>
                <th class="check-cell"><input type="checkbox" id="selectAllOrders" aria-label="すべて選択" /></th>
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
      </div>
      ${detailPane}
    </div>
    <script nonce="${data.nonce}">
      document.querySelectorAll("table.data tbody tr[data-href]").forEach(function (tr) {
        tr.addEventListener("click", function (e) {
          if (e.target.closest("a, button, form, input")) return;
          location.href = tr.getAttribute("data-href");
        });
      });
    </script>
    ${bulkActionsScript({
      selectAllId: "selectAllOrders",
      actions: [{ id: "bulkDeleteBtn", endpoint: "/orders/bulk-delete", confirmText: "件の受注を削除します。よろしいですか？" }],
      nonce: data.nonce,
    })}
  `;
  return shell({
    title: "受注管理",
    active: "orders",
    unreadCount: data.unreadCount,
    overdueCount: data.overdueCount,
    pendingTotal: data.pendingTotal,
    wide: true,
    content,
    nonce: data.nonce,
  });
}

// 受注フォームの中身(受注管理ページのマスター/ディテール表示と、専用ページの両方から使う)
function orderFormFields(opts: {
  order?: Order;
  prefill?: Partial<Order>;
  cancelHref: string;
  formId: string;
  nonce: string;
}): string {
  const o = opts.order ?? opts.prefill;
  const action = opts.order ? `/orders/${encodeURIComponent(opts.order.key)}` : "/orders";
  const idp = opts.formId + "-";

  return `
    <form method="post" action="${action}" id="${opts.formId}">
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
            <input type="text" inputmode="numeric" name="amount" id="${idp}amount" value="${o?.amount ? esc(o.amount) : ""}" placeholder="150000" />
            <span class="field-error" id="${idp}err-amount">半角数字で、0より大きい金額を入力してください</span>
          </div>
        </div>

        <div class="field-row">
          <div>
            <label>受注日</label>
            <input type="text" name="orderDate" id="${idp}orderDate" value="${esc(o?.orderDate)}" placeholder="2026-08-25" />
            <span class="field-error" id="${idp}err-orderDate">YYYY-MM-DD形式で入力してください</span>
          </div>
          <div>
            <label>納期</label>
            <input type="text" name="dueDate" id="${idp}dueDate" value="${esc(o?.dueDate)}" placeholder="2026-09-30" />
            <span class="field-error" id="${idp}err-dueDate">YYYY-MM-DD形式・受注日以降の日付にしてください</span>
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
        <input type="text" name="paidDate" id="${idp}paidDate" value="${esc(o?.paidDate)}" placeholder="2026-09-15" />
        <span class="field-error" id="${idp}err-paidDate">YYYY-MM-DD形式で入力してください</span>

        <label>メモ</label>
        <textarea name="notes">${esc(o?.notes)}</textarea>
      </fieldset>
      <div class="save-bar">
        <button class="primary" type="submit">保存する</button>
        <a href="${opts.cancelHref}" style="margin-left:12px;font-size:13px;color:var(--text-faint)">キャンセルして戻る</a>
      </div>
    </form>
    <script nonce="${opts.nonce}">
      (function () {
        var idp = ${JSON.stringify(idp)};
        var dateRe = /^\\d{4}-\\d{2}-\\d{2}$/;
        var amount = document.getElementById(idp + "amount");
        var orderDate = document.getElementById(idp + "orderDate");
        var dueDate = document.getElementById(idp + "dueDate");
        var paidDate = document.getElementById(idp + "paidDate");

        function setState(input, errId, ok, dirty) {
          var err = document.getElementById(errId);
          if (!dirty) { input.classList.remove("invalid", "valid-ok"); if (err) err.classList.remove("show"); return; }
          input.classList.toggle("invalid", !ok);
          input.classList.toggle("valid-ok", ok);
          if (err) err.classList.toggle("show", !ok);
        }
        function checkAmount() {
          var v = amount.value.trim();
          var ok = v === "" || (/^[0-9]+$/.test(v) && Number(v) > 0);
          setState(amount, idp + "err-amount", ok, v !== "");
        }
        function checkDate(input, errId, allowEmpty) {
          var v = input.value.trim();
          var ok = (allowEmpty && v === "") || dateRe.test(v);
          setState(input, errId, ok, v !== "");
          return ok && v !== "";
        }
        function checkDueAfterOrder() {
          var okOrder = checkDate(orderDate, idp + "err-orderDate", true);
          var okDue = checkDate(dueDate, idp + "err-dueDate", true);
          if (okOrder && okDue && dueDate.value.trim() < orderDate.value.trim()) {
            setState(dueDate, idp + "err-dueDate", false, true);
          }
        }
        if (amount) amount.addEventListener("input", checkAmount);
        if (orderDate) orderDate.addEventListener("input", checkDueAfterOrder);
        if (dueDate) dueDate.addEventListener("input", checkDueAfterOrder);
        if (paidDate) paidDate.addEventListener("input", function () { checkDate(paidDate, idp + "err-paidDate", true); });
      })();
    </script>
  `;
}

export function orderFormPage(data: {
  order?: Order;
  prefill?: Partial<Order>;
  unreadCount: number;
  overdueCount: number;
  pendingTotal?: number;
  message?: { type: "ok" | "error"; text: string };
  nonce: string;
}): string {
  const isEdit = Boolean(data.order);

  const content = `
    <div class="form-narrow">
      <h1>${isEdit ? "受注を編集" : "受注を新規追加"}</h1>
      <h2>LINEなど外部で受けたご依頼の情報を入力してください</h2>
      ${banner(data.message)}
      ${orderFormFields({ order: data.order, prefill: data.prefill, cancelHref: "/orders", formId: "orderForm", nonce: data.nonce })}
    </div>
  `;
  return shell({
    title: isEdit ? "受注を編集" : "受注を新規追加",
    active: "orders",
    unreadCount: data.unreadCount,
    overdueCount: data.overdueCount,
    pendingTotal: data.pendingTotal,
    content,
    nonce: data.nonce,
  });
}

function monthlyRevenueBarChart(monthly: { month: string; total: number; count: number }[]): string {
  if (monthly.length === 0) {
    return `<div class="table-wrap">${emptyState(EMPTY_ICON_CHART, "まだ確定売上がありません", "受注を「入金済み」にすると、ここにグラフが表示されます。")}</div>`;
  }
  const asc = [...monthly].sort((a, b) => a.month.localeCompare(b.month)).slice(-12);

  const width = 700;
  const height = 200;
  const paddingBottom = 28;
  const paddingTop = 16;
  const chartHeight = height - paddingBottom - paddingTop;
  const max = Math.max(1, ...asc.map((m) => m.total));
  const barGap = 8;
  const barWidth = (width - barGap * (asc.length - 1)) / asc.length;

  const bars = asc
    .map((m, i) => {
      const barHeight = Math.max(Math.round((m.total / max) * chartHeight), m.total > 0 ? 2 : 0);
      const x = i * (barWidth + barGap);
      const y = paddingTop + (chartHeight - barHeight);
      const label = m.month.slice(2).replace("-", "/");
      return `
        <rect x="${x.toFixed(1)}" y="${y}" width="${barWidth.toFixed(1)}" height="${barHeight}" rx="4" fill="url(#revBarGradient)">
          <title>${esc(m.month)}: ${formatYen(m.total)}(${m.count}件)</title>
        </rect>
        <text x="${(x + barWidth / 2).toFixed(1)}" y="${height - 8}" font-size="10" fill="var(--text-faint)" text-anchor="middle">${esc(label)}</text>
      `;
    })
    .join("");

  return `
    <div class="table-wrap" style="padding:16px 20px">
      <svg viewBox="0 0 ${width} ${height}" style="width:100%; height:auto; max-height:220px; display:block" role="img" aria-label="月別確定売上の推移">
        <defs>
          <linearGradient id="revBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--accent-2)" />
            <stop offset="100%" stop-color="var(--accent)" />
          </linearGradient>
        </defs>
        ${bars}
      </svg>
    </div>
  `;
}

export function revenuePage(data: {
  unreadCount: number;
  overdueCount: number;
  pendingTotal?: number;
  thisMonthRevenue: number;
  yearToDateRevenue: number;
  unpaidTotal: number;
  pipelineTotal: number;
  monthly: { month: string; total: number; count: number }[];
  message?: { type: "ok" | "error"; text: string };
  nonce: string;
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
    ${banner(data.message)}

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
    ${monthlyRevenueBarChart(data.monthly)}
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
    pendingTotal: data.pendingTotal,
    content,
    nonce: data.nonce,
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
        <rect x="${x.toFixed(1)}" y="${y}" width="${barWidth.toFixed(1)}" height="${barHeight}" rx="3" fill="var(--accent)">
          <title>${esc(d.date)}: ${d.count}件</title>
        </rect>
        ${
          d.count > 0
            ? `<text x="${(x + barWidth / 2).toFixed(1)}" y="${y - 4}" font-size="10" fill="var(--text-soft)" text-anchor="middle" font-weight="700">${d.count}</text>`
            : ""
        }
        <text x="${(x + barWidth / 2).toFixed(1)}" y="${height - 8}" font-size="9" fill="var(--text-faint)" text-anchor="middle">${esc(label)}</text>
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
  pendingTotal?: number;
  nonce: string;
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
    pendingTotal: data.pendingTotal,
    content,
    nonce: data.nonce,
  });
}

export function approvalsPage(data: SidebarCounts & {
  unreadInquiries: Inquiry[];
  overdueOrders: Order[];
  snsDrafts: SnsPost[];
  unpaidOrders: Order[];
  message?: { type: "ok" | "error"; text: string };
  nonce: string;
}): string {
  const section = (
    title: string,
    count: number,
    items: string,
    emptyText: string
  ) => `
    <div class="approval-section">
      <h2>${esc(title)} ${count > 0 ? `<span class="count-chip">${count}</span>` : ""}</h2>
      ${count === 0 ? `<p class="approval-empty">${esc(emptyText)}</p>` : items}
    </div>
  `;

  const inquiryItems = data.unreadInquiries
    .map(
      (inq) => `
      <div class="approval-item">
        <div>
          <div class="approval-title">${esc(inq.name)}様(${esc(inq.inquiryType)})</div>
          <div class="approval-detail">${formatDate(inq.receivedAt)}・${esc(inq.message.slice(0, 60))}${inq.message.length > 60 ? "…" : ""}</div>
        </div>
        <div class="approval-actions">
          <a href="/inquiries" class="small" style="text-decoration:none;display:inline-block;padding:5px 14px;border:1px solid var(--accent);border-radius:999px;color:var(--accent);font-size:12px;font-weight:700">確認して返信</a>
        </div>
      </div>
    `
    )
    .join("");

  const overdueItems = data.overdueOrders
    .map(
      (o) => `
      <div class="approval-item">
        <div>
          <div class="approval-title">${esc(o.clientName)}(${esc(o.serviceType)})</div>
          <div class="approval-detail overdue">納期: ${esc(o.dueDate)}(超過)・${formatYen(o.amount)}</div>
        </div>
        <div class="approval-actions">
          <a href="/orders/${encodeURIComponent(o.key)}/edit" class="small" style="text-decoration:none;display:inline-block;padding:5px 14px;border:1px solid var(--accent);border-radius:999px;color:var(--accent);font-size:12px;font-weight:700">対応する</a>
        </div>
      </div>
    `
    )
    .join("");

  const snsItems = data.snsDrafts
    .map(
      (p) => `
      <div class="approval-item">
        <div>
          <div class="approval-title">${SNS_PLATFORM_ICON[p.platform] ?? ""}[${esc(p.platform)}] ${esc(p.caption)}</div>
          <div class="approval-detail">${formatDate(p.createdAt)}</div>
        </div>
        <div class="approval-actions">
          <form method="post" action="/sns/${encodeURIComponent(p.key)}/posted?return=%2Fapprovals">
            <button class="small" type="submit">投稿済みにする</button>
          </form>
          <a href="/sns" class="small" style="text-decoration:none;display:inline-block;padding:5px 14px;border:1px solid var(--border);border-radius:999px;color:var(--text-soft);font-size:12px;font-weight:700">内容を確認</a>
        </div>
      </div>
    `
    )
    .join("");

  const unpaidItems = data.unpaidOrders
    .map(
      (o) => `
      <div class="approval-item">
        <div>
          <div class="approval-title">${esc(o.clientName)}(${esc(o.serviceType)})</div>
          <div class="approval-detail">未入金・${formatYen(o.amount)}</div>
        </div>
        <div class="approval-actions">
          <a href="/orders/${encodeURIComponent(o.key)}/edit" class="small" style="text-decoration:none;display:inline-block;padding:5px 14px;border:1px solid var(--accent);border-radius:999px;color:var(--accent);font-size:12px;font-weight:700">入金確認・記帳</a>
        </div>
      </div>
    `
    )
    .join("");

  const content = `
    <h1>承認センター</h1>
    <p class="hint">各部門の承認待ちを1画面に集約しています。合計 <strong>${data.pendingTotal}件</strong> あります。</p>
    ${banner(data.message)}
    ${section("お問い合わせ・未読", data.unreadInquiries.length, inquiryItems, "未読のお問い合わせはありません。")}
    ${section("受注・納期超過", data.overdueOrders.length, overdueItems, "納期超過の受注はありません。")}
    ${section("SNS投稿・承認待ち", data.snsDrafts.length, snsItems, "承認待ちのSNS投稿案はありません。")}
    ${section("経理・未入金", data.unpaidOrders.length, unpaidItems, "未入金の受注はありません。")}
  `;
  return shell({
    title: "承認センター",
    active: "approvals",
    unreadCount: data.unreadCount,
    overdueCount: data.overdueCount,
    pendingTotal: data.pendingTotal,
    wide: true,
    content,
    nonce: data.nonce,
  });
}

export function activityPage(
  data: SidebarCounts & {
    entries: ActivityEntry[];
    message?: { type: "ok" | "error"; text: string };
    nonce: string;
  }
): string {
  const items =
    data.entries.length === 0
      ? emptyState(EMPTY_ICON_CHECK, "まだ記録がありません", "承認・返信・更新などの操作を行うと、ここに履歴が残ります。")
      : `<div class="timeline">${data.entries
          .map(
            (e) => `
        <div class="timeline-item">
          <div class="timeline-meta">${formatDate(e.at)}</div>
          <div class="timeline-action"><span class="timeline-actor">${esc(e.actor)}</span>${esc(e.action)}</div>
          <div class="timeline-detail">${esc(e.detail)}</div>
        </div>
      `
          )
          .join("")}</div>`;

  const content = `
    <h1>アクティビティ</h1>
    <h2>AI社員・社長の操作履歴です(直近90日間)</h2>
    ${banner(data.message)}
    ${items}
  `;
  return shell({
    title: "アクティビティ",
    active: "activity",
    unreadCount: data.unreadCount,
    overdueCount: data.overdueCount,
    pendingTotal: data.pendingTotal,
    content,
    nonce: data.nonce,
  });
}

// クライアント名(受注のclientName・お問い合わせのname)が一致するもの同士を、
// 同じクライアントとして扱う(社内に顧客IDの仕組みがないための簡易な突き合わせ)
export function clientsListPage(
  data: SidebarCounts & {
    clients: { name: string; orderCount: number; inquiryCount: number; lastActivity: number }[];
    message?: { type: "ok" | "error"; text: string };
    nonce: string;
  }
): string {
  const sorted = [...data.clients].sort((a, b) => b.lastActivity - a.lastActivity);
  const items =
    sorted.length === 0
      ? emptyState(EMPTY_ICON_INBOX, "まだクライアントがいません", "受注やお問い合わせが登録されると、ここに一覧が表示されます。")
      : sorted
          .map(
            (c) => `
      <a class="client-list-item" href="/clients/${encodeURIComponent(c.name)}">
        <div>
          <div class="client-name">${esc(c.name)}</div>
          <div class="client-meta">受注 ${c.orderCount}件・お問い合わせ ${c.inquiryCount}件・最終活動: ${formatDate(c.lastActivity)}</div>
        </div>
        <span style="color:var(--text-faint)">詳細 →</span>
      </a>
    `
          )
          .join("");

  const content = `
    <h1>クライアント一覧</h1>
    <h2>受注・お問い合わせに登場したクライアントをまとめています(クライアント名の一致で判定しています)</h2>
    ${banner(data.message)}
    ${items}
  `;
  return shell({
    title: "クライアント一覧",
    active: "clients",
    unreadCount: data.unreadCount,
    overdueCount: data.overdueCount,
    pendingTotal: data.pendingTotal,
    content,
    nonce: data.nonce,
  });
}

export function clientDetailPage(
  data: SidebarCounts & {
    name: string;
    orders: Order[];
    inquiries: Inquiry[];
    message?: { type: "ok" | "error"; text: string };
    nonce: string;
  }
): string {
  type Entry = { at: number; html: string };
  const entries: Entry[] = [
    ...data.inquiries.map((inq) => ({
      at: inq.receivedAt,
      html: `
        <div class="timeline-item">
          <div class="timeline-meta">${formatDate(inq.receivedAt)}</div>
          <div class="timeline-action"><span class="timeline-actor">お問い合わせ</span>${esc(inq.inquiryType)}</div>
          <div class="timeline-detail">${esc(inq.message.slice(0, 120))}${inq.message.length > 120 ? "…" : ""}</div>
        </div>
      `,
    })),
    ...data.orders.map((o) => ({
      at: o.createdAt,
      html: `
        <div class="timeline-item">
          <div class="timeline-meta">${formatDate(o.createdAt)}</div>
          <div class="timeline-action"><span class="timeline-actor">受注</span>${esc(o.serviceType)} — ${formatYen(o.amount)}</div>
          <div class="timeline-detail">進捗: ${esc(o.status)}・入金: ${esc(o.paymentStatus)} <a href="/orders?selected=${encodeURIComponent(o.key)}">編集 →</a></div>
        </div>
      `,
    })),
  ].sort((a, b) => b.at - a.at);

  const totalAmount = data.orders.reduce((sum, o) => sum + o.amount, 0);
  const paidAmount = data.orders
    .filter((o) => o.paymentStatus === "入金済み")
    .reduce((sum, o) => sum + o.amount, 0);

  const timeline =
    entries.length === 0
      ? emptyState(EMPTY_ICON_INBOX, "まだ記録がありません", "")
      : `<div class="timeline">${entries.map((e) => e.html).join("")}</div>`;

  const content = `
    <h1>${esc(data.name)}</h1>
    <h2>クライアントとのやり取りを時系列でまとめています</h2>
    ${banner(data.message)}
    <p><a href="/clients" style="font-size:13px">← クライアント一覧に戻る</a></p>
    <div class="cards">
      <div class="card"><div class="num">${data.orders.length}</div><div class="label">受注件数</div></div>
      <div class="card"><div class="num">${data.inquiries.length}</div><div class="label">お問い合わせ件数</div></div>
      <div class="card"><div class="num">${formatYen(totalAmount)}</div><div class="label">受注金額の合計</div></div>
      <div class="card"><div class="num">${formatYen(paidAmount)}</div><div class="label">入金済み合計</div></div>
    </div>
    <h2 style="margin-top:28px">やり取りの履歴</h2>
    ${timeline}
  `;
  return shell({
    title: data.name,
    active: "clients",
    unreadCount: data.unreadCount,
    overdueCount: data.overdueCount,
    pendingTotal: data.pendingTotal,
    content,
    nonce: data.nonce,
  });
}

export function searchPage(
  data: SidebarCounts & {
    q: string;
    results: { orders: Order[]; inquiries: Inquiry[]; snsPosts: SnsPost[]; activity: ActivityEntry[] };
    nonce: string;
  }
): string {
  const { q, results } = data;
  const totalHits =
    results.orders.length + results.inquiries.length + results.snsPosts.length + results.activity.length;

  const section = (label: string, html: string) =>
    html ? `<div class="search-section-label">${esc(label)}</div>${html}` : "";

  const orderResults = results.orders
    .map(
      (o) => `
      <a class="client-list-item" href="/orders?selected=${encodeURIComponent(o.key)}">
        <div><div class="client-name">${esc(o.clientName)}(${esc(o.serviceType)})</div><div class="client-meta">${formatYen(o.amount)}・${esc(o.status)}</div></div>
      </a>
    `
    )
    .join("");

  const inquiryResults = results.inquiries
    .map(
      (i) => `
      <a class="client-list-item" href="/inquiries">
        <div><div class="client-name">${esc(i.name)}(${esc(i.inquiryType)})</div><div class="client-meta">${esc(i.message.slice(0, 80))}${i.message.length > 80 ? "…" : ""}</div></div>
      </a>
    `
    )
    .join("");

  const snsResults = results.snsPosts
    .map(
      (p) => `
      <a class="client-list-item" href="/sns">
        <div><div class="client-name">[${esc(p.platform)}] ${esc(p.caption)}</div><div class="client-meta">${esc(p.body.slice(0, 80))}${p.body.length > 80 ? "…" : ""}</div></div>
      </a>
    `
    )
    .join("");

  const activityResults = results.activity
    .map(
      (e) => `
      <div class="client-list-item">
        <div><div class="client-name">${esc(e.actor)} — ${esc(e.action)}</div><div class="client-meta">${esc(e.detail)}・${formatDate(e.at)}</div></div>
      </div>
    `
    )
    .join("");

  const content = `
    <h1>検索</h1>
    <h2>受注・お問い合わせ・SNS投稿・アクティビティを横断して検索します</h2>
    <form method="get" action="/search" class="search-form">
      <input type="text" name="q" value="${esc(q)}" placeholder="クライアント名・内容などで検索" />
      <button class="primary" type="submit">検索</button>
    </form>
    ${
      !q
        ? `<p class="hint">キーワードを入力してください。</p>`
        : totalHits === 0
        ? emptyState(EMPTY_ICON_INBOX, "一致する結果がありません", "別のキーワードでお試しください。")
        : `
          ${section(`受注(${results.orders.length})`, orderResults)}
          ${section(`お問い合わせ(${results.inquiries.length})`, inquiryResults)}
          ${section(`SNS投稿(${results.snsPosts.length})`, snsResults)}
          ${section(`アクティビティ(${results.activity.length})`, activityResults)}
        `
    }
  `;
  return shell({
    title: "検索",
    active: "search",
    unreadCount: data.unreadCount,
    overdueCount: data.overdueCount,
    pendingTotal: data.pendingTotal,
    wide: true,
    content,
    nonce: data.nonce,
  });
}

export function printReportPage(
  data: SidebarCounts & {
    month: string;
    thisMonthRevenue: number;
    yearToDateRevenue: number;
    unpaidTotal: number;
    pipelineTotal: number;
    unreadInquiriesCount: number;
    overdueOrdersCount: number;
    snsDraftCount: number;
    snsPostedCount: number;
    monthly: { month: string; total: number; count: number }[];
    message?: { type: "ok" | "error"; text: string };
    nonce: string;
  }
): string {
  const content = `
    <div class="report-page">
      <div class="report-print-bar">
        <button class="primary" type="button" id="printReportBtn">🖨 印刷する</button>
      </div>
      <h1>月次経営レポート</h1>
      <h2>${esc(data.month)}時点のヨリソイワークスの状況です</h2>
      ${banner(data.message)}
      <div class="report-section cards">
        <div class="card"><div class="num">${formatYen(data.thisMonthRevenue)}</div><div class="label">今月の確定売上</div></div>
        <div class="card"><div class="num">${formatYen(data.yearToDateRevenue)}</div><div class="label">今年の累計売上</div></div>
        <div class="card"><div class="num">${formatYen(data.unpaidTotal)}</div><div class="label">未入金の合計</div></div>
        <div class="card"><div class="num">${formatYen(data.pipelineTotal)}</div><div class="label">進行中・見積もり中の見込み額</div></div>
      </div>
      <h2 style="margin-top:28px">月別の確定売上</h2>
      ${monthlyRevenueBarChart(data.monthly)}
      <h2 style="margin-top:28px">その他の状況</h2>
      <div class="report-section cards">
        <div class="card"><div class="num">${data.unreadInquiriesCount}</div><div class="label">未読のお問い合わせ</div></div>
        <div class="card"><div class="num">${data.overdueOrdersCount}</div><div class="label">納期超過の受注</div></div>
        <div class="card"><div class="num">${data.snsDraftCount}</div><div class="label">SNS投稿の下書き</div></div>
        <div class="card"><div class="num">${data.snsPostedCount}</div><div class="label">SNS投稿済み総数</div></div>
      </div>
      <p class="hint" style="margin-top:24px">このページは印刷・PDF保存に最適化されています(右上のボタン、またはCtrl/Cmd+Pをご利用ください)。</p>
    </div>
  `;
  return shell({
    title: "月次レポート",
    active: "reports",
    unreadCount: data.unreadCount,
    overdueCount: data.overdueCount,
    pendingTotal: data.pendingTotal,
    content,
    nonce: data.nonce,
  });
}

export function settingsPage(
  data: SidebarCounts & {
    email: string;
    message?: { type: "ok" | "error"; text: string };
    nonce: string;
  }
): string {
  const content = `
    <h1>設定</h1>
    <h2>ログインID・パスワードの確認と変更ができます</h2>
    ${banner(data.message)}

    <div class="settings-section">
      <h2 style="margin-top:0">現在のアカウント情報</h2>
      <div class="current-value">
        <span class="value-label">ログインID(メールアドレス)</span>
        <span class="value-main">${esc(data.email)}</span>
      </div>
      <div class="current-value">
        <span class="value-label">パスワード</span>
        <span class="value-main">••••••••</span>
      </div>
      <p class="hint">セキュリティのため、保存済みのパスワードはハッシュ化されており画面には表示できません。変更する場合は下のフォームから行ってください。</p>
    </div>

    <div class="settings-section">
      <h2>ログインIDを変更</h2>
      <form method="post" action="/settings/account">
        <fieldset>
          <label>新しいログインID(メールアドレス)</label>
          <input type="text" name="email" value="${esc(data.email)}" required />
          <label>現在のパスワード(確認のため)</label>
          <input type="password" name="currentPassword" required autocomplete="current-password" />
        </fieldset>
        <div class="save-bar"><button class="primary" type="submit">ログインIDを更新</button></div>
      </form>
    </div>

    <div class="settings-section">
      <h2>パスワードを変更</h2>
      <form method="post" action="/settings/password">
        <fieldset>
          <label>現在のパスワード</label>
          <input type="password" name="currentPassword" required autocomplete="current-password" />
          <label>新しいパスワード(8文字以上)</label>
          <input type="password" name="newPassword" required minlength="8" autocomplete="new-password" />
          <label>新しいパスワード(確認)</label>
          <input type="password" name="confirmPassword" required minlength="8" autocomplete="new-password" />
        </fieldset>
        <div class="save-bar"><button class="primary" type="submit">パスワードを変更</button></div>
      </form>
    </div>
  `;
  return shell({
    title: "設定",
    active: "settings",
    unreadCount: data.unreadCount,
    overdueCount: data.overdueCount,
    pendingTotal: data.pendingTotal,
    content,
    nonce: data.nonce,
  });
}
