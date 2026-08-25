"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { BlogPost } from "@/lib/blog";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function BlogList({ posts }: { posts: BlogPost[] }) {
  const categories = useMemo(
    () => [...new Set(posts.map((p) => p.category))],
    [posts]
  );
  const [active, setActive] = useState<string | null>(null);

  const filtered = active ? posts.filter((p) => p.category === active) : posts;

  return (
    <div>
      {categories.length > 1 && (
        <div className="mt-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActive(null)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
              active === null
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border text-foreground/70 hover:border-accent"
            }`}
          >
            すべて
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                active === cat
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border text-foreground/70 hover:border-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-6">
        {filtered.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded-2xl border border-border p-6 transition-colors hover:border-accent"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className="rounded-full bg-surface px-2.5 py-1 font-semibold text-accent">
                {post.category}
              </span>
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <h2 className="mt-3 text-lg font-bold">{post.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{post.excerpt}</p>
            <span className="mt-3 inline-block text-sm font-semibold text-accent">
              続きを読む →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
