"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function CountUp({
  value,
  duration = 1.2,
  pad,
  locale = false,
}: {
  value: number;
  duration?: number;
  /** ゼロ埋めする桁数(例: 2 → "01") */
  pad?: number;
  /** 3桁区切りのカンマを入れる(価格表示用) */
  locale?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const start = performance.now();
    const durationMs = duration * 1000;
    let frame: number;

    function tick(now: number) {
      const progress = Math.min((now - start) / durationMs, 1);
      setDisplay(Math.round(value * easeOutExpo(progress)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, value, duration]);

  const text = pad
    ? String(display).padStart(pad, "0")
    : locale
      ? display.toLocaleString("ja-JP")
      : String(display);

  return <span ref={ref}>{text}</span>;
}

// "100,000円〜" のような文字列から数値部分だけを抽出してカウントアップさせる
export function AnimatedPrice({ priceFrom }: { priceFrom: string }) {
  const match = priceFrom.match(/^(\D*)([\d,]+)(.*)$/);
  if (!match) return <>{priceFrom}</>;
  const [, prefix, digits, suffix] = match;
  const numericValue = Number(digits.replace(/,/g, ""));

  return (
    <>
      {prefix}
      <CountUp value={numericValue} locale />
      {suffix}
    </>
  );
}
