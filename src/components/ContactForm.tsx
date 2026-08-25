"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

const inquiryTypes = ["HP制作", "LP制作", "システム・Webアプリ開発", "その他・不明"];
const budgetRanges = [
  "〜10万円",
  "10万円〜30万円",
  "30万円〜100万円",
  "100万円以上",
  "未定・相談したい",
];

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("送信に失敗しました");
      }

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage(
        "送信に失敗しました。時間をおいて再度お試しいただくか、恐れ入りますが別の方法でご連絡ください。"
      );
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <h2 className="text-lg font-bold">お問い合わせありがとうございます</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          内容を確認のうえ、担当より折り返しご連絡いたします。しばらくお待ちください。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium">
          お名前
          <input
            required
            name="name"
            type="text"
            autoComplete="name"
            className="rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-accent"
            placeholder="山田 太郎"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          メールアドレス
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            className="rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-accent"
            placeholder="you@example.com"
          />
        </label>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium">
          お問い合わせ種別
          <select
            required
            name="inquiryType"
            defaultValue=""
            className="rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-accent"
          >
            <option value="" disabled>
              選択してください
            </option>
            {inquiryTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          ご予算感
          <select
            name="budget"
            defaultValue=""
            className="rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-accent"
          >
            <option value="" disabled>
              選択してください(任意)
            </option>
            {budgetRanges.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm font-medium">
        お問い合わせ内容
        <textarea
          required
          name="message"
          rows={6}
          className="rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-accent"
          placeholder="現状のお悩みやご要望をお聞かせください"
        />
      </label>

      {status === "error" && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="self-start rounded-full bg-accent px-8 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "submitting" ? "送信中..." : "送信する"}
      </button>
    </form>
  );
}
