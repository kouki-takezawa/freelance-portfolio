import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { services } from "@/lib/services";
import { works } from "@/lib/works";
import HeroIllustration from "@/components/illustrations/HeroIllustration";
import ServiceIcon from "@/components/illustrations/ServiceIcon";
import { blogPosts } from "@/lib/blog";
import WorksCarousel from "@/components/WorksCarousel";
import TapIcon from "@/components/decor/TapIcon";
import WaveDivider from "@/components/decor/WaveDivider";
import Reveal from "@/components/Reveal";
import { CountUp, AnimatedPrice } from "@/components/CountUp";

const jumpLinks = [
  { href: "#strengths", label: "選ばれる理由" },
  { href: "#services", label: "サービス・料金" },
  { href: "#flow", label: "ご依頼の流れ" },
  { href: "#works", label: "制作事例" },
  { href: "#blog", label: "お知らせ" },
  { href: "#faq", label: "よくある質問" },
];

const strengths = [
  {
    title: "フリーランス相場より抑えた明朗料金",
    description:
      "LINE公式アカウント構築は3万円、システム・Webアプリ開発は5万円から対応可能。必要な機能に絞って小さく始められるので、大きな予算がなくても相談しやすい料金設定です。",
  },
  {
    title: "小規模事業者に寄り添う制作",
    description:
      "大手には頼みにくい、小さな要望や予算感にも柔軟に対応します。何から始めればよいかわからない状態からのご相談も歓迎です。",
  },
  {
    title: "HP・LPからWebアプリ・LINE運用まで一貫対応",
    description:
      "サイト制作だけでなく、予約管理システムの開発や、集客に役立つLINE公式アカウントの構築まで、事業の成長段階に合わせて相談できます。",
  },
  {
    title: "平日夜間・土日でも連絡可能",
    description:
      "日中は連絡が取りづらい事業者様にも合わせやすいよう、平日夜間や土日でもご相談・お打ち合わせを承っています。",
  },
];

const iconKinds = ["hp", "lp", "system", "line"] as const;

function parsePrice(priceFrom: string): number {
  const digits = priceFrom.replace(/[^0-9]/g, "");
  return digits ? Number(digits) : Infinity;
}

const cheapestServiceSlug = services.reduce((min, s) =>
  parsePrice(s.priceFrom) < parsePrice(min.priceFrom) ? s : min
).slug;

const processSteps = [
  {
    step: "01",
    title: "お問い合わせ",
    description:
      "フォームより、現状のお悩みや「こんなことができないか」というご相談をお気軽にお送りください。",
  },
  {
    step: "02",
    title: "ヒアリング・お見積り",
    description:
      "内容や予算感を詳しくお伺いし、進め方と料金の目安を無料でご提示します。ここまでは費用がかかりません。",
  },
  {
    step: "03",
    title: "制作・開発",
    description:
      "ご要望に沿って設計・制作を進めます。完成まで丸投げにせず、進捗をこまめに共有しながら進めます。",
  },
  {
    step: "04",
    title: "納品・アフターサポート",
    description:
      "公開後も一定期間は修正に対応します。継続的な更新や保守運用が必要な場合も、別途ご相談いただけます。",
  },
];

