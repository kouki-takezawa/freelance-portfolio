import type { Metadata } from "next";
import { blogPosts } from "@/lib/blog";
import { getSeo } from "@/lib/seo";
import BlogList from "@/components/BlogList";
import Breadcrumbs from "@/components/Breadcrumbs";

const seo = getSeo("/blog");

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
};

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <Breadcrumbs items={[{ label: "お知らせ" }]} />
      <p className="mt-4 text-sm font-semibold text-accent">Blog</p>
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
        <BlogList posts={blogPosts} />
      )}
    </div>
  );
}
