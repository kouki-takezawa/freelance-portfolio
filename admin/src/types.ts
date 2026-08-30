export type WorkCase = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  points: string[];
  isSample: boolean;
};

export type ServiceMenu = {
  slug: string;
  name: string;
  priceFrom: string;
  duration: string;
  description: string;
  scope: string[];
};

export const SNS_PLATFORMS = ["note", "Threads", "Instagram"] as const;
export type SnsPlatform = (typeof SNS_PLATFORMS)[number];

export type SnsPost = {
  key: string;
  id: string;
  platform: SnsPlatform;
  caption: string;
  body: string;
  status: "draft" | "posted";
  createdAt: number;
};

export type SeoEntry = {
  title: string;
  description: string;
};

export type SeoMap = Record<string, SeoEntry>;

export type BlogPost = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  publishedAt: string;
  body: string;
};

export const ORDER_STATUSES = ["見積もり中", "進行中", "納品済み", "キャンセル"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["未入金", "入金済み"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const ORDER_SERVICE_TYPES = [
  "HP制作",
  "LP制作",
  "システム・Webアプリ開発",
  "LINE公式アカウント構築",
  "その他",
] as const;

export type Order = {
  key: string;
  id: string;
  clientName: string;
  serviceType: string;
  amount: number;
  orderDate: string;
  dueDate: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paidDate: string;
  notes: string;
  createdAt: number;
};

export type InquiryReply = {
  message: string;
  sentAt: number;
};

export type Inquiry = {
  key: string;
  id: string;
  name: string;
  email: string;
  inquiryType: string;
  budget: string;
  message: string;
  receivedAt: number;
  read: boolean;
  replies: InquiryReply[];
};

export const SPARE_WORKS_ROWS = 2;
export const SPARE_SERVICES_ROWS = 1;
export const SPARE_BLOG_ROWS = 1;

export type DepartmentCode =
  | "kanri"
  | "eigyo"
  | "seisaku"
  | "marketing"
  | "sns"
  | "cs"
  | "somu";

export type DepartmentPhase = {
  name: string;
  description: string;
  requiresApproval: boolean;
  /** 担当するAI社員の役職名(例: PM AI, デザイナーAI) */
  role: string;
};

export type Department = {
  code: DepartmentCode;
  name: string;
  mission: string;
  phases: DepartmentPhase[];
};

// AI事業部の組織図。経営管理部が全部門の進捗・承認依頼を集約し、
// 各事業部の最終フェーズは必ず社長(人間)の承認を経てから実行される。
export const DEPARTMENTS: Department[] = [
  {
    code: "kanri",
    name: "経営管理部",
    mission: "全社の進捗・課題を収集し、社長の意思決定を支援する",
    phases: [
      { name: "日次モニタリング", description: "各部門の進捗・KPIを収集", requiresApproval: false, role: "PM AI" },
      { name: "課題・リスク抽出", description: "遅延やトラブルの兆候を検知", requiresApproval: false, role: "PM AI" },
      { name: "報告の集約", description: "社長への日次レポート・承認依頼をまとめる", requiresApproval: false, role: "PM AI" },
    ],
  },
  {
    code: "eigyo",
    name: "営業部",
    mission: "問い合わせ対応から受注獲得までを担当する",
    phases: [
      { name: "問い合わせ検知・一次分類", description: "案件種別・予算・緊急度を分類", requiresApproval: false, role: "営業AI" },
      { name: "ヒアリング・要件整理", description: "問い合わせ内容から要件を整理", requiresApproval: false, role: "営業AI" },
      { name: "見積もり・提案書ドラフト作成", description: "料金・納期の提案内容を作成", requiresApproval: false, role: "営業AI" },
      { name: "返信ドラフト作成", description: "お客様への返信文面を作成", requiresApproval: false, role: "営業AI" },
      { name: "送信・フォローアップ", description: "社長承認後にお客様へ送信", requiresApproval: true, role: "営業AI" },
    ],
  },
  {
    code: "seisaku",
    name: "制作部",
    mission: "HP・LP・システムの設計から納品までを担当する",
    phases: [
      { name: "要件定義", description: "受注内容を仕様に落とし込む", requiresApproval: false, role: "ディレクターAI" },
      { name: "デザイン", description: "ワイヤーフレーム・UI案を作成", requiresApproval: false, role: "デザイナーAI" },
      { name: "実装", description: "フロントエンド・バックエンドの実装", requiresApproval: false, role: "エンジニアAI" },
      { name: "QA・テスト", description: "動作確認・自動テストを実施", requiresApproval: false, role: "QA AI" },
      { name: "納品・デプロイ", description: "社長承認後に本番反映・納品", requiresApproval: true, role: "エンジニアAI" },
    ],
  },
  {
    code: "marketing",
    name: "マーケティング/SEO部",
    mission: "実績・SEO・お知らせを継続的に改善する",
    phases: [
      { name: "実績更新提案", description: "works.jsonの実績差し替えを提案", requiresApproval: false, role: "マーケターAI" },
      { name: "SEO改善提案", description: "タイトル・descriptionの改善案を作成", requiresApproval: false, role: "SEO AI" },
      { name: "お知らせ企画", description: "blog.jsonのお知らせ記事を企画", requiresApproval: false, role: "ライターAI" },
      { name: "公開・content更新", description: "社長承認後にcontent/*.jsonへ反映", requiresApproval: true, role: "マーケターAI" },
    ],
  },
  {
    code: "sns",
    name: "SNS部",
    mission: "note・Threads・Instagramでの発信を担当する",
    phases: [
      { name: "ネタ・トレンド収集", description: "各媒体の反応や話題を収集", requiresApproval: false, role: "SNS運用AI" },
      { name: "投稿文・画像案作成", description: "媒体ごとに投稿文・画像案をドラフト", requiresApproval: false, role: "クリエイティブAI" },
      { name: "投稿", description: "社長承認後に投稿を実行", requiresApproval: true, role: "SNS運用AI" },
    ],
  },
  {
    code: "cs",
    name: "カスタマーサクセス・保守部",
    mission: "納品後の稼働監視・サポート・契約更新を担当する",
    phases: [
      { name: "稼働監視", description: "サイトダウン・エラーを検知", requiresApproval: false, role: "保守AI" },
      { name: "一次対応案作成", description: "修正・更新依頼への対応案を作成", requiresApproval: false, role: "サポートAI" },
      { name: "契約更新提案", description: "更新・アップセルの提案を作成", requiresApproval: false, role: "カスタマーサクセスAI" },
      { name: "対応実施", description: "社長承認後に修正・更新を実施", requiresApproval: true, role: "保守AI" },
    ],
  },
  {
    code: "somu",
    name: "総務・経理部",
    mission: "請求・入金管理などバックオフィス業務を担当する",
    phases: [
      { name: "請求書ドラフト作成", description: "受注データから請求書案を作成", requiresApproval: false, role: "経理AI" },
      { name: "入金確認・催促案作成", description: "未入金の催促文面を作成", requiresApproval: false, role: "経理AI" },
      { name: "送付・記帳", description: "社長承認後に送付・記帳を実施", requiresApproval: true, role: "経理AI" },
    ],
  },
];

export type SidebarCounts = {
  unreadCount: number;
  overdueCount: number;
  snsDraftCount: number;
  unpaidCount: number;
  pendingTotal: number;
};

export type ActivityEntry = {
  key: string;
  at: number;
  actor: string;
  action: string;
  detail: string;
};

export const SEO_PAGES: { path: string; key: string; label: string }[] = [
  { path: "/", key: "home", label: "トップページ" },
  { path: "/services", key: "services", label: "サービス・料金" },
  { path: "/works", key: "works", label: "制作事例" },
  { path: "/about", key: "about", label: "プロフィール" },
  { path: "/blog", key: "blog", label: "お知らせ一覧" },
  { path: "/estimate", key: "estimate", label: "かんたん見積もり" },
  { path: "/contact", key: "contact", label: "お問い合わせ" },
  { path: "/privacy", key: "privacy", label: "プライバシーポリシー" },
];
