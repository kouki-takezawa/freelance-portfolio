import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/blog";
import { getSeo } from "@/lib/seo";

const seo = getSeo("/blog");

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <p className="text-sm font-semibold text-accent">Blog</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        お知らせ
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
        ホームページ制作やシステム開発に関するお役立ち情報をお届けします。
      </p>

      {blogPosts.length === 0 ? (
        <p className="mt-12 text-sm text-muted">
          現在準備中です。しばらくお待ちください。
        </p>
      ) : (
        <div className="mt-10 flex flex-col gap-6">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block rounded-2xl border border-border p-6 transition-colors hover:border-accent"
            >
              <p className="text-xs text-muted">{formatDate(post.publishedAt)}</p>
              <h2 className="mt-2 text-lg font-bold">{post.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {post.excerpt}
              </p>
              <span className="mt-3 inline-block text-sm font-semibold text-accent">
                続きを読む →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
