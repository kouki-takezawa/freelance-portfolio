"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import type { WorkCase } from "@/lib/works";
import { categoryVisual } from "@/lib/categoryVisual";
import WorkBanner from "@/components/illustrations/WorkBanner";

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
        role="region"
        aria-label="制作事例一覧(横スクロール)"
        tabIndex={0}
        className="mt-6 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        {works.map((work, i) => {
          const visual = categoryVisual(work.category);
          return (
            <motion.div
              key={work.slug}
              data-card
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              whileHover={{ y: -6 }}
              className={`group w-[80%] shrink-0 snap-start overflow-hidden rounded-2xl border border-t-4 border-border bg-background shadow-sm transition-shadow hover:shadow-lg sm:w-[calc((100%-3rem)/3)] ${visual.border}`}
            >
              <div className={`h-32 overflow-hidden ${visual.bg} text-accent`}>
                <motion.div
                  className="h-full w-full"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <WorkBanner kind={visual.icon} />
                </motion.div>
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold text-accent">{work.category}</p>
                <h3 className="mt-2 text-base font-semibold">{work.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{work.summary}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
