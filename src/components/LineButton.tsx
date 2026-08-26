import { siteConfig } from "@/lib/site";

export default function LineButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={siteConfig.lineUrl}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 ${className}`}
      // LINE公式グリーン(#06C755)は白文字とのコントラストが2.25:1でWCAG AA未達のため、
      // 同系色のまま4.5:1以上を確保できる濃さまで落としている
      style={{ backgroundColor: "#037C36" }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.48 2 2 5.69 2 10.24c0 4.08 3.54 7.5 8.32 8.14.32.07.76.21.87.49.1.25.07.65.03.9l-.14.85c-.04.25-.19.98.86.53 1.05-.44 5.68-3.35 7.75-5.73C21.14 13.83 22 12.12 22 10.24 22 5.69 17.52 2 12 2z" />
      </svg>
      公式LINEを友だち追加
    </a>
  );
}
