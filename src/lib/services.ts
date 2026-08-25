export type ServiceMenu = {
  slug: string;
  name: string;
  priceFrom: string;
  duration: string;
  description: string;
  scope: string[];
};

// TODO: 実際の受注実績が増えたら、金額感を見直してください（現時点では目安の一般的な相場です）
export const services: ServiceMenu[] = [
  {
    slug: "hp",
    name: "HP制作",
    priceFrom: "150,000円〜",
    duration: "納期目安 3〜4週間",
    description:
      "会社・店舗・個人事業主向けのコーポレートサイトを制作します。スマホでの見やすさとGoogle検索での見つけやすさを重視します。",
    scope: [
      "トップページ + 下層ページ(5ページ程度)",
      "スマートフォン対応レイアウト",
      "お問い合わせフォーム設置",
      "基本的なSEO設定(タイトル・description等)",
    ],
  },
  {
    slug: "lp",
    name: "LP制作",
    priceFrom: "100,000円〜",
    duration: "納期目安 2〜3週間",
    description:
      "新商品・サービスの申込や問い合わせを獲得するための1ページ完結型サイトを制作します。訴求構成のご相談から対応します。",
    scope: [
      "1ページ構成のランディングページ",
      "申込・問い合わせフォーム設置",
      "表示速度を意識した軽量な実装",
      "簡易アクセス解析の導入",
    ],
  },
  {
    slug: "system",
    name: "システム・Webアプリ開発",
    priceFrom: "50,000円〜",
    duration: "納期目安 2週間〜(内容により変動)",
    description:
      "予約管理・顧客管理・社内業務効率化などの業務システムから、簡易な業務ツール・Webアプリまで幅広く対応します。小規模なものなら5万円からご相談いただけます。要件のヒアリングから設計します。",
    scope: [
      "要件ヒアリング・設計",
      "簡易ツール〜本格的な業務システムまで規模に応じて対応",
      "管理画面を含むシステム・Webアプリ開発",
      "既存業務フローに合わせたカスタマイズ",
      "リリース後の運用相談",
    ],
  },
];
