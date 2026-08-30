import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/lib/services";
import { getSeo } from "@/lib/seo";
import ServiceIcon from "@/components/illustrations/ServiceIcon";
import Breadcrumbs from "@/components/Breadcrumbs";
import TapIcon from "@/components/decor/TapIcon";
import Reveal from "@/components/Reveal";
import { AnimatedPrice } from "@/components/CountUp";

const seo = getSeo("/services");
const iconKinds = ["hp", "lp", "system", "line"] as const;

function parsePrice(priceFrom: string): number {
  const digits = priceFrom.replace(/[^0-9]/g, "");
  return digits ? Number(digits) : Infinity;
}

const cheapestServiceSlug = services.reduce((min, s) =>
  parsePrice(s.priceFrom) < parsePrice(min.priceFrom) ? s : min
).slug;

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
};

const comparisonRows = [
  { label: "料金", others: "仲介マージンが上乗せされがち", us: "直接依頼で中間コストなし" },
  { label: "やり取りの相手", others: "営業担当経由で制作者と直接話せないことも", us: "制作者本人と直接やり取り" },
  { label: "見積り・相談", others: "有料の場合がある", us: "無料" },
  { label: "対応の柔軟さ", others: "決まったプラン内での対応が中心", us: "予算・要望に応じて内容を調整" },
];

function CrossIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10.5l4 4L16 6" />
    </svg>
  );
}

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <Reveal>
        <Breadcrumbs items={[{ label: "サービス・料金" }]} />
        <p className="mt-4 text-sm font-semibold text-accent">Services</p>
        <div className="mt-3 flex items-center gap-3">
          <TapIcon kind="tag" />
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            サービス・料金
          </h1>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          以下は目安の料金です。事業内容やご要望によって前後しますので、まずはお気軽にご相談ください。相談・お見積りは無料です。
        </p>
      </Reveal>

      <div className="mt-12 flex flex-col gap-8">
        {services.map((service, i) => {
          const isCheapest = service.slug === cheapestServiceSlug;
          return (
          <Reveal key={service.slug} delay={i * 0.05}>
            <div
              className={`relative rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                isCheapest ? "border-accent bg-accent/5 shadow-sm" : "border-border"
              }`}
            >
              {isCheapest && (
                <span className="absolute -top-3 left-8 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                  はじめやすい
                </span>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <ServiceIcon kind={iconKinds[i] ?? "hp"} />
                  </span>
                  <h2 className="text-xl font-bold">{service.name}</h2>
                </div>
                <div className="sm:text-right">
                  <p className="text-lg font-bold text-accent">
                    <AnimatedPrice priceFrom={service.priceFrom} />
                  </p>
                  <p className="text-xs text-muted">{service.duration}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
                {service.description}
              </p>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {service.scope.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-foreground/90"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          );
        })}
      </div>

      <Reveal className="mt-16">
        <h2 className="font-display text-lg font-bold sm:text-xl">よくある制作会社との違い</h2>
        <p className="mt-2 text-sm text-muted">
          仲介会社を挟まず直接ご依頼いただくことで、価格と柔軟さの両方を実現しています。
        </p>
        <p className="mt-4 text-xs text-muted sm:hidden">← 横にスクロールして全体を確認できます</p>
        <div className="relative mt-2 sm:mt-6">
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="bg-surface text-left">
                  <th className="p-4 font-semibold text-foreground/70">比較項目</th>
                  <th className="p-4 font-semibold text-foreground/70">一般的な制作会社</th>
                  <th className="p-4 font-semibold text-accent">ヨリソイワークス</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.label} className="border-t border-border">
                    <td className="p-4 font-semibold">{row.label}</td>
                    <td className="p-4 text-muted">
                      <span className="flex items-start gap-2">
                        <CrossIcon />
                        {row.others}
                      </span>
                    </td>
                    <td className="bg-accent/5 p-4 font-semibold text-accent">
                      <span className="flex items-start gap-2">
                        <CheckIcon />
                        {row.us}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 rounded-r-2xl bg-gradient-to-l from-background to-transparent sm:hidden" />
        </div>
      </Reveal>

      <Reveal className="mt-16 rounded-2xl bg-surface p-8 text-center">
        <h2 className="font-display text-lg font-bold sm:text-xl">
          上記に当てはまらないご相談も歓迎です
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          既存サイトの改修、機能追加、保守運用など、まずは内容をお聞かせください。
        </p>
        <Link
          href="/contact"
          className="btn-shimmer relative mt-6 inline-block overflow-hidden rounded-full bg-gradient-to-r from-accent to-sky-600 px-8 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.02]"
        >
          無料で相談する
        </Link>
      </Reveal>
    </div>
  );
}
