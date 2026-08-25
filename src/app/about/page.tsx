import type { Metadata } from "next";
import Link from "next/link";
import { getSeo } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const seo = getSeo("/about");

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
};

// TODO: 実際の経歴・スキルに合わせて内容を調整してください
const skills = [
  "Next.js / React",
  "TypeScript",
  "Tailwind CSS",
  "Cloudflare Workers",
  "業務システム・Webアプリ設計",
];

const values = [
  {
    title: "丁寧なヒアリング",
    description:
      "「何を作るか」の前に「何に困っているか」をお伺いします。最初から仕様が固まっていなくても大丈夫です。",
  },
  {
    title: "無理のない価格設定",
    description:
      "小規模事業者様が挑戦しやすいよう、必要な機能に絞って小さく始められる料金設定を心がけています。",
  },
  {
    title: "納品後も相談しやすい距離感",
    description:
      "作って終わりにせず、公開後の小さな修正や追加のご相談にも気軽に対応できる関係を大切にしています。",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <p className="text-sm font-semibold text-accent">About</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        プロフィール
      </h1>

      <div className="mt-8 flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent text-xl font-bold text-accent-foreground">
          Y
        </div>
        <div>
          <p className="text-lg font-bold">{siteConfig.siteName}</p>
          <p className="text-sm text-muted">HP・LP・システム/Webアプリ開発</p>
        </div>
      </div>

      {/* TODO: 実際の経歴・エピソードに差し替えてください */}
      <p className="mt-8 text-sm leading-relaxed text-muted sm:text-base">
        小さな会社や個人事業主の方ほど、「ホームページを作りたいけれど、何から頼めばいいかわからない」「大手の制作会社は敷居が高い」と感じやすいのではないでしょうか。ヨリソイワークスは、そうした事業者様に寄り添い、必要なものを必要な分だけ形にすることを大切にしています。
      </p>
      <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
        Web制作会社での実務経験を通じて、大きな組織では小回りの利きにくい「小規模事業者向けの、ちょうどいい規模の制作」に価値があると感じ、直接ご依頼いただける体制でサービスを提供しています。
      </p>

      <h2 className="mt-12 text-lg font-bold">対応技術</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-foreground/80"
          >
            {skill}
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">
        このサイト自体も上記の技術で構築・運用しています。
      </p>

      <h2 className="mt-12 text-lg font-bold">大切にしていること</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        {values.map((item) => (
          <div key={item.title}>
            <h3 className="text-sm font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl bg-surface p-8 text-center">
        <h2 className="text-lg font-bold">まずはお気軽にご相談ください</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          ご相談・お見積りは無料です。現状のお悩みをお聞かせください。
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
