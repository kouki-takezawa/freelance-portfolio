export const siteConfig = {
  // TODO: 独自ドメインを取得したら siteUrl を差し替えてください
  siteUrl: "https://freelance-hp.yorisoi-works.workers.dev",
  siteName: "ヨリソイワークス",
  siteNameShort: "ヨリソイワークス",
  tagline: "小さな会社・個人事業主のためのHP・LP・業務システム・LINE公式アカウント構築",
  description:
    "HP制作、LP制作、Webアプリ・業務システムの開発、LINE公式アカウント構築を、フリーランス相場より抑えた料金で行っています。栃木県を拠点にリモート対応、まずはお気軽にご相談ください。",
  email: "TODO@example.com", // TODO: 問い合わせ送信先メールアドレスを設定
  lineUrl: "https://lin.ee/TQSTklX",
  threadsUrl: "https://www.threads.net/@TODO", // TODO: スレッズのアカウントURLを設定
  instagramUrl: "https://www.instagram.com/TODO", // TODO: インスタグラムのアカウントURLを設定
  webAnalyticsToken: "41c46914ed57468e9603af4704b3119f",
  serviceArea: "全国対応(リモート) / 栃木県内は対面相談も可能",
  // ヘッダーに表示する主要ナビ(絞り込み済み)
  primaryNavLinks: [
    { href: "/services", label: "サービス・料金" },
    { href: "/works", label: "制作事例" },
    { href: "/blog", label: "お知らせ" },
    { href: "/contact", label: "お問い合わせ" },
  ],
  // フッター・モバイルメニューに表示する全ページ
  navLinks: [
    { href: "/", label: "トップ" },
    { href: "/services", label: "サービス・料金" },
    { href: "/works", label: "制作事例" },
    { href: "/estimate", label: "かんたん見積もり" },
    { href: "/blog", label: "お知らせ" },
    { href: "/about", label: "プロフィール" },
    { href: "/contact", label: "お問い合わせ" },
  ],
} as const;
