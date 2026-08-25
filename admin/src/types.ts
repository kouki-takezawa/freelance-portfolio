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
