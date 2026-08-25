import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/lib/services";
import { getSeo } from "@/lib/seo";
import ServiceIcon from "@/components/illustrations/ServiceIcon";
import Breadcrumbs from "@/components/Breadcrumbs";

const seo = getSeo("/services");
const iconKinds = ["hp", "lp", "system"] as const;

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

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <Breadcrumbs items={[{ label: "サービス・料金" }]} />
      <p className="mt-4 text-sm font-semibold text-accent">Services</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        サービス・料金
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
        以下は目安の料金です。事業内容やご要望によって前後しますので、まずはお気軽にご相談ください。相談・お見積りは無料です。
      </p>

      <div className="mt-12 flex flex-col gap-8">
        {services.map((service, i) => (
          <div
            key={service.slug}
            className="rounded-2xl border border-border p-8"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <ServiceIcon kind={iconKinds[i] ?? "hp"} />
                </span>
                <h2 className="text-xl font-bold">{service.name}</h2>
              </div>
              <div className="sm:text-right">
                <p className="text-lg font-bold text-accent">
                  {service.priceFrom}
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
        ))}
      </div>

      <div className="mt-16">
        <h2 className="text-lg font-bold sm:text-xl">よくある制作会社との違い</h2>
        <p className="mt-2 text-sm text-muted">
          仲介会社を挟まず直接ご依頼いただくことで、価格と柔軟さの両方を実現しています。
        </p>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
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
                  <td className="p-4 text-muted">{row.others}</td>
                  <td className="p-4 font-semibold text-accent">{row.us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-16 rounded-2xl bg-surface p-8 text-center">
        <h2 className="text-lg font-bold sm:text-xl">
          上記に当てはまらないご相談も歓迎です
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          既存サイトの改修、機能追加、保守運用など、まずは内容をお聞かせください。
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-block rounded-full bg-accent px-8 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          無料で相談する
        </Link>
      </div>
    </div>
  );
}
