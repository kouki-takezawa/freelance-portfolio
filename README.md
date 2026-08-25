# freelance-hp

個人事業主(HP/LP/システム開発)向け集客サイト。Next.js (App Router, 静的エクスポート) + Tailwind CSS製。管理画面(`admin/`)から実績・料金・SEO設定を編集できる。

## 公開用サイト

**https://freelance-hp.yorisoi-works.workers.dev**

来訪者向けの本体サイト。`main`ブランチへのpushで [.github/workflows/deploy.yml](.github/workflows/deploy.yml) が自動的にビルド・デプロイする。

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # 静的サイトを out/ に出力
```

コンテンツ(実績・料金・SEO)は `content/*.json` を読み込んで表示している。直接編集してpushしてもよいし、下記の管理画面から編集してもよい(どちらも同じファイルを更新する)。

## 管理者側画面

**https://freelance-hp-admin.yorisoi-works.workers.dev**

実績・料金・SEO(ページごとのタイトル/description)をブラウザから編集するための画面。`admin/`ディレクトリの独立したCloudflare Workerアプリ(Hono製)。`admin/**`に変更があったときのみ [.github/workflows/deploy-admin.yml](.github/workflows/deploy-admin.yml) が自動デプロイする。

- ログイン: メールアドレス + パスワード(Cloudflare Workers Secretの`ADMIN_EMAIL` / `ADMIN_PASSWORD`と照合)
- 保存すると、管理Workerが`content/*.json`をGitHub Contents API経由で`main`ブランチへ直接コミットする → 公開サイトの自動デプロイが走り、数十秒〜1分で反映される
- 実績・サービスの追加/削除、SEOのタイトル・descriptionの編集が可能
- お問い合わせ一覧の既読管理・削除・**返信**(Resend経由でメール送信、送信済み返信は各問い合わせの下に履歴表示)

パスワードは第三者に共有しないこと。万一漏えいした場合はCloudflareダッシュボードの `freelance-hp-admin` → Settings → Variables で `ADMIN_PASSWORD` を再設定する。

### お問い合わせ通知・返信メール(Resend)

公開サイトはお問い合わせを受信するとKVに保存し、`RESEND_API_KEY`が設定されていれば所有者(`takechin001031@icloud.com`)宛に通知メールを送信する。管理画面からの返信も同じくResend経由。

- [Resend](https://resend.com)でアカウントを作成し、APIキーを発行する
- 公開サイト用・管理画面用の両方のWorkerにシークレットを設定する

  ```bash
  npx wrangler secret put RESEND_API_KEY          # 公開サイト(freelance-hp) — 通知メール用
  cd admin && npx wrangler secret put RESEND_API_KEY  # 管理画面(freelance-hp-admin) — 返信メール用
  ```

- 送信元は`onboarding@resend.dev`(Resendのサンドボックス送信元)を使用している。**独自ドメインをResend側で検証するまでは、通知メール(自分宛)は届くが、管理画面からの返信(お客様の任意アドレス宛)はResendの制限で送信できない**。返信を実際にお客様へ届けるには、Resendダッシュボードでドメインを検証し、`worker/index.ts` / `admin/src/index.ts`の`onboarding@resend.dev`を検証済みドメインのアドレスに差し替える必要がある。
- キー未設定の状態でも、お問い合わせのKV保存自体は今まで通り動作する(通知・返信のみ無効)。

### 管理Workerのローカル開発

```bash
cd admin
npm install
# .dev.vars に ADMIN_EMAIL / ADMIN_PASSWORD / SESSION_SECRET / CONTENT_GITHUB_TOKEN を設定(gitignore済み)
npm run dev
```

## 未確定・要対応のTODO

- 独自ドメインを取得したら`src/lib/site.ts`の`siteUrl`を更新し、各Workerプロジェクトの「Custom domains」から接続する
- Resendでドメインを検証し、管理画面からの返信メールが実際にお客様へ届くようにする(上記「お問い合わせ通知・返信メール」参照)
- `content/works.json`の実績は現状すべてサンプル(`isSample: true`)。実案件を受注したら実績として差し替える

## デプロイ (Cloudflare)

公開サイト・管理画面ともに `wrangler.jsonc` を持つ独立したCloudflare Workerで、GitHub Actions(`CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` のリポジトリSecretを使用)からデプロイされる。Cloudflareダッシュボード側のGit連携(Build設定)は使用していないため、ダッシュボードの「Settings」→「Git repository」は未接続のままでよい。

独自ドメインを取得したら、各Workerプロジェクトの「Custom domains」から接続できる。