// 表示順は心理的優先度で調整: 最大の懸念(品質)を最初に解消し、
// 参入障壁(相談の気軽さ)を早めに下げ、最後は安心感で締める
const faqs = [
  {
    q: "相場より料金が安いようですが、品質は大丈夫ですか？",
    a: "制作会社や仲介エージェントを介さず直接ご依頼いただく分の中間コストを料金に還元しているため、相場より抑えた価格でご提供できています。品質を落として安くしているわけではありませんので、ご安心ください。",
  },
  {
    q: "何を依頼すればいいか、まだ決まっていません。相談だけでも大丈夫ですか？",
    a: "もちろん問題ありません。現状の課題やご希望をお伺いした上で、HP・LP・システムのどれが適しているか、進め方も含めてご提案しますので、まずはお気軽にご相談ください。",
  },
  {
    q: "対応エリアはどこですか？地方でも依頼できますか？",
    a: "リモート対応のため全国どこからでもご依頼いただけます。打ち合わせはオンライン(ビデオ通話・チャット・メール)が中心です。栃木県内であれば対面でのご相談も可能です。",
  },
  {
    q: "支払いのタイミングや方法は？",
    a: "案件の規模に応じてご相談しますが、基本的には着手時に一部、納品時に残額をお支払いいただく形が中心です。銀行振込に対応しています。分割のご相談も可能です。",
  },
  {
    q: "納品後の修正や更新もお願いできますか？",
    a: "納品後一定期間は軽微な修正に無料で対応します。継続的な更新代行や保守運用が必要な場合は、別途プランをご提案します。",
  },
  {
    q: "対応可能な時間帯を教えてください",
    a: "ご相談・お打ち合わせは主に平日夜間・土日を中心に承っています。お問い合わせフォームやメールでのご連絡はいつでも受け付けており、返信は原則2営業日以内を目安にしています。納期はスケジュールを事前にすり合わせた上で進めますのでご安心ください。",
  },
];

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden bg-[radial-gradient(circle,_var(--color-border)_1px,_transparent_1px)] bg-[length:24px_24px]">
        <div
          className="blob-drift pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="blob-drift pointer-events-none absolute -right-16 top-1/3 h-80 w-80 rounded-full bg-sky-400/30 blur-3xl"
          style={{ animationDelay: "-7s" }}
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-6 pt-16 pb-16 sm:pt-24 sm:pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6">
          <div>
            <p className="text-sm font-semibold tracking-wide text-accent">
              HP制作・LP制作・業務システム/Webアプリ開発・LINE公式アカウント構築
            </p>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              「ホームページが欲しい」を、
              <br className="hidden sm:block" />
              ちょうどいい規模と価格で形にします。
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              {siteConfig.description}
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-accent">
              <span className="rounded-full bg-accent/10 px-4 py-1.5">
                相談・お見積り無料
              </span>
            </div>
            <div className="mt-8">
              <Link
                href="/contact"
                className="btn-shimmer relative inline-block overflow-hidden rounded-full bg-gradient-to-r from-accent to-sky-600 px-9 py-4 text-base font-bold text-accent-foreground shadow-sm transition-transform hover:scale-[1.02]"
              >
                無料で相談する →
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <Link
                href="/services"
                className="font-semibold text-foreground/70 underline decoration-border underline-offset-4 transition-colors hover:text-accent"
              >
                サービス・料金を見る
              </Link>
              <Link
                href="/estimate"
                className="font-semibold text-foreground/70 underline decoration-border underline-offset-4 transition-colors hover:text-accent"
              >
                かんたん見積もりを試す
              </Link>
            </div>
          </div>
          <div className="lg:pl-4">
            <HeroIllustration />
          </div>
        </div>
        <div className="hidden justify-center pb-6 sm:flex">
          <a
            href="#strengths"
            aria-label="下にスクロールして詳細を見る"
            className="flex h-9 w-9 animate-bounce items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </a>
        </div>
      </section>

      <nav
        aria-label="ページ内ナビゲーション"
        className="hidden border-b border-border bg-surface sm:block"
      >
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-6 py-2.5 text-xs font-semibold">
          {jumpLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-foreground/70 transition-colors hover:bg-surface hover:text-accent"
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>

      <WaveDivider className="bg-background text-surface" />
      <section id="strengths" className="bg-surface">
        <Reveal className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="flex items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <TapIcon kind="spark" />
              <h2 className="font-display text-xl font-bold sm:text-2xl">選ばれる理由</h2>
            </div>
            <Link
              href="/about"
              className="text-sm font-semibold text-accent hover:underline"
            >
              運営者について →
            </Link>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {strengths.map((item, i) => (
              <div key={item.title}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                  {i + 1}
                </span>
                <h3 className="mt-3 text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <WaveDivider className="bg-surface text-background" />
      <section id="services" className="bg-background">
        <Reveal className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-xl font-bold sm:text-2xl">サービス・料金</h2>
            <Link
              href="/services"
              className="text-sm font-semibold text-accent hover:underline"
            >
              すべて見る →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, i) => {
              const isCheapest = service.slug === cheapestServiceSlug;
              return (
                <div
                  key={service.slug}
                  className={`relative rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                    isCheapest ? "border-accent bg-accent/5 shadow-sm" : "border-border"
                  }`}
                >
                  {isCheapest && (
                    <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                      はじめやすい
                    </span>
                  )}
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <ServiceIcon kind={iconKinds[i] ?? "hp"} />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{service.name}</h3>
                  <p className="mt-2 text-lg font-bold text-accent">
                    <AnimatedPrice priceFrom={service.priceFrom} />
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Reveal>
      </section>

      <WaveDivider className="bg-background text-surface" />
      <section id="flow" className="bg-surface">
        <Reveal className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="flex items-center gap-3">
            <TapIcon kind="route" />
            <h2 className="font-display text-xl font-bold sm:text-2xl">ご依頼の流れ</h2>
          </div>
          <p className="mt-2 text-sm text-muted">
            お問い合わせからご相談・お見積りまでは無料です。
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((item, i) => (
              <div key={item.step} className="relative">
                <span className="text-3xl font-bold text-accent/60">
                  <CountUp value={i + 1} pad={2} />
                </span>
                <h3 className="mt-2 text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <WaveDivider className="bg-surface text-background" />
      <section id="works" className="bg-background">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <WorksCarousel works={works} />
        </div>
      </section>

      {blogPosts.length > 0 && (
        <section id="blog" className="bg-background">
          <Reveal className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-xl font-bold sm:text-2xl">お知らせ</h2>
              <Link
                href="/blog"
                className="text-sm font-semibold text-accent hover:underline"
              >
                すべて見る →
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {blogPosts.slice(0, 2).map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:bg-background hover:shadow-lg"
                >
                  <span className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-accent">
                    {post.category}
                  </span>
                  <h3 className="mt-3 text-base font-semibold">{post.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {post.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      <WaveDivider className="bg-background text-surface" />
      <section id="faq" className="bg-surface">
        <Reveal className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <div className="flex items-center gap-3">
            <TapIcon kind="question" />
            <h2 className="font-display text-xl font-bold sm:text-2xl">よくあるご質問</h2>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-border bg-background p-5 open:shadow-sm"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold marker:content-none">
                  <span className="flex items-start justify-between gap-4">
                    <span>{item.q}</span>
                    <span className="mt-0.5 shrink-0 text-accent transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <div className="accordion-content">
                  <div>
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {item.a}
                    </p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      <WaveDivider className="bg-surface text-background" />
      <section className="bg-background">
        <Reveal className="mx-auto max-w-5xl px-6 py-16 sm:py-24 text-center">
          <div className="flex items-center justify-center gap-3">
            <TapIcon kind="message" />
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              まずはお気軽にご相談ください
            </h2>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
            「何をどこまで頼めるのかわからない」という段階でも問題ありません。
            <br className="hidden sm:block" />
            現状のお悩みをお聞かせいただければ、進め方と料金の目安をご提案します。
          </p>
          <div className="mt-8">
            <Link
              href="/contact"
              className="btn-shimmer relative inline-block overflow-hidden rounded-full bg-gradient-to-r from-accent to-sky-600 px-8 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.02]"
            >
              お問い合わせフォームへ
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
