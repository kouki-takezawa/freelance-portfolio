import type { ReactNode } from "react";

type Kind = "hp" | "lp" | "system" | "line";

// 制作事例カード用の、カテゴリを表す抽象的な線画バナー。
// 実写ではなく模式図であることが一目でわかるよう、あえてワイヤーフレーム的に描く。
const scenes: Record<Kind, ReactNode> = {
  hp: (
    <>
      <rect x="16" y="14" width="368" height="112" rx="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <line x1="16" y1="38" x2="384" y2="38" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <circle cx="30" cy="26" r="3" fill="currentColor" opacity="0.5" />
      <circle cx="40" cy="26" r="3" fill="currentColor" opacity="0.5" />
      <circle cx="50" cy="26" r="3" fill="currentColor" opacity="0.5" />
      <rect x="32" y="52" width="140" height="14" rx="3" fill="currentColor" opacity="0.8" />
      <rect x="32" y="74" width="180" height="8" rx="2" fill="currentColor" opacity="0.4" />
      <rect x="32" y="88" width="150" height="8" rx="2" fill="currentColor" opacity="0.4" />
      <rect x="240" y="52" width="120" height="46" rx="6" fill="currentColor" opacity="0.15" />
      <rect x="32" y="106" width="72" height="18" rx="9" fill="currentColor" opacity="0.9" />
    </>
  ),
  lp: (
    <>
      <rect x="150" y="10" width="100" height="120" rx="10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <rect x="164" y="24" width="72" height="30" rx="4" fill="currentColor" opacity="0.15" />
      <rect x="164" y="60" width="72" height="7" rx="2" fill="currentColor" opacity="0.7" />
      <rect x="164" y="72" width="52" height="6" rx="2" fill="currentColor" opacity="0.35" />
      <rect x="172" y="88" width="56" height="16" rx="8" fill="currentColor" opacity="0.9" />
      <path d="M110 70l24-14M110 70l24 14M110 70H70" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4" />
      <path d="M290 70l-24-14M290 70l-24 14M290 70h40" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4" />
      <circle cx="60" cy="70" r="8" fill="currentColor" opacity="0.2" />
      <circle cx="340" cy="70" r="8" fill="currentColor" opacity="0.2" />
    </>
  ),
  system: (
    <>
      <rect x="16" y="14" width="368" height="112" rx="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <rect x="16" y="14" width="90" height="112" fill="currentColor" opacity="0.1" />
      <rect x="32" y="32" width="58" height="6" rx="2" fill="currentColor" opacity="0.6" />
      <rect x="32" y="48" width="58" height="6" rx="2" fill="currentColor" opacity="0.6" />
      <rect x="32" y="64" width="58" height="6" rx="2" fill="currentColor" opacity="0.6" />
      <rect x="130" y="30" width="40" height="50" rx="3" fill="currentColor" opacity="0.25" />
      <rect x="180" y="46" width="40" height="34" rx="3" fill="currentColor" opacity="0.5" />
      <rect x="230" y="22" width="40" height="58" rx="3" fill="currentColor" opacity="0.8" />
      <line x1="130" y1="98" x2="356" y2="98" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <line x1="130" y1="110" x2="330" y2="110" stroke="currentColor" strokeWidth="2" opacity="0.35" />
    </>
  ),
  line: (
    <>
      <rect x="150" y="10" width="100" height="120" rx="10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <path d="M164 34h50a8 8 0 018 8v14a8 8 0 01-8 8h-32l-10 9v-9h-8a8 8 0 01-8-8V42a8 8 0 018-8z" fill="currentColor" opacity="0.2" />
      <path d="M178 92h58a8 8 0 018 8v10a8 8 0 01-8 8h-6v9l-12-9h-40a8 8 0 01-8-8v-10a8 8 0 018-8z" fill="currentColor" opacity="0.8" />
      <circle cx="70" cy="70" r="14" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <path d="M63 70h14M70 63v14" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <circle cx="330" cy="70" r="14" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <path d="M324 70h12" stroke="currentColor" strokeWidth="2" opacity="0.35" />
    </>
  ),
};

export default function WorkBanner({ kind }: { kind: Kind }) {
  return (
    <svg
      viewBox="0 0 400 140"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-hidden="true"
    >
      {scenes[kind]}
    </svg>
  );
}
