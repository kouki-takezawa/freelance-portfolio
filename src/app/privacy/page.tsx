import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "当サイトにおける個人情報の取り扱いについて",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        プライバシーポリシー
      </h1>
      <p className="mt-6 text-sm leading-relaxed text-muted">
        {siteConfig.siteName}(以下「当方」といいます)は、本ウェブサイト(以下「本サイト」といいます)における個人情報の取り扱いについて、以下のとおりプライバシーポリシーを定めます。
      </p>

      <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-base font-bold">1. 取得する情報</h2>
          <p className="mt-2 text-muted">
            本サイトのお問い合わせフォームでは、お名前、メールアドレス、お問い合わせ内容などの情報をご入力いただきます。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold">2. 利用目的</h2>
          <p className="mt-2 text-muted">
            取得した情報は、お問い合わせへの回答、ご依頼内容の確認・ご案内のためにのみ利用し、目的外の利用は行いません。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold">3. 第三者への提供</h2>
          <p className="mt-2 text-muted">
            法令に基づく場合を除き、ご本人の同意なく取得した情報を第三者に提供することはありません。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold">4. アクセス解析について</h2>
          <p className="mt-2 text-muted">
            本サイトでは、サービス改善のためCloudflare Web
            Analyticsを利用する場合があります。これはCookieを使用せず、個人を特定する情報を収集しないアクセス解析ツールです。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold">5. 情報の管理</h2>
          <p className="mt-2 text-muted">
            取得した個人情報は、適切な管理のもとで保管し、漏えい・滅失・毀損の防止に努めます。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold">6. お問い合わせ</h2>
          <p className="mt-2 text-muted">
            本ポリシーに関するお問い合わせは、お問い合わせフォームよりご連絡ください。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold">7. 改定</h2>
          <p className="mt-2 text-muted">
            本ポリシーの内容は、必要に応じて予告なく変更することがあります。
          </p>
        </section>
      </div>
    </div>
  );
}
