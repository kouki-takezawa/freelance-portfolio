import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { getSeo } from "@/lib/seo";

const seo = getSeo("/contact");

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
      <p className="text-sm font-semibold text-accent">Contact</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        お問い合わせ
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
        HP制作・LP制作・システム/Webアプリ開発について、ご相談・お見積りは無料です。「何から頼めばいいかわからない」という段階でも構いませんので、以下のフォームよりお気軽にご連絡ください。2営業日以内を目安にご返信します。
      </p>

      <div className="mt-10">
        <ContactForm />
      </div>
    </div>
  );
}
