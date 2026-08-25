import type { Metadata } from "next";
import { Suspense } from "react";
import ContactForm from "@/components/ContactForm";
import LineButton from "@/components/LineButton";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getSeo } from "@/lib/seo";

const seo = getSeo("/contact");

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
      <Breadcrumbs items={[{ label: "お問い合わせ" }]} />
      <p className="mt-4 text-sm font-semibold text-accent">Contact</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        お問い合わせ
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
        HP制作・LP制作・システム/Webアプリ開発・LINE公式アカウント構築について、ご相談・お見積りは無料です。「何から頼めばいいかわからない」という段階でも構いませんので、以下のフォームよりお気軽にご連絡ください。2営業日以内を目安にご返信します。
      </p>

      <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground/80">
          フォームのほか、公式LINEからも気軽にご相談いただけます。
        </p>
        <LineButton className="shrink-0 px-4 py-2 text-xs" />
      </div>

      <div className="mt-10">
        <Suspense>
          <ContactForm />
        </Suspense>
      </div>
    </div>
  );
}
