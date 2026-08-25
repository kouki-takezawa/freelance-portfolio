"use client";

import { useRef } from "react";
import Link from "next/link";
import type { WorkCase } from "@/lib/works";
import { categoryVisual } from "@/lib/categoryVisual";

export default function WorksCarousel({ works }: { works: WorkCase[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = (card?.offsetWidth ?? 280) + 24;
    el.scrollBy({ left: step * direction, behavior: "smooth" });
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-xl font-bold sm:text-2xl">制作事例</h2>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="前の事例"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground/70 transition-colors hover:border-accent hover:text-accent"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="次の事例"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground/70 transition-colors hover:border-accent hover:text-accent"
            >
              →
            </button>
          </div>
          <Link href="/works" className="text-sm font-semibold text-accent hover:underline">
            すべて見る →
          </Link>
        </div>
      </div>

      <p className="mt-2 text-xs text-muted sm:hidden">← 横にスワイプしてほかの事例も見られます</p>

      <div
        ref={scrollerRef}
        className="mt-6 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2"
      >
        {works.map((work) => {
          const visual = categoryVisual(work.category);
          return (
            <div
              key={work.slug}
              data-card
              className={`w-[80%] shrink-0 snap-start overflow-hidden rounded-2xl border border-t-4 border-border bg-background sm:w-[calc((100%-3rem)/3)] ${visual.border}`}
            >
              <div className="p-6">
                <p className="text-xs font-semibold text-accent">{work.category}</p>
                <h3 className="mt-2 text-base font-semibold">{work.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{work.summary}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
