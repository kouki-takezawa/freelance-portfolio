// 全ページ共通のCSSと、<head>内で実行する小さなブートストラップスクリプト。

export const baseStyle = `
  :root {
    color-scheme: dark;
    --bg: #0a0e17;
    --bg-grid-dot: rgba(148,178,255,0.07);
    --surface: #121a2b;
    --surface-2: #0d1420;
    --surface-hover: #17223a;
    --border: rgba(148,178,255,0.16);
    --border-soft: rgba(148,178,255,0.08);
    --text: #e7edf7;
    --text-soft: #aab6cc;
    --text-faint: #6d7a94;
    --accent: #2dd4ee;
    --accent-2: #8b5cf6;
    --accent-soft: rgba(45,212,238,0.12);
    --accent-contrast: #071019;
    --good: #34d399;
    --good-soft: rgba(52,211,153,0.14);
    --warn: #fbbf24;
    --warn-soft: rgba(251,191,36,0.14);
    --danger: #fb7185;
    --danger-soft: rgba(251,113,133,0.14);
    --danger-contrast: #1a0a0d;
    --aside-bg: linear-gradient(180deg, #0c1220 0%, #090d16 100%);
    --shadow-ambient: 0 12px 24px -16px rgba(0,0,0,0.6);
    --tooltip-shadow: 0 8px 16px -8px rgba(0,0,0,0.5);
  }
  :root[data-theme="light"] {
    color-scheme: light;
    --bg: #eeeeee;
    --bg-grid-dot: rgba(0,0,0,0);
    --surface: #ffffff;
    --surface-2: #eeeeee;
    --surface-hover: #e4e4e4;
    --border: rgba(0,0,0,0.12);
    --border-soft: rgba(0,0,0,0.07);
    --text: #131b2c;
    --text-soft: #4b5670;
    --text-faint: #697392;
    --accent: #0891a8;
    --accent-2: #6d28d9;
    --accent-soft: rgba(8,145,168,0.1);
    --accent-contrast: #ffffff;
    --good: #047857;
    --good-soft: rgba(4,120,87,0.1);
    --warn: #b45309;
    --warn-soft: rgba(180,83,9,0.1);
    --danger: #be123c;
    --danger-soft: rgba(190,18,60,0.1);
    --danger-contrast: #ffffff;
    --aside-bg: #f5f5f5;
    --shadow-ambient: 0 12px 24px -18px rgba(30,58,95,0.25);
    --tooltip-shadow: 0 8px 16px -8px rgba(30,58,95,0.3);
  }
  @media (prefers-color-scheme: light) {
    :root:not([data-theme="dark"]) {
      color-scheme: light;
      --bg: #eeeeee;
      --bg-grid-dot: rgba(0,0,0,0);
      --surface: #ffffff;
      --surface-2: #eeeeee;
      --surface-hover: #e4e4e4;
      --border: rgba(0,0,0,0.12);
      --border-soft: rgba(0,0,0,0.07);
      --text: #131b2c;
      --text-soft: #4b5670;
      --text-faint: #697392;
      --accent: #0891a8;
      --accent-2: #6d28d9;
      --accent-soft: rgba(8,145,168,0.1);
      --accent-contrast: #ffffff;
      --good: #047857;
      --good-soft: rgba(4,120,87,0.1);
      --warn: #b45309;
      --warn-soft: rgba(180,83,9,0.1);
      --danger: #be123c;
      --danger-soft: rgba(190,18,60,0.1);
      --danger-contrast: #ffffff;
      --aside-bg: #f5f5f5;
      --shadow-ambient: 0 12px 24px -18px rgba(30,58,95,0.25);
      --tooltip-shadow: 0 8px 16px -8px rgba(30,58,95,0.3);
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Hiragino Kaku Gothic ProN", "Yu Gothic", "Inter", system-ui, sans-serif;
    background-color: var(--bg);
    background-image: radial-gradient(circle at 1px 1px, var(--bg-grid-dot) 1px, transparent 0);
    background-size: 22px 22px;
    color: var(--text);
    transition: background-color 0.2s, color 0.2s;
  }
  a { color: var(--accent); }
  .app { display: flex; min-height: 100vh; }
  aside {
    position: fixed;
    top: 0;
    left: 0;
    width: 224px;
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
    flex-shrink: 0;
    background: var(--aside-bg);
    border-right: 1px solid var(--border-soft);
    color: var(--text);
    display: flex;
    flex-direction: column;
    padding: 20px 0;
    transition: width 0.18s ease;
  }
  main.content { transition: margin-left 0.18s ease; }
  aside .brand-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 0 12px 20px 20px; border-bottom: 1px solid var(--border-soft); }
  aside .brand {
    font-family: "Space Grotesk", "Hiragino Kaku Gothic ProN", sans-serif;
    font-weight: 700; font-size: 15px; letter-spacing: 0.01em;
    background: linear-gradient(90deg, var(--text), var(--accent) 140%);
    -webkit-background-clip: text; background-clip: text; color: transparent;
    white-space: nowrap; overflow: hidden;
  }
  aside .brand-mark { display: none; font-family: "Space Grotesk", sans-serif; font-weight: 700; font-size: 13px; color: var(--accent); }
  .collapse-btn {
    flex-shrink: 0; width: 26px; height: 26px; border-radius: 7px; border: 1px solid var(--border);
    background: transparent; color: var(--text-faint); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  .collapse-btn:hover { color: var(--accent); border-color: var(--accent); }
  .collapse-btn svg { transition: transform 0.18s ease; }
  aside nav { flex: 1; padding-top: 8px; }
  .nav-section-toggle {
    display: flex; align-items: center; justify-content: space-between; width: 100%;
    background: none; border: none; padding: 0; margin: 0; cursor: pointer; font: inherit;
    text-align: left;
  }
  aside .nav-section-label {
    padding: 16px 20px 6px;
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.12em;
    color: var(--text-faint);
    text-transform: uppercase;
    white-space: nowrap;
  }
  .nav-section-chevron { flex-shrink: 0; margin: 8px 18px 0 0; color: var(--text-faint); transition: transform 0.15s ease, color 0.15s ease; }
  .nav-section-toggle:hover .nav-section-label,
  .nav-section-toggle:hover .nav-section-chevron { color: var(--accent); }
  .nav-section.collapsed .nav-section-chevron { transform: rotate(-90deg); }
  .nav-section.collapsed .nav-section-items { display: none; }
  aside nav a {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 10px;
    padding: 9px 12px;
    border-radius: 8px;
    border-left: 2px solid transparent;
    color: var(--text-soft);
    text-decoration: none;
    font-size: 13.5px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    transition: background-color 0.15s, color 0.15s;
  }
  aside nav a.active { background: var(--accent-soft); color: var(--accent); font-weight: 700; border-left-color: var(--accent); }
  aside nav a:hover { background: rgba(148,178,255,0.06); color: var(--text); }
  aside .badge {
    background: var(--danger);
    color: var(--danger-contrast);
    border-radius: 999px;
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 7px;
    margin-left: auto;
    flex-shrink: 0;
  }
  .nav-icon { flex-shrink: 0; }
  aside .footer { padding: 12px 20px 0; border-top: 1px solid var(--border-soft); margin-top: 12px; }
  aside .footer a {
    display: flex; align-items: center; gap: 10px; color: var(--text-soft); font-size: 13px;
    text-decoration: none; padding: 6px 0; white-space: nowrap; overflow: hidden;
  }
  aside .footer a:hover { color: var(--accent); }
  aside form button {
    width: 100%;
    display: flex; align-items: center; gap: 10px; justify-content: center;
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-soft);
    border-radius: 8px;
    padding: 8px;
    cursor: pointer;
    font-size: 13px;
    margin-top: 8px;
    white-space: nowrap; overflow: hidden;
  }
  aside form button:hover { border-color: var(--accent); color: var(--accent); }
  .theme-toggle {
    display: flex; align-items: center; gap: 8px; width: 100%;
    background: transparent; border: 1px solid var(--border); color: var(--text-soft);
    border-radius: 8px; padding: 8px 10px; margin-top: 8px; cursor: pointer; font-size: 13px;
    font-family: inherit;
  }
  .theme-toggle:hover { border-color: var(--accent); color: var(--accent); }
  .theme-toggle svg { flex-shrink: 0; }
  /* 全ページ共通の上限。大きなモニターで右側に余白ができないよう、以前は900〜1220pxだった
     ページごとの上限を1760pxに統一した。フォーム中心のページは.form-narrowで個別に狭める */
  main.content { flex: 1; min-width: 0; margin-left: 224px; padding: 32px 40px 80px; max-width: 1760px; }
  .form-narrow { max-width: 720px; }

  /* サイドバーの折り畳み(デスクトップ幅のみ。モバイルは別のハンバーガーnavなので対象外) */
  @media (min-width: 721px) {
    :root[data-sidebar="collapsed"] aside { width: 64px; }
    :root[data-sidebar="collapsed"] main.content { margin-left: 64px; }
    :root[data-sidebar="collapsed"] .nav-label,
    :root[data-sidebar="collapsed"] .nav-section-label,
    :root[data-sidebar="collapsed"] .palette-picker { display: none; }
    /* サイドバー自体をアイコンのみに折り畳んでいる間は、部門ごとの折り畳み(見出し自体が見えない)は無効にし、
       アイコンは常に全部表示する。個別の開閉ボタンも隠す */
    :root[data-sidebar="collapsed"] .nav-section-toggle { display: none; }
    :root[data-sidebar="collapsed"] .nav-section.collapsed .nav-section-items { display: block; }
    :root[data-sidebar="collapsed"] .brand-mark { display: block; }
    :root[data-sidebar="collapsed"] .brand-row { padding: 0 0 20px; justify-content: center; }
    :root[data-sidebar="collapsed"] .collapse-btn svg { transform: rotate(180deg); }
    :root[data-sidebar="collapsed"] aside nav a,
    :root[data-sidebar="collapsed"] aside .footer a,
    :root[data-sidebar="collapsed"] aside form button,
    :root[data-sidebar="collapsed"] .cmdk-trigger,
    :root[data-sidebar="collapsed"] .theme-toggle { justify-content: center; }
    :root[data-sidebar="collapsed"] aside nav a .badge {
      position: absolute; top: 2px; right: 2px; margin-left: 0;
      font-size: 9px; min-width: 14px; height: 14px; padding: 0 3px; line-height: 14px;
    }
  }
  @media (max-width: 720px) {
    .collapse-btn { display: none; }
  }
  h1 {
    font-family: "Space Grotesk", "Hiragino Kaku Gothic ProN", sans-serif;
    font-size: 24px; font-weight: 700; margin-top: 0; color: var(--text); letter-spacing: 0.01em;
  }
  h2 { font-size: 15px; color: var(--text-soft); margin-top: 0; font-weight: 600; }
  fieldset {
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    background: var(--surface);
  }
  legend { font-size: 12px; color: var(--text-faint); padding: 0 6px; }
  label { display: block; font-size: 13px; font-weight: 600; margin-top: 10px; margin-bottom: 4px; color: var(--text-soft); }
  input[type="text"], input[type="password"], textarea, select {
    width: 100%;
    padding: 9px 11px;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 15px;
    font-family: inherit;
    background: var(--surface-2);
    color: var(--text);
  }
  input:focus, textarea:focus, select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
  textarea { min-height: 70px; resize: vertical; }
  .field-row { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
  .checkbox-row { display: flex; align-items: center; gap: 6px; margin-top: 10px; font-size: 13px; color: var(--text-soft); }
  .checkbox-row input { width: auto; }
  .save-bar { margin-top: 20px; }
  button.primary {
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    color: var(--accent-contrast);
    border: none;
    border-radius: 999px;
    padding: 10px 28px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 0 0 1px rgba(45,212,238,0.3), 0 8px 20px -8px rgba(45,212,238,0.5);
  }
  button.primary:hover { filter: brightness(1.08); }
  button.small {
    background: transparent;
    color: var(--accent);
    border: 1px solid rgba(45,212,238,0.4);
    border-radius: 999px;
    padding: 5px 14px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }
  button.small:hover { background: var(--accent-soft); }
  .hint { color: var(--text-faint); font-size: 13px; margin-top: 4px; }
  .banner {
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 14px;
    border: 1px solid transparent;
  }
  .banner.ok { background: var(--good-soft); color: var(--good); border-color: rgba(52,211,153,0.3); }
  .banner.error { background: var(--danger-soft); color: var(--danger); border-color: rgba(251,113,133,0.3); }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-top: 24px; }
  .card {
    background: linear-gradient(160deg, rgba(45,212,238,0.05), rgba(139,92,246,0.02)), var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 20px;
  }
  .card .num { font-family: "JetBrains Mono", monospace; font-size: 26px; font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; }
  .card .label { font-size: 13px; color: var(--text-faint); margin-top: 4px; }
  .card a { font-size: 13px; color: var(--accent); text-decoration: none; }
  .card a:hover { text-decoration: underline; }
  .inquiry-filter-bar { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 20px; }
  .filter-chip { text-decoration: none; display: inline-block; padding: 6px 16px; border: 1px solid var(--border); border-radius: 999px; color: var(--text-soft); font-size: 12px; font-weight: 700; background: var(--surface); }
  .filter-chip.active { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
  .inquiry-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 18px; margin-bottom: 14px; }
  .inquiry-card.unread { border-left: 3px solid var(--danger); }
  .inquiry-meta { display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px; color: var(--text-faint); margin-bottom: 10px; }
  .inquiry-thread { display: flex; flex-direction: column; gap: 10px; margin-bottom: 6px; }
  .thread-msg { max-width: 88%; border-radius: 12px; padding: 10px 14px; }
  .thread-msg.from-customer { align-self: flex-start; background: var(--surface-2); border: 1px solid var(--border); border-top-left-radius: 2px; }
  .thread-msg.from-owner { align-self: flex-end; background: rgba(45,212,238,0.1); border: 1px solid rgba(45,212,238,0.25); border-top-right-radius: 2px; }
  .thread-msg-head { font-size: 11px; font-weight: 700; color: var(--text-faint); margin-bottom: 4px; }
  .thread-msg-body { white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: var(--text); }
  .inquiry-reply-toggle { margin: 10px 0; border: none; padding: 0; }
  .inquiry-reply-toggle > summary { cursor: pointer; list-style: none; font-size: 13px; font-weight: 700; color: var(--accent); padding: 6px 0; }
  .inquiry-reply-toggle > summary::-webkit-details-marker { display: none; }
  .inquiry-reply-toggle > summary::after { content: "▶"; font-size: 10px; margin-left: 6px; display: inline-block; }
  .inquiry-reply-toggle[open] > summary::after { content: "▼"; }
  .inquiry-reply-form { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
  .inquiry-reply-form textarea { min-height: 60px; }
  .inquiry-reply-form button { align-self: flex-start; }
  .inquiry-actions { display: flex; gap: 8px; padding-top: 10px; border-top: 1px solid var(--border-soft); margin-top: 4px; }
  .table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 14px; background: var(--surface); }
  table.data { width: 100%; border-collapse: collapse; font-size: 13px; white-space: nowrap; }
  table.data th, table.data td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border-soft); }
  table.data th { background: var(--surface-2); color: var(--text-faint); font-family: "JetBrains Mono", monospace; font-weight: 500; font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; }
  table.data tbody tr:last-child td { border-bottom: none; }
  table.data tbody tr:hover { background: var(--surface-hover); }
  table.data td.actions { display: flex; gap: 6px; }
  table.data td.actions form { display: inline; }
  .check-cell { width: 36px; }
  .check-cell input[type="checkbox"], .row-check { margin: 0; width: 16px; height: 16px; cursor: pointer; }
  .bulk-bar {
    display: none;
    position: sticky;
    top: 0;
    z-index: 5;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: var(--accent-soft);
    border: 1px solid var(--accent);
    border-radius: 12px;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 700;
    color: var(--accent);
    margin-bottom: 10px;
  }
  .bulk-bar.show { display: flex; }
  .bulk-bar-persistent { display: flex; background: var(--surface-2); border-color: var(--border); color: var(--text-soft); }
  .bulk-bar-persistent .bulk-actions { display: none; }
  .bulk-bar-persistent.show { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); }
  .bulk-bar-persistent.show .bulk-actions { display: flex; }
  .bulk-count-group { display: flex; align-items: center; gap: 8px; }
  .bulk-count-group input[type="checkbox"] { margin: 0; width: 16px; height: 16px; cursor: pointer; }
  .bulk-actions { display: flex; gap: 8px; }
  .status-pill {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }
  .status-見積もり中 { background: rgba(148,178,255,0.12); color: var(--text-soft); }
  .status-進行中 { background: var(--accent-soft); color: var(--accent); }
  .status-納品済み { background: var(--good-soft); color: var(--good); }
  .status-キャンセル { background: var(--danger-soft); color: var(--danger); text-decoration: line-through; }
  .status-未入金 { background: var(--warn-soft); color: var(--warn); }
  .status-入金済み { background: var(--good-soft); color: var(--good); }
  /* 色だけに頼らず、状態ごとに異なる記号も表示する(色弱の方への配慮) */
  .status-見積もり中::before { content: "⏳ "; }
  .status-進行中::before { content: "▶ "; }
  .status-納品済み::before { content: "✓ "; }
  .status-キャンセル::before { content: "✕ "; }
  .status-未入金::before { content: "! "; }
  .status-入金済み::before { content: "✓ "; }
  .overdue { color: var(--danger); font-weight: 700; }
  .revenue-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin: 24px 0; }
  .revenue-cards .card .num { font-size: 22px; }
  .add-bar { margin-top: 16px; margin-bottom: 20px; }
  .login-box {
    max-width: 360px;
    margin: 80px auto;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 32px;
    box-shadow: 0 0 0 1px rgba(45,212,238,0.06), 0 24px 48px -24px rgba(0,0,0,0.6);
  }
  .login-box h1 { text-align: center; margin-bottom: 24px; }
  .login-box button { width: 100%; margin-top: 20px; }

  /* 組織図: SVGで曲線コネクタを描画するFlexboxベースのレイアウト */
  .org-chart { position: relative; display: flex; flex-direction: column; align-items: center; padding-top: 8px; }
  .org-curves { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; overflow: visible; }
  .org-curve-path { fill: none; stroke: url(#orgCurveGradient); stroke-width: 2; filter: drop-shadow(0 0 4px rgba(45,212,238,0.5)); }
  .org-curve-dot { fill: var(--accent); filter: drop-shadow(0 0 4px rgba(45,212,238,0.7)); }
  .org-box {
    position: relative; z-index: 1;
    background: linear-gradient(160deg, rgba(45,212,238,0.07), rgba(139,92,246,0.03)), var(--surface);
    border: 1px solid var(--border); border-radius: 14px;
    padding: 14px 16px; box-shadow: 0 1px 0 rgba(255,255,255,0.02) inset, 0 12px 24px -16px rgba(0,0,0,0.6);
    text-align: left;
  }
  .org-box.ceo {
    /* CEOボックスは常に濃紺〜紫の固定背景(主役として、テーマに関わらず目立たせる)のため、文字色も固定 */
    background: linear-gradient(135deg, #14213a, #1b1440);
    border-color: rgba(139,92,246,0.4);
    color: #e7edf7; min-width: 220px; text-align: center; align-self: center;
    box-shadow: 0 0 0 1px rgba(139,92,246,0.15), 0 0 32px -8px rgba(139,92,246,0.5);
  }
  .org-box.ceo .org-role { color: #aab6cc; }
  .org-box.kanri {
    background: linear-gradient(160deg, rgba(45,212,238,0.1), rgba(139,92,246,0.04)), var(--surface);
    border-color: rgba(45,212,238,0.3);
    text-align: center; min-width: 260px; align-self: center;
    box-shadow: 0 0 24px -12px rgba(45,212,238,0.4);
  }
  .org-box .org-name { font-family: "Space Grotesk", sans-serif; font-weight: 700; font-size: 14px; }
  .org-box .org-name a { color: inherit; text-decoration: none; }
  .org-box .org-name a:hover { text-decoration: underline; }
  .org-box .org-role { font-size: 11px; color: var(--text-faint); margin-top: 2px; }
  .org-box .org-mission { font-size: 12px; color: var(--text-faint); margin-top: 8px; line-height: 1.5; }
  .org-badge {
    position: absolute; top: -9px; right: -9px; z-index: 2;
    min-width: 20px; height: 20px; padding: 0 5px;
    display: flex; align-items: center; justify-content: center;
    font-family: "JetBrains Mono", monospace;
    background: var(--danger); color: var(--danger-contrast); border: 2px solid var(--bg);
    border-radius: 999px; font-size: 11px; font-weight: 700; line-height: 1;
    box-shadow: 0 0 8px rgba(251,113,133,0.6);
    cursor: default;
  }
  .org-tooltip {
    position: absolute; top: calc(100% + 8px); right: -2px;
    min-width: 180px; max-width: 240px;
    background: var(--surface-2); color: var(--text); border: 1px solid var(--border);
    padding: 8px 10px; border-radius: 8px; font-size: 11.5px; font-weight: 500; line-height: 1.5;
    font-family: "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif;
    box-shadow: var(--tooltip-shadow);
    opacity: 0; visibility: hidden; transform: translateY(-4px);
    transition: opacity 0.12s, transform 0.12s;
    pointer-events: none;
  }
  .org-badge:hover .org-tooltip, .org-badge:focus-visible .org-tooltip {
    opacity: 1; visibility: visible; transform: translateY(0);
  }
  .org-phase-list { list-style: none; margin: 10px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
  .org-phase-list li {
    font-size: 12px; color: var(--text-soft); background: var(--surface-2); border-radius: 6px;
    padding: 6px 8px; border-left: 3px solid var(--border);
  }
  .org-phase-list li .org-phase-role {
    display: inline-block; margin-right: 6px; padding: 1px 7px;
    font-family: "JetBrains Mono", monospace;
    border-radius: 999px; background: var(--accent-soft); color: var(--accent);
    font-weight: 700; font-size: 10.5px; white-space: nowrap;
  }
  .org-phase-list li.approval .org-phase-role { background: var(--danger-soft); color: var(--danger); }
  .org-phase-list li.approval { border-left-color: var(--danger); background: rgba(251,113,133,0.06); font-weight: 700; }
  .org-phase-live {
    display: inline-block; float: right; margin-left: 6px;
    font-family: "JetBrains Mono", monospace; font-size: 10px; font-weight: 700;
    color: var(--good); background: var(--good-soft); padding: 1px 7px; border-radius: 999px;
    animation: livePulse 2s ease-in-out infinite;
  }
  .org-flow-dot { fill: #fff; filter: drop-shadow(0 0 3px rgba(45,212,238,0.9)); }
  @keyframes livePulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }
  @media (prefers-reduced-motion: reduce) {
    .org-phase-live { animation: none; }
    .org-flow-dot { display: none; }
  }
  .org-legend { display: flex; flex-wrap: wrap; gap: 16px; margin: 4px 0 20px; font-size: 12px; color: var(--text-faint); }
  .org-legend span { display: inline-flex; align-items: center; gap: 6px; }
  .org-legend .dot { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
  /* 部門カードはCSS Gridで折り返す(横スクロールが発生しない設計) */
  .org-branches {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(168px, 1fr));
    gap: 12px;
    padding-top: 44px;
    position: relative;
    align-self: stretch;
    width: 100%;
    z-index: 1;
  }

  /* 一覧の検索・並び替えツールバー */
  .list-toolbar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin: 16px 0 8px; }
  .list-toolbar input[type="text"] { max-width: 260px; }
  .list-toolbar select { max-width: 160px; width: auto; }
  .list-toolbar button.small { padding: 9px 18px; }

  .field-error { color: var(--danger); font-size: 12px; margin-top: 4px; display: none; }
  .field-error.show { display: block; }
  input.invalid, textarea.invalid { border-color: var(--danger); }
  input.valid-ok { border-color: var(--good); }

  /* SNSプラットフォームアイコン */
  .sns-icon { display: inline-flex; vertical-align: -3px; margin-right: 4px; }

  /* 設定ページ */
  .settings-section { max-width: 480px; margin-top: 24px; }
  .settings-section .current-value {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    background: var(--surface-2); border: 1px solid var(--border-soft); border-radius: 10px;
    padding: 12px 14px; font-size: 14px; margin-bottom: 4px;
  }
  .settings-section .current-value .value-label { color: var(--text-faint); font-size: 12px; }
  .settings-section .current-value .value-main { font-weight: 700; font-family: "JetBrains Mono", monospace; }

  /* 承認センター */
  .approval-section { margin-top: 28px; }
  .approval-section h2 { display: flex; align-items: center; gap: 8px; }
  .approval-section .count-chip {
    font-family: "JetBrains Mono", monospace; font-size: 12px; font-weight: 700;
    background: var(--danger-soft); color: var(--danger); padding: 1px 9px; border-radius: 999px;
  }
  .approval-empty { color: var(--text-faint); font-size: 13px; padding: 4px 0 0; }
  .approval-item {
    display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
    background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
    padding: 12px 16px; margin-top: 8px;
  }
  .approval-item .approval-title { font-weight: 700; font-size: 13.5px; }
  .approval-item .approval-detail { font-size: 12px; color: var(--text-faint); margin-top: 2px; }
  .approval-item .approval-actions { display: flex; gap: 8px; flex-shrink: 0; }
  .approval-item form { display: inline; }

  /* アクティビティ(タイムライン) */
  .timeline { position: relative; margin-top: 16px; padding-left: 20px; border-left: 2px solid var(--border); }
  .timeline-item { position: relative; padding-bottom: 20px; }
  .timeline-item::before {
    content: ""; position: absolute; left: -25px; top: 3px; width: 9px; height: 9px; border-radius: 50%;
    background: var(--accent); box-shadow: 0 0 0 3px var(--bg), 0 0 6px rgba(45,212,238,0.6);
  }
  .timeline-item .timeline-meta { font-size: 11px; color: var(--text-faint); font-family: "JetBrains Mono", monospace; }
  .timeline-item .timeline-actor {
    display: inline-block; margin-right: 6px; padding: 1px 7px; font-size: 10.5px; font-weight: 700;
    background: var(--accent-soft); color: var(--accent); border-radius: 999px; font-family: "JetBrains Mono", monospace;
  }
  .timeline-item .timeline-action { font-weight: 700; font-size: 13.5px; margin-top: 3px; }
  .timeline-item .timeline-detail { font-size: 13px; color: var(--text-soft); margin-top: 2px; }

  /* リアルタイム更新バナー */
  #liveBanner {
    position: fixed; top: 14px; left: 50%; transform: translateX(-50%) translateY(-140%);
    z-index: 60; background: var(--surface); border: 1px solid var(--accent); color: var(--text);
    padding: 9px 18px; border-radius: 999px; font-size: 13px; font-weight: 700; cursor: pointer;
    box-shadow: 0 12px 24px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(45,212,238,0.2);
    transition: transform 0.25s ease;
  }
  #liveBanner.show { transform: translateX(-50%) translateY(0); }

  /* ハンバーガーメニューボタン(モバイルのみ表示) */
  .hamburger-btn { display: none; }

  /* コマンドパレット(Ctrl+K) */
  .cmdk-trigger {
    display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%;
    background: transparent; border: 1px solid var(--border); color: var(--text-faint);
    border-radius: 8px; padding: 8px 10px; margin-top: 8px; cursor: pointer; font-size: 12.5px;
    font-family: inherit;
  }
  .cmdk-trigger:hover { border-color: var(--accent); color: var(--accent); }
  .cmdk-trigger kbd {
    font-family: "JetBrains Mono", monospace; font-size: 10px; background: var(--surface-2);
    border: 1px solid var(--border); border-radius: 4px; padding: 1px 5px; color: var(--text-faint);
  }
  .cmdk-overlay {
    display: none; position: fixed; inset: 0; z-index: 80; background: rgba(5,8,14,0.55);
    backdrop-filter: blur(2px); align-items: flex-start; justify-content: center; padding-top: 12vh;
  }
  .cmdk-overlay.open { display: flex; }
  .cmdk-box {
    width: min(560px, 92vw); background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; box-shadow: 0 24px 64px -24px rgba(0,0,0,0.7); overflow: hidden;
  }
  .cmdk-box input {
    width: 100%; border: none; border-bottom: 1px solid var(--border-soft); border-radius: 0;
    padding: 16px 18px; font-size: 16px; background: var(--surface); color: var(--text);
  }
  .cmdk-box input:focus { outline: none; box-shadow: none; }
  .cmdk-list { max-height: 50vh; overflow-y: auto; padding: 6px; }
  .cmdk-item {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    padding: 10px 12px; border-radius: 8px; font-size: 13.5px; color: var(--text-soft); cursor: pointer;
  }
  .cmdk-item .cmdk-hint { font-size: 11px; color: var(--text-faint); }
  .cmdk-item.active { background: var(--accent-soft); color: var(--accent); }
  .cmdk-empty { padding: 16px; font-size: 13px; color: var(--text-faint); }

  /* AIチャットパネル */
  .chat-fab {
    position: fixed; right: 24px; bottom: 24px; z-index: 55; width: 52px; height: 52px; border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), var(--accent-2)); border: none; color: var(--accent-contrast);
    box-shadow: 0 12px 24px -8px rgba(45,212,238,0.6); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  .chat-fab:hover { filter: brightness(1.08); }
  .chat-panel {
    display: none; position: fixed; right: 24px; bottom: 88px; z-index: 55; width: min(340px, calc(100vw - 32px));
    height: min(460px, calc(100vh - 140px)); background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; box-shadow: 0 24px 64px -20px rgba(0,0,0,0.6); flex-direction: column; overflow: hidden;
  }
  .chat-panel.open { display: flex; }
  .chat-head {
    padding: 12px 14px; border-bottom: 1px solid var(--border-soft); font-weight: 700; font-size: 13.5px;
    display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
  }
  .chat-head button { background: none; border: none; color: var(--text-faint); cursor: pointer; font-size: 16px; }
  .chat-body { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
  .chat-msg { max-width: 88%; border-radius: 12px; padding: 8px 12px; font-size: 13px; line-height: 1.55; white-space: pre-wrap; }
  .chat-msg.user { align-self: flex-end; background: var(--accent-soft); color: var(--text); border-top-right-radius: 2px; }
  .chat-msg.ai { align-self: flex-start; background: var(--surface-2); border: 1px solid var(--border); border-top-left-radius: 2px; }
  .chat-msg.system { align-self: center; color: var(--text-faint); font-size: 11.5px; background: none; }
  .chat-form { display: flex; gap: 6px; padding: 10px; border-top: 1px solid var(--border-soft); flex-shrink: 0; }
  .chat-form input { flex: 1; padding: 8px 10px; font-size: 13px; }
  .chat-form button {
    background: linear-gradient(135deg, var(--accent), var(--accent-2)); color: var(--accent-contrast);
    border: none; border-radius: 8px; padding: 0 14px; font-weight: 700; cursor: pointer; font-size: 13px;
  }

  @media (max-width: 720px) {
    .app { flex-direction: column; }
    .hamburger-btn {
      display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;
      border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); color: var(--text-soft);
      cursor: pointer; margin-left: auto; flex-shrink: 0;
    }
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
      z-index: 40;
    }
    aside .brand { padding: 0; border-bottom: none; font-size: 13px; white-space: nowrap; }
    aside nav {
      order: 4;
      flex: 1 1 100%;
      display: none;
      flex-direction: column;
      position: fixed;
      top: 0; right: 0; bottom: 0;
      width: min(80vw, 300px);
      background: var(--aside-bg);
      border-left: 1px solid var(--border-soft);
      padding: 64px 0 20px;
      overflow-y: auto;
      z-index: 45;
      transform: translateX(100%);
      transition: transform 0.22s ease;
    }
    aside.nav-open nav { display: flex; transform: translateX(0); box-shadow: -24px 0 48px -24px rgba(0,0,0,0.5); }
    aside.nav-open::before {
      content: ""; position: fixed; inset: 0; background: rgba(5,8,14,0.5); z-index: 44;
    }
    aside nav a { padding: 10px 20px; white-space: nowrap; margin: 0 8px; }
    aside .footer {
      display: none;
    }
    aside.nav-open .footer {
      display: flex; flex-direction: column; align-items: stretch; gap: 6px; order: 5;
      position: fixed; right: 0; bottom: 0; width: min(80vw, 300px); z-index: 46;
      background: var(--aside-bg); border-top: 1px solid var(--border-soft); padding: 12px 20px 20px;
      margin: 0; border-left: 1px solid var(--border-soft);
    }
    aside.nav-open .footer a { padding: 6px 0; font-size: 13px; }
    aside form { display: block; }
    aside form button { width: 100%; margin-top: 4px; padding: 8px; font-size: 13px; }
    main.content { margin-left: 0; padding: 20px 16px 60px; }
    .login-box { margin: 40px auto; max-width: calc(100% - 32px); }
    .chat-panel { right: 12px; bottom: 80px; }
    .chat-fab { right: 16px; bottom: 16px; }

    /* 横長テーブルはカード型に組み替えて横スクロールをなくす */
    .table-wrap { overflow-x: visible; border: none; background: none; }
    table.data, table.data tbody, table.data tr, table.data td { display: block; width: 100%; }
    table.data { white-space: normal; }
    table.data thead { display: none; }
    table.data tbody tr {
      background: var(--surface);
      border: 1px solid var(--border);
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
      border-bottom: 1px solid var(--border-soft);
      text-align: right;
    }
    table.data tbody tr td:last-child { border-bottom: none; }
    table.data td::before {
      content: attr(data-label);
      font-size: 12px;
      font-weight: 600;
      color: var(--text-faint);
      text-align: left;
      flex-shrink: 0;
    }
    table.data td:not([data-label])::before { content: none; }
    table.data td.hint { display: block; text-align: left; }
    table.data td.actions { justify-content: flex-end; padding-top: 14px; }

    /* 組織図: 狭い画面ではCEO/経営管理部ボックスも全幅にする(部門グリッドはauto-fitで自動的に折り返す) */
    .org-box.ceo, .org-box.kanri { min-width: 0; width: 100%; }
  }

  /* AI社員アバター(役職名から色を決めた発光オーブ) */
  .ai-avatar {
    display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 5px; vertical-align: middle;
    background: hsl(var(--avatar-hue, 200) 70% 55%);
    box-shadow: 0 0 4px hsla(var(--avatar-hue, 200), 80%, 60%, 0.7);
    flex-shrink: 0;
  }
  .ai-avatar-active { animation: avatarPulse 1.6s ease-in-out infinite; }
  @keyframes avatarPulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.5); opacity: 0.6; }
  }
  @media (prefers-reduced-motion: reduce) {
    .ai-avatar-active { animation: none; }
  }

  /* AI社員の日替わりひとこと(吹き出し風。承認待ちカードと混同しないよう形状を変える) */
  .ai-comment {
    display: flex; align-items: flex-start; gap: 10px; margin: 14px 0 24px;
    background: var(--accent-soft); border: 1px solid var(--accent);
    border-radius: 4px 14px 14px 14px;
    padding: 12px 16px; font-size: 13px; color: var(--text-soft); max-width: 520px;
  }
  .ai-comment .ai-avatar { width: 12px; height: 12px; margin-top: 3px; }
  .ai-comment .ai-comment-role { font-weight: 700; color: var(--text); margin-right: 4px; }

  /* 達成を祝うマイクロインタラクション(承認待ちが0件になったとき) */
  .confetti-container { position: fixed; inset: 0; pointer-events: none; z-index: 90; overflow: hidden; }
  .confetti-piece {
    position: absolute; top: -10px; width: 8px; height: 8px; border-radius: 2px;
    animation: confettiFall 1.8s ease-in forwards;
  }
  @keyframes confettiFall {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .confetti-piece { animation: none; display: none; }
  }

  /* 時間帯によるアンビエント演出は、背景に段差(バンディング)が見えてしまうため撤去した。
     ライトモードは常に単色の背景のみにし、ドット柄はダークモードだけに残す。 */
  :root[data-theme="light"] body {
    background-image: none;
  }
  @media (prefers-color-scheme: light) {
    :root:not([data-theme="dark"]) body {
      background-image: none;
    }
  }

  /* ダークモードはアクセントカラーの発光で近未来感を出しているが、ライトモードは白背景のため
     カード類の輪郭が沈んで見えていた。彩度を抑えたアクセントカラーの控えめなグローを追加する。 */
  :root[data-theme="light"] .card,
  :root[data-theme="light"] .org-box {
    box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 16px 32px -20px var(--accent-soft), 0 0 0 1px rgba(8,145,168,0.06);
  }
  @media (prefers-color-scheme: light) {
    :root:not([data-theme="dark"]) .card,
    :root:not([data-theme="dark"]) .org-box {
      box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 16px 32px -20px var(--accent-soft), 0 0 0 1px rgba(8,145,168,0.06);
    }
  }

  /* アクセントカラーパレット */
  .palette-picker { display: flex; gap: 6px; margin-top: 8px; }
  .palette-swatch {
    width: 20px; height: 20px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; padding: 0;
    background: linear-gradient(135deg, var(--sw-a), var(--sw-b));
  }
  .palette-swatch.active { border-color: var(--text); }
  :root[data-palette="forest"] { --accent: #16a34a; --accent-2: #0d9488; --accent-soft: rgba(22,163,74,0.14); --accent-contrast: #04170c; }
  :root[data-theme="light"][data-palette="forest"], :root:not([data-theme="dark"])[data-palette="forest"] { --accent: #15803d; --accent-2: #0f766e; --accent-soft: rgba(21,128,61,0.1); --accent-contrast: #ffffff; }
  :root[data-palette="sunset"] { --accent: #fb923c; --accent-2: #ec4899; --accent-soft: rgba(251,146,60,0.14); --accent-contrast: #240a02; }
  :root[data-theme="light"][data-palette="sunset"], :root:not([data-theme="dark"])[data-palette="sunset"] { --accent: #c2410c; --accent-2: #be185d; --accent-soft: rgba(194,65,12,0.1); --accent-contrast: #ffffff; }
  :root[data-palette="ocean"] { --accent: #38bdf8; --accent-2: #6366f1; --accent-soft: rgba(56,189,248,0.14); --accent-contrast: #041521; }
  :root[data-theme="light"][data-palette="ocean"], :root:not([data-theme="dark"])[data-palette="ocean"] { --accent: #0369a1; --accent-2: #4338ca; --accent-soft: rgba(3,105,161,0.1); --accent-contrast: #ffffff; }

  /* 通知センター(ベル) */
  .notif-bell {
    position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;
    border-radius: 8px; border: 1px solid var(--border); background: transparent; color: var(--text-soft); cursor: pointer;
  }
  .notif-bell:hover { border-color: var(--accent); color: var(--accent); }
  .notif-bell .notif-dot {
    position: absolute; top: -4px; right: -4px; min-width: 15px; height: 15px; padding: 0 3px; border-radius: 999px;
    background: var(--danger); color: var(--danger-contrast); font-family: "JetBrains Mono", monospace; font-size: 9px;
    font-weight: 700; display: flex; align-items: center; justify-content: center; border: 2px solid var(--bg);
  }
  .notif-panel {
    /* ベルはサイドバー下部のフッターにあるため、下方向ではなく上方向に開く(画面外へのはみ出しを防ぐ) */
    display: none; position: absolute; bottom: 42px; left: 0; width: 300px; max-height: 400px; overflow-y: auto;
    background: var(--surface); border: 1px solid var(--border); border-radius: 14px;
    box-shadow: 0 -12px 48px -20px rgba(0,0,0,0.5); z-index: 70; padding: 6px;
  }
  .notif-panel.open { display: block; }
  .notif-item { padding: 9px 10px; border-radius: 8px; font-size: 12.5px; }
  .notif-item:hover { background: var(--surface-2); }
  .notif-item .notif-meta { font-size: 10.5px; color: var(--text-faint); font-family: "JetBrains Mono", monospace; }
  .notif-item .notif-actor {
    display: inline-block; margin-right: 5px; padding: 1px 6px; font-size: 10px; font-weight: 700;
    background: var(--accent-soft); color: var(--accent); border-radius: 999px; font-family: "JetBrains Mono", monospace;
  }
  .notif-empty { padding: 20px 12px; color: var(--text-faint); font-size: 12.5px; text-align: center; }
  .notif-bell-wrap { position: relative; }

  /* スクリーンリーダー専用(視覚的には非表示だが読み上げ対象にする) */
  .sr-only {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
  }

  /* 空データ状態の専用デザイン */
  .empty-state { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 44px 20px; color: var(--text-faint); }
  .empty-state .empty-icon { width: 46px; height: 46px; margin-bottom: 14px; color: var(--text-faint); opacity: 0.8; }
  .empty-state .empty-title { font-size: 14px; font-weight: 700; color: var(--text-soft); margin-bottom: 4px; }
  .empty-state .empty-hint { font-size: 12.5px; max-width: 320px; }

  /* 全データ横断検索 */
  .search-form { display: flex; gap: 8px; margin: 16px 0 24px; max-width: 480px; }
  .search-form input { flex: 1; }
  .search-section-label {
    font-family: "JetBrains Mono", monospace; font-size: 11px; letter-spacing: 0.08em; color: var(--text-faint);
    text-transform: uppercase; margin: 24px 0 8px;
  }

  /* トップ読み込みバー(ページ遷移の体感速度向上) */
  #topLoadBar {
    position: fixed; top: 0; left: 0; height: 2.5px; width: 0%; z-index: 100;
    background: linear-gradient(90deg, var(--accent), var(--accent-2));
    box-shadow: 0 0 8px var(--accent); transition: width 0.3s ease, opacity 0.2s ease;
    opacity: 0;
  }
  #topLoadBar.active { opacity: 1; }

  /* キーボードショートカット一覧 */
  .kbd-help-overlay {
    display: none; position: fixed; inset: 0; z-index: 85; background: rgba(5,8,14,0.55);
    align-items: center; justify-content: center;
  }
  .kbd-help-overlay.open { display: flex; }
  .kbd-help-box {
    width: min(420px, 90vw); background: var(--surface); border: 1px solid var(--border); border-radius: 16px;
    padding: 20px 24px; box-shadow: 0 24px 64px -24px rgba(0,0,0,0.7);
  }
  .kbd-help-box h3 { margin: 0 0 12px; font-size: 15px; }
  .kbd-help-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: var(--text-soft); border-bottom: 1px solid var(--border-soft); }
  .kbd-help-row:last-child { border-bottom: none; }
  table.data tbody tr.kbd-active { background: var(--accent-soft); outline: 1px solid var(--accent); }

  /* クライアント詳細ページ */
  .client-list-item {
    display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; margin-bottom: 8px;
    background: var(--surface); border: 1px solid var(--border); border-radius: 12px; text-decoration: none; color: inherit;
  }
  .client-list-item:hover { border-color: var(--accent); }
  .client-list-item .client-name { font-weight: 700; font-size: 14px; }
  .client-list-item .client-meta { font-size: 12px; color: var(--text-faint); margin-top: 2px; }

  /* 受注管理: マスター/ディテールの2ペイン表示 */
  /* min-width:0がないと、幅の広いtableを含むグリッド子要素が縮まずページ全体がはみ出す(グリッドの既知の挙動) */
  .master-detail { display: grid; grid-template-columns: 1fr; gap: 20px; }
  .master-detail > div { min-width: 0; }
  @media (min-width: 980px) {
    .master-detail.has-detail { grid-template-columns: minmax(0, 1fr) minmax(320px, 380px); align-items: start; }
  }
  .master-detail .detail-pane {
    background: var(--surface); border: 1px solid var(--accent); border-radius: 14px; padding: 18px;
    box-shadow: 0 0 24px -12px rgba(45,212,238,0.3); position: sticky; top: 16px;
  }
  .master-detail .detail-pane h2 { display: flex; justify-content: space-between; align-items: center; }
  .master-detail .detail-pane .close-detail { text-decoration: none; color: var(--text-faint); font-size: 13px; }
  table.data tbody tr.row-selected { background: var(--accent-soft); }
  table.data tbody tr[data-href] { cursor: pointer; }

  /* 印刷向けレポート */
  .report-page { max-width: 720px; }
  .report-print-bar { display: flex; justify-content: flex-end; margin-bottom: 12px; }
  @media print {
    aside, .chat-fab, .chat-panel, .cmdk-overlay, #liveBanner, #topLoadBar, .report-print-bar, .notif-bell-wrap { display: none !important; }
    main.content { margin-left: 0 !important; max-width: none !important; padding: 0 !important; }
    body { background: #fff !important; color: #000 !important; }
    .card, .table-wrap, .report-section { break-inside: avoid; border-color: #ccc !important; }
  }

  /* 組織図: 画面の高さに収まりきらないときだけ自動で縮小する(手動のズーム操作はしない) */
  .org-autofit { transform-origin: top center; transition: transform 0.15s ease, margin-bottom 0.15s ease; }

  /* 組織図: ドラッグ並べ替え */
  .org-branches > div[draggable="true"] { cursor: grab; }
  .org-branches > div.dragging { opacity: 0.4; }
  .org-branches > div.drag-over { outline: 2px dashed var(--accent); outline-offset: 4px; border-radius: 14px; }
`;

// data-theme・アクセントカラーを描画前に確定させ、切り替え時のちらつき(FOUC)を防ぐ
export const THEME_BOOTSTRAP_SCRIPT = `
(function(){
  try {
    var t = localStorage.getItem("theme");
    if (t === "light" || t === "dark") {
      document.documentElement.setAttribute("data-theme", t);
    }
    var p = localStorage.getItem("palette");
    if (p && p !== "aurora") {
      document.documentElement.setAttribute("data-palette", p);
    }
    var sb = localStorage.getItem("sidebar-collapsed");
    if (sb === "1") {
      document.documentElement.setAttribute("data-sidebar", "collapsed");
    }
  } catch (e) {}
})();
`;

export const SW_REGISTER_SCRIPT = `
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js").catch(function () {});
  });
}
`;
