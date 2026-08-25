import type { Metadata } from "next";
import { getSeo } from "@/lib/seo";
import EstimateSimulator from "@/components/EstimateSimulator";
import Breadcrumbs from "@/components/Breadcrumbs";

const seo = getSeo("/estimate");

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
};

export default function EstimatePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
      <Breadcrumbs items={[{ label: "かんたん見積もり" }]} />
      <p className="mt-4 text-sm font-semibold text-accent">Estimate</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        かんたん見積もりシミュレーター
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
        ご依頼内容を選ぶだけで、料金の目安がその場でわかります。正式なお見積りは無料ですので、まずは気軽にお試しください。
      </p>

      <div className="mt-10">
        <EstimateSimulator />
      </div>
    </div>
  );
}
