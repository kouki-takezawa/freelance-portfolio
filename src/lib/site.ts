// TODO: 屋号が決まったら siteName / siteNameShort を屋号に差し替えてください（現在はgit設定から取得した氏名を仮表示しています）
export const siteConfig = {
  siteName: "竹澤光輝",
  siteNameShort: "竹澤光輝",
  tagline: "小さな会社・個人事業主のためのHP・LP・業務システム開発",
  description:
    "HP制作、LP制作、業務効率化システムの開発を行っています。栃木県を拠点にリモート対応、まずはお気軽にご相談ください。",
  email: "TODO@example.com", // TODO: 問い合わせ送信先メールアドレスを設定
  navLinks: [
    { href: "/", label: "トップ" },
    { href: "/services", label: "サービス・料金" },
    { href: "/works", label: "制作事例" },
    { href: "/contact", label: "お問い合わせ" },
  ],
} as const;
