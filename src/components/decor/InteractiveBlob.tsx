"use client";

import { useState } from "react";

type BlobTone = "deep" | "sky" | "ice";

const TONE_GRADIENT: Record<BlobTone, string> = {
  deep: "radial-gradient(circle at 30% 30%, #2F5A8A, #1E3A5F)",
  sky: "radial-gradient(circle at 30% 30%, #7FB0E0, #6FA0D6)",
  ice: "radial-gradient(circle at 30% 30%, #9DB8D6, #7FB0E0)",
};

type InteractiveBlobProps = {
  className?: string;
  tone?: BlobTone;
  seed?: number;
};

// 装飾専用のグラデーションブロブ。タップ/クリックで一瞬弾む「バースト」演出を発火する。
// レイアウト(順序・余白・文字構成)には関与しない、absolute配置の背景要素。
export default function InteractiveBlob({
  className = "",
  tone = "deep",
  seed = 0,
}: InteractiveBlobProps) {
  const [burst, setBurst] = useState(false);

  return (
    <div
      role="presentation"
      aria-hidden="true"
      onPointerDown={() => setBurst(true)}
      onAnimationEnd={() => setBurst(false)}
      className={`blob ${burst ? "blob-burst" : ""} ${className}`}
      style={{
        background: TONE_GRADIENT[tone],
        animationDelay: burst ? undefined : `${seed * -2.7}s`,
      }}
    />
  );
}
