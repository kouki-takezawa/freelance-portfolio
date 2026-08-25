import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, getBlogPost } from "@/lib/blog";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const paragraphs = post.body.split("\n\n").filter(Boolean);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
      <Link href="/blog" className="text-sm font-semibold text-accent hover:underline">
        ← お知らせ一覧へ
      </Link>
      <p className="mt-6 text-xs text-muted">{formatDate(post.publishedAt)}</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
        {post.title}
      </h1>

      <div className="mt-8 flex flex-col gap-5">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-sm leading-relaxed text-foreground/90 sm:text-base">
            {p}
          </p>
        ))}
      </div>

      <div className="mt-16 rounded-2xl bg-surface p-8 text-center">
        <h2 className="text-lg font-bold">まずはお気軽にご相談ください</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          ご相談・お見積りは無料です。
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-block rounded-full bg-accent px-8 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          お問い合わせフォームへ
        </Link>
      </div>
    </div>
  );
}
