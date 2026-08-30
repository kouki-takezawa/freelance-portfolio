// 複数のテンプレートファイルから共有される、小さな汎用ヘルパー。

export const PUBLIC_SITE_URL = "https://freelance-hp.yorisoi-works.workers.dev";

export function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatYen(n: number): string {
  return `${n.toLocaleString("ja-JP")}円`;
}
