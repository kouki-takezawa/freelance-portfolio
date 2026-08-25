import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/lib/services";

export const metadata: Metadata = {
  title: "サービス・料金",
  description:
    "HP制作・LP制作・業務システム開発の料金目安と対応範囲をご紹介します。",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <p className="text-sm font-semibold text-accent">Services</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        サービス・料金
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
        以下は目安の料金です。事業内容やご要望によって前後しますので、まずはお気軽にご相談ください。相談・お見積りは無料です。
      </p>

      <div className="mt-12 flex flex-col gap-8">
        {services.map((service) => (
          <div
            key={service.slug}
            className="rounded-2xl border border-border p-8"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="text-xl font-bold">{service.name}</h2>
              <div className="text-right">
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
