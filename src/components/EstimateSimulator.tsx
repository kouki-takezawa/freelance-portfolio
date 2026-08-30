"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { services } from "@/lib/services";
import { useAnimatedNumber } from "@/components/CountUp";

type ServiceType = "hp" | "lp" | "system" | "line";

type Option = {
  id: string;
  label: string;
  price: number;
};

const SERVICES: {
  type: ServiceType;
  label: string;
  base: number;
  options: Option[];
}[] = [
  {
    type: "hp",
    label: "HP制作",
    base: 100000,
    options: [
      { id: "hp-blog", label: "お知らせ・ブログ機能を追加したい", price: 50000 },
      { id: "hp-pages", label: "6ページ以上の追加ページが必要", price: 30000 },
      { id: "hp-form", label: "予約・申込など高度なフォームが必要", price: 30000 },
      { id: "hp-multilang", label: "多言語対応にしたい", price: 40000 },
    ],
  },
  {
    type: "lp",
    label: "LP制作",
    base: 70000,
    options: [
      { id: "lp-animation", label: "アニメーション演出を入れたい", price: 30000 },
      { id: "lp-ab", label: "複数パターンでABテストしたい", price: 40000 },
      { id: "lp-payment", label: "予約・決済機能と連携したい", price: 50000 },
    ],
  },
  {
    type: "system",
    label: "システム・Webアプリ開発",
    base: 50000,
    options: [
      { id: "sys-admin", label: "データの一覧・編集ができる管理画面が必要", price: 50000 },
      { id: "sys-login", label: "ユーザーのログイン機能が必要", price: 40000 },
      { id: "sys-integration", label: "外部サービス(決済・LINE等)と連携したい", price: 60000 },
    ],
  },
  {
    type: "line",
    label: "LINE公式アカウント構築",
    base: 30000,
    options: [
      { id: "line-richmenu", label: "リッチメニューのデザイン作成", price: 15000 },
      { id: "line-autoreply", label: "自動応答メッセージの設定", price: 20000 },
      { id: "line-step", label: "ステップ配信(順次配信)の設定", price: 30000 },
    ],
  },
];

function formatYen(n: number): string {
  return n.toLocaleString("ja-JP");
}

const INQUIRY_TYPE_LABEL: Record<ServiceType, string> = {
  hp: "HP制作",
  lp: "LP制作",
  system: "システム・Webアプリ開発",
  line: "LINE公式アカウント構築",
};

export default function EstimateSimulator() {
  const [serviceType, setServiceType] = useState<ServiceType>("hp");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const service = SERVICES.find((s) => s.type === serviceType)!;
  const serviceScope = services.find((s) => s.slug === serviceType)?.scope ?? [];

  const total = useMemo(() => {
    const optionsTotal = service.options
      .filter((o) => selected[o.id])
      .reduce((sum, o) => sum + o.price, 0);
    return service.base + optionsTotal;
  }, [service, selected]);
  const animatedTotal = useAnimatedNumber(total);

  function toggle(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleServiceChange(type: ServiceType) {
    setServiceType(type);
    setSelected({});
  }

  const contactHref = useMemo(() => {
    const chosenOptions = service.options.filter((o) => selected[o.id]).map((o) => o.label);
    const lines = [
      `【かんたん見積もりシミュレーターより】`,
      `ご依頼内容: ${service.label}`,
      ...(chosenOptions.length > 0 ? [`追加のご要望: ${chosenOptions.join(" / ")}`] : []),
      `目安金額: ${formatYen(total)}円〜`,
      ``,
      `(以下に詳しい内容をご記入ください)`,
    ];
    const params = new URLSearchParams({
      type: INQUIRY_TYPE_LABEL[serviceType],
      message: lines.join("\n"),
    });
    return `/contact?${params.toString()}`;
  }, [service, selected, serviceType, total]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm font-semibold">ご依頼内容を選んでください</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {SERVICES.map((s) => (
            <button
              key={s.type}
              type="button"
              onClick={() => handleServiceChange(s.type)}
              className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                serviceType === s.type
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-foreground/80 hover:border-accent"
              }`}
            >
              {s.label}
              <span className="mt-1 block text-xs font-normal text-muted">
                {formatYen(s.base)}円〜
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={serviceType}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-8"
        >
          {serviceScope.length > 0 && (
            <div className="rounded-xl border border-border bg-surface/60 p-4">
              <p className="text-sm font-semibold">
                基本料金({formatYen(service.base)}円〜)に含まれる内容
              </p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {serviceScope.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs text-foreground/80 sm:text-sm"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">
                これを超える内容は下記のオプションを追加するか、正式なお見積り時にご相談ください。
              </p>
            </div>
          )}

          {service.options.length > 0 && (
            <div>
              <p className="text-sm font-semibold">
                あてはまるものがあれば選んでください(複数選択可・任意)
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {service.options.map((option) => (
                  <label
                    key={option.id}
                    className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border px-4 py-3 text-sm transition-transform has-[:checked]:border-accent has-[:checked]:bg-accent/5 active:scale-[0.99]"
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!selected[option.id]}
                        onChange={() => toggle(option.id)}
                        className="h-4 w-4 accent-accent"
                      />
                      {option.label}
                    </span>
                    <span className="shrink-0 text-muted">
                      +{formatYen(option.price)}円
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="rounded-2xl bg-surface p-6 text-center sm:p-8">
        <p className="text-sm text-muted">目安のお見積り金額</p>
        <p className="mt-2 text-3xl font-bold text-accent sm:text-4xl">
          {formatYen(animatedTotal)}円〜
        </p>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          実際の金額は内容によって変動します。あくまで目安としてご利用ください。正式なお見積りは無料でご案内します。
        </p>
        <Link
          href={contactHref}
          className="mt-6 inline-block rounded-full bg-accent px-8 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          この内容で相談する
        </Link>
      </div>
    </div>
  );
}
