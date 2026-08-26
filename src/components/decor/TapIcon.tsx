"use client";

import type { ReactNode } from "react";
import { useState } from "react";

type Kind = "spark" | "route" | "question" | "message" | "tag" | "calc" | "heart";

const paths: Record<Kind, ReactNode> = {
  spark: (
    <>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
      <path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" />
    </>
  ),
  route: (
    <>
      <circle cx="5.5" cy="6" r="2" />
      <circle cx="18.5" cy="18" r="2" />
      <path d="M5.5 8v3a4 4 0 004 4h5a4 4 0 004-4v-1" />
    </>
  ),
  question: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.2a2.5 2.5 0 014.9.8c0 1.7-2.4 1.9-2.4 3.6" />
      <circle cx="12" cy="16.8" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  message: (
    <>
      <path d="M4 5h16v10H9l-4 4v-4H4z" />
      <line x1="8" y1="9" x2="16" y2="9" />
      <line x1="8" y1="12" x2="13" y2="12" />
    </>
  ),
  tag: (
    <>
      <path d="M12.6 3.4l7 7a2 2 0 010 2.8l-6.4 6.4a2 2 0 01-2.8 0l-7-7V4.4a1 1 0 011-1h8.2z" />
      <circle cx="8" cy="8" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  calc: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <circle cx="8.3" cy="12" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="15.7" cy="12" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="8.3" cy="16" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="12" cy="16" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="15.7" cy="16" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  heart: (
    <path d="M12 20.5s-7.5-4.6-9.5-9.1C1.2 8.3 3 5 6.4 5c2 0 3.4 1.1 4 2.3.6-1.2 2-2.3 4-2.3 3.4 0 5.2 3.3 3.9 6.4-2 4.5-9.5 9.1-9.5 9.1z" />
  ),
};

// 見出し横に置く、通常のレイアウトフローに収まる小さなタップ演出アイコン。
// absolute配置ではないため文字と重なることがない。
export default function TapIcon({ kind }: { kind: Kind }) {
  const [bounce, setBounce] = useState(false);

  return (
    <span
      role="presentation"
      aria-hidden="true"
      onPointerDown={() => setBounce(true)}
      onAnimationEnd={() => setBounce(false)}
      className={`flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent/10 text-accent transition-colors hover:bg-accent/20 ${
        bounce ? "tap-icon-bounce" : ""
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths[kind]}
      </svg>
    </span>
  );
}
