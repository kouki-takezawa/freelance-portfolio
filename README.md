# freelance-hp

個人事業主(HP/LP/システム開発)向け集客サイト。Next.js (App Router, 静的エクスポート) + Tailwind CSS製。会社を1人で運営するための管理画面(`admin/`、旧ai-company-os)を同じリポジトリに統合している。

## 公開用サイト

**https://freelance-hp.yorisoi-works.workers.dev**

来訪者向けの本体サイト。`main`ブランチへのpushで [.github/workflows/deploy.yml](.github/workflows/deploy.yml) が自動的にビルド・デプロイする。

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # 静的サイトを out/ に出力
```

コンテンツ(実績・料金・SEO)は `content/*.json` を読み込んで表示している。管理画面に編集フォームは無く、直接編集してpushするか、Claude Codeが管理画面(下記)経由でコミットする。

## 管理者側画面 (admin/)

会社を1人で運営するための「AI事業部」管理画面。単なるコンテンツ編集画面ではなく、トップページ自体が組織図になっており、お問い合わせ・受注・SNS投稿・売上・アクセス解析などを部門ごとに扱う(詳細は [admin/README.md](admin/README.md) を参照)。`admin/`ディレクトリの独立したCloudflare Workerアプリ(Hono製、Worker名は`ai-company-os`)。`admin/**`に変更があったときのみ [.github/workflows/deploy-admin.yml](.github/workflows/deploy-admin.yml) が自動デプロイする。

もとはこのリポジトリの`admin/`だったが、一時的に[ai-company-os](https://github.com/kouki-takezawa/ai-company-os)という別リポジトリに切り出されていたものを、本リポジトリへ統合し直した(旧リポジトリは廃止)。

- ログイン: メールアドレス + パスワード(Cloudflare KVに保存、初回はWorkers Secretの`ADMIN_EMAIL` / `ADMIN_PASSWORD`から移行。現在は認証ゲート自体を一時的に無効化中)
- **実績・料金・SEO(`content/*.json`)を編集する画面はあえて置いていない**。HPの内容は今後AIが自律的に更新していく前提のため、`content/*.json`の更新はClaude CodeがGitHub Contents API経由で直接コミットするか、週次のCron自動化(要`ANTHROPIC_API_KEY`)で行う
- お問い合わせ一覧の既読管理・削除・**返信**(Resend経由でメール送信、送信済み返信は各問い合わせの下に履歴表示)、受注への変換
- 受注管理・売上・SNS投稿・アクティビティ・横断検索・月次レポートなど。機能一覧は [admin/README.md](admin/README.md) を参照

パスワードは第三者に共有しないこと。万一漏えいした場合はCloudflareダッシュボードの `ai-company-os` → Settings → Variables で `ADMIN_PASSWORD` を再設定するか、`/settings`画面から変更する。

### お問い合わせ通知・返信メール(Resend)

公開サイトはお問い合わせを受信するとKVに保存し、`RESEND_API_KEY`が設定されていれば所有者(`takechin001031@icloud.com`)宛に通知メールを送信する。管理画面からの返信も同じくResend経由。

- [Resend](https://resend.com)でアカウントを作成し、APIキーを発行する
- 公開サイト用・管理画面用の両方のWorkerにシークレットを設定する

  ```bash
  npx wrangler secret put RESEND_API_KEY          # 公開サイト(freelance-hp) — 通知メール用
  cd admin && npx wrangler secret put RESEND_API_KEY  # 管理画面(ai-company-os) — 返信メール用
  ```

- 送信元は`onboarding@resend.dev`(Resendのサンドボックス送信元)を使用している。**独自ドメインをResend側で検証するまでは、通知メール(自分宛)は届くが、管理画面からの返信(お客様の任意アドレス宛)はResendの制限で送信できない**。返信を実際にお客様へ届けるには、Resendダッシュボードでドメインを検証し、`worker/index.ts` / `admin/src/index.ts`の`onboarding@resend.dev`を検証済みドメインのアドレスに差し替える必要がある。
- キー未設定の状態でも、お問い合わせのKV保存自体は今まで通り動作する(通知・返信のみ無効)。

### 管理Workerのローカル開発

```bash
cd admin
npm install
cp .dev.vars.example .dev.vars   # 環境変数を設定(gitignore済み)。詳細は admin/README.md 参照
npm run dev
```

## 未確定・要対応のTODO

- 独自ドメインを取得したら`src/lib/site.ts`の`siteUrl`を更新し、各Workerプロジェクトの「Custom domains」から接続する
- Resendでドメインを検証し、管理画面からの返信メールが実際にお客様へ届くようにする(上記「お問い合わせ通知・返信メール」参照)
- `content/works.json`の実績は現状すべてサンプル(`isSample: true`)。実案件を受注したら実績として差し替える

## デプロイ (Cloudflare)

公開サイト(Worker名`freelance-hp`)・管理画面(Worker名`ai-company-os`)ともに、同じリポジトリ内で `wrangler.jsonc` を持つ独立したCloudflare Workerとして、GitHub Actions(`CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` のリポジトリSecretを使用)からデプロイされる。変更されたパス(ルート or `admin/**`)に応じて [deploy.yml](.github/workflows/deploy.yml) / [deploy-admin.yml](.github/workflows/deploy-admin.yml) のどちらかだけが走る。Cloudflareダッシュボード側のGit連携(Build設定)は使用していないため、ダッシュボードの「Settings」→「Git repository」は未接続のままでよい。

独自ドメインを取得したら、各Workerプロジェクトの「Custom domains」から接続できる。
