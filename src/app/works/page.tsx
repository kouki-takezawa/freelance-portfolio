import type { Metadata } from "next";
import Link from "next/link";
import { works } from "@/lib/works";
import { getSeo } from "@/lib/seo";

const seo = getSeo("/works");

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
};

export default function WorksPage() {
  const hasSampleOnly = works.every((work) => work.isSample);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <p className="text-sm font-semibold text-accent">Works</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        制作事例
      </h1>

      {hasSampleOnly && (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          現在準備中のため、対応可能な制作イメージを事例形式でご紹介しています。実績が公開でき次第、随時追加していきます。
        </p>
      )}

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        {works.map((work) => (
          <div
            key={work.slug}
            className="rounded-2xl border border-border p-8"
          >
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-accent">
                {work.category}
              </span>
              {work.isSample && (
                <span className="text-xs text-muted">対応イメージ</span>
              )}
            </div>
            <h2 className="mt-4 text-lg font-bold">{work.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {work.summary}
            </p>
            <ul className="mt-5 flex flex-col gap-2">
              {work.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2 text-sm text-foreground/90"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-sm leading-relaxed text-muted">
          同様のご相談や、上記に近いイメージのご依頼を検討中の方はお気軽にご連絡ください。
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
