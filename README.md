# freelance-hp

個人事業主(HP/LP/システム開発)向け集客サイト。Next.js (App Router, 静的エクスポート) + Tailwind CSS製。実績・料金・SEO設定は `content/*.json` を編集して管理する。

## 公開用サイト

**https://freelance-hp.yorisoi-works.workers.dev**

来訪者向けの本体サイト。`main`ブランチへのpushで [.github/workflows/deploy.yml](.github/workflows/deploy.yml) が自動的にビルド・デプロイする。

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # 静的サイトを out/ に出力
```

コンテンツ(実績・料金・SEO)は `content/*.json` を読み込んで表示している。直接編集してpushしてもよいし、管理画面から編集してもよい(どちらも同じファイルを更新する)。

## 管理画面

管理画面は別リポジトリ [kouki-takezawa/ai-company-os](https://github.com/kouki-takezawa/ai-company-os) に移行した。実績・料金・SEOの編集、お問い合わせの既読管理・返信などはそちらから行う。

### お問い合わせ通知メール(Resend)

公開サイトはお問い合わせを受信するとKVに保存し、`RESEND_API_KEY`が設定されていれば所有者(`takechin001031@icloud.com`)宛に通知メールを送信する。

- [Resend](https://resend.com)でアカウントを作成し、APIキーを発行する
- 公開サイトのWorkerにシークレットを設定する

  ```bash
  npx wrangler secret put RESEND_API_KEY
  ```

- 送信元は`onboarding@resend.dev`(Resendのサンドボックス送信元)を使用している。独自ドメインをResend側で検証したら、`worker/index.ts`の`onboarding@resend.dev`を検証済みドメインのアドレスに差し替える。
- キー未設定の状態でも、お問い合わせのKV保存自体は今まで通り動作する(通知のみ無効)。

## 未確定・要対応のTODO

- 独自ドメインを取得したら`src/lib/site.ts`の`siteUrl`を更新し、Workerプロジェクトの「Custom domains」から接続する
- `content/works.json`の実績は現状すべてサンプル(`isSample: true`)。実案件を受注したら実績として差し替える

## デプロイ (Cloudflare)

`wrangler.jsonc` を持つCloudflare Workerで、GitHub Actions(`CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` のリポジトリSecretを使用)からデプロイされる。Cloudflareダッシュボード側のGit連携(Build設定)は使用していないため、ダッシュボードの「Settings」→「Git repository」は未接続のままでよい。

独自ドメインを取得したら、Workerプロジェクトの「Custom domains」から接続できる。
