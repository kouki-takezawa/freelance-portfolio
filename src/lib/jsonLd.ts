// JSON-LDを<script>にそのまま埋め込むと、値に "</script>" が含まれた場合に
// タグを抜け出して任意のHTMLが注入される恐れがあるため "<" をエスケープする。
export function toSafeJsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
