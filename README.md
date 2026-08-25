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

パスワードは第三者に共有しないこと。万一漏えいした場合はCloudflareダッシュボードの `freelance-hp-admin` → Settings → Variables で `ADMIN_PASSWORD` を再設定する。

### 管理Workerのローカル開発

```bash
cd admin
npm install
# .dev.vars に ADMIN_EMAIL / ADMIN_PASSWORD / SESSION_SECRET / CONTENT_GITHUB_TOKEN を設定(gitignore済み)
npm run dev
```

## 未確定・要対応のTODO

- `src/lib/site.ts`: 屋号が決まったら `siteName` / `siteNameShort` を差し替え。問い合わせ受信用メールアドレス(`email`)も設定。独自ドメインを取得したら`siteUrl`も更新
- `functions/api/contact.js`: 現状はログ出力のみの仮実装。送信先メールが決まったらResend等のメールAPI連携を実装

## デプロイ (Cloudflare)

公開サイト・管理画面ともに `wrangler.jsonc` を持つ独立したCloudflare Workerで、GitHub Actions(`CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` のリポジトリSecretを使用)からデプロイされる。Cloudflareダッシュボード側のGit連携(Build設定)は使用していないため、ダッシュボードの「Settings」→「Git repository」は未接続のままでよい。

独自ドメインを取得したら、各Workerプロジェクトの「Custom domains」から接続できる。
