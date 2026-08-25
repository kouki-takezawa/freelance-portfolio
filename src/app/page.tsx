import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { services } from "@/lib/services";
import { works } from "@/lib/works";

const strengths = [
  {
    title: "小規模事業者に寄り添う制作",
    description:
      "大手には頼みにくい、小さな要望や予算感にも柔軟に対応します。何から始めればよいかわからない状態からのご相談も歓迎です。",
  },
  {
    title: "HP・LPからシステムまで一貫対応",
    description:
      "サイト制作だけでなく、予約管理や業務効率化のためのシステム開発まで、事業の成長段階に合わせて相談できます。",
  },
  {
    title: "平日夜間・土日でも連絡可能",
    description:
      "普段は別の仕事をしているからこそ、事業者側の「営業時間外に相談したい」というニーズに合わせやすい体制です。",
  },
];

export default function Home() {
  return (
    <div>
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <p className="text-sm font-semibold tracking-wide text-accent">
          HP制作・LP制作・業務システム開発
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
          小さな会社・個人事業主の「困った」を、
          <br className="hidden sm:block" />
          ちょうどいい規模のWeb制作で解決します。
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          {siteConfig.description}
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/contact"
            className="rounded-full bg-accent px-7 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            無料で相談する
          </Link>
          <Link
            href="/services"
            className="rounded-full border border-border px-7 py-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
          >
            サービス・料金を見る
          </Link>
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <h2 className="text-xl font-bold sm:text-2xl">選ばれる理由</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {strengths.map((item) => (
              <div key={item.title}>
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-bold sm:text-2xl">サービス・料金</h2>
          <Link
            href="/services"
            className="text-sm font-semibold text-accent hover:underline"
          >
            すべて見る →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.slug}
              className="rounded-2xl border border-border p-6"
            >
              <h3 className="text-base font-semibold">{service.name}</h3>
              <p className="mt-2 text-lg font-bold text-accent">
                {service.priceFrom}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-xl font-bold sm:text-2xl">制作事例</h2>
            <Link
              href="/works"
              className="text-sm font-semibold text-accent hover:underline"
            >
              すべて見る →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {works.slice(0, 3).map((work) => (
              <div
                key={work.slug}
                className="rounded-2xl border border-border bg-background p-6"
              >
                <p className="text-xs font-semibold text-accent">
                  {work.category}
                </p>
                <h3 className="mt-2 text-base font-semibold">{work.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {work.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 sm:py-24 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          まずはお気軽にご相談ください
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
          「何をどこまで頼めるのかわからない」という段階でも問題ありません。
          <br className="hidden sm:block" />
          現状のお悩みをお聞かせいただければ、進め方をご提案します。
        </p>
        <div className="mt-8">
          <Link
            href="/contact"
            className="inline-block rounded-full bg-accent px-8 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            お問い合わせフォームへ
          </Link>
        </div>
      </section>
    </div>
  );
}
