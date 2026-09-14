# freelance-hp

個人事業主(屋号「ヨリソイワークス」、HP/LP制作・システム開発・LINE公式アカウント構築)向けの**集客サイト**と、その会社を1人で運営するための**社内管理画面**を1つのリポジトリにまとめたプロジェクト。

## これは何か

このリポジトリには、性質の異なる2つのアプリケーションが同居している。

1. **公開サイト(ルート、`freelance-hp`)** — 見込み客が最初に訪れる、フリーランスエンジニアの営業用ホームページ。サービス内容・料金・制作実績・プロフィール・お知らせ(ブログ)を掲載し、見積もりシミュレーターやお問い合わせフォームから問い合わせを受け付ける。
2. **管理画面(`admin/`、旧 ai-company-os)** — 受け付けたお問い合わせへの返信や、受注・売上・SNS投稿の管理など、1人で会社を回すためのバックオフィス。単なる管理フォームの集まりではなく、トップページ自体が「営業部」「制作部」などの部門を持つ組織図になっており、各部門ボックスから実データ入りの管理画面へ遷移する作りになっている。

### 目的・背景

フリーランス(個人事業主)が本業の制作業務と並行して、自分自身の営業サイト運用・問い合わせ対応・受注管理・SNS発信までを1人でこなすのは負担が大きい。このリポジトリは、

- 公開サイトの内容更新やSNS投稿の下書き作成を(将来的には)AIに任せ、人間は承認するだけで済む状態を目指す
- お問い合わせから受注・売上管理までの一連の流れを、Cloudflareの無料〜低コストな構成(Workers + KV + Durable Objects)だけで完結させる

ことを狙って作られている。実績・料金・SEO設定などサイトの中身を人間が直接編集する画面は管理画面上にあえて用意しておらず、Claude CodeがGitHub Contents API経由でリポジトリへ直接コミットするか、週次のCron自動化で更新する運用を前提にしている。

### 主な機能

**公開サイト側**

- トップページ・サービス紹介・料金表・制作実績・プロフィール・お知らせ(ブログ)の各ページ
- サービス内容を選ぶだけで料金の目安がわかる「かんたん見積もりシミュレーター」
- お問い合わせフォーム(Cloudflare Turnstileによるボット対策、ハニーポット、レート制限つき)
- お問い合わせ受信時に、問い合わせ主への自動返信メールと、サイト所有者への通知メールをResend経由で送信
- 静的サイト生成(Next.js静的エクスポート)+ Cloudflare Workers上での軽量なAPI処理(問い合わせ受付・Resend Webhook)のハイブリッド構成

**管理画面(`admin/`)側**

- 組織図形式のホーム画面(部門ごとに実データと該当ページへのリンクを表示)
- 承認センター(全部門の承認待ちを1画面に集約)
- お問い合わせ管理(既読管理・削除・返信・受注への変換・横断検索)
- 受注管理(クライアント・金額・納期・進捗管理、CSV出力)
- SNS投稿管理(下書き承認・投稿済み管理)
- 売上管理(月次確定売上・未入金・見込み額のグラフ表示)
- クライアント一覧・月次経営レポート・アクセス解析・ゴミ箱(論理削除)などの補助機能
- ダーク/ライト切り替え、コマンドパレット(Ctrl+K)、AIチャットパネル、Durable Objects経由のリアルタイム反映、PWA対応など
- content(実績・ブログ等)・SNS投稿案をAnthropic APIで自律的に下書き生成する週次Cron自動化

管理画面の全機能の詳細は [admin/README.md](admin/README.md) を参照。

### 技術スタック

| 領域 | 使用技術 |
|---|---|
| 公開サイト フロントエンド | Next.js 16(App Router、静的エクスポート `output: export`) / React 19 / TypeScript |
| スタイリング | Tailwind CSS 4 |
| アニメーション | Motion(旧 Framer Motion) |
| 公開サイト API/配信 | Cloudflare Workers(`worker/index.ts`)+ Cloudflare Pages Assets(静的ファイル配信) |
| 管理画面 | Hono(Cloudflare Workers上でのSSR、ビルドステップなし) |
| データ保存 | Cloudflare KV(お問い合わせ・受注・認証情報など) |
| リアルタイム通信 | Cloudflare Durable Objects(WebSocket、承認待ち件数の即時反映) |
| メール送信 | Resend |
| ボット対策 | Cloudflare Turnstile |
| AI連携 | Anthropic API(content/SNS自律更新、管理画面AIチャットパネル、Claude Codeによるコンテンツコミット) |
| コンテンツ管理 | `content/*.json`(実績・料金・ブログ・SEO設定)。GitHub Contents API経由で更新 |
| CI/CD | GitHub Actions → Cloudflare Workers(Wrangler) |

### ディレクトリ構成

```
.
├── src/                 # 公開サイト(Next.js App Router)のソース
│   ├── app/             # ページ(/, /services, /works, /about, /blog, /contact, /estimate, /privacy など)
│   ├── components/      # UIコンポーネント(装飾・イラスト含む)
│   └── lib/             # サイト共通設定(site.ts)など
├── content/             # 公開サイトの中身(JSON管理)
│   ├── works.json       # 制作実績
│   ├── services.json    # サービス・料金
│   ├── blog.json        # お知らせ・ブログ記事
│   └── seo.json         # ページごとのSEOタイトル・description
├── worker/              # 公開サイトを配信するCloudflare Worker本体(お問い合わせ受付API等)
├── admin/               # 管理画面「ai-company-os」(独立したCloudflare Workerアプリ、Hono製)
│   ├── src/             # 管理画面のソース
│   └── docs/            # 管理画面の仕様書(SPEC.md 等)
├── .github/workflows/   # デプロイ用GitHub Actions(deploy.yml / deploy-admin.yml)
├── wrangler.jsonc       # 公開サイト用Cloudflare Workers設定
└── next.config.ts       # Next.js設定(静的エクスポート)
```

---

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

**https://ai-company-os.yorisoi-works.workers.dev**

会社を1人で運営するための「AI事業部」管理画面。単なるコンテンツ編集画面ではなく、トップページ自体が組織図になっており、お問い合わせ・受注・SNS投稿・売上・アクセス解析などを部門ごとに扱う(詳細は [admin/README.md](admin/README.md) を参照)。`admin/`ディレクトリの独立したCloudflare Workerアプリ(Hono製、Worker名は`ai-company-os`)。`admin/**`に変更があったときのみ [.github/workflows/deploy-admin.yml](.github/workflows/deploy-admin.yml) が自動デプロイする。

もとはこのリポジトリの`admin/`だったが、一時的に[ai-company-os](https://github.com/kouki-takezawa/ai-company-os)という別リポジトリに切り出されていたものを、本リポジトリへ統合し直した(旧リポジトリは廃止)。

- ログイン: メールアドレス + パスワード(Cloudflare KVに保存、初回はWorkers Secretの`ADMIN_EMAIL` / `ADMIN_PASSWORD`から移行。現在は認証ゲート自体を一時的に無効化中)
- **実績・料金・SEO(`content/*.json`)を編集する画面はあえて置いていない**。HPの内容は今後AIが自律的に更新していく前提のため、`content/*.json`の更新はClaude CodeがGitHub Contents API経由で直接コミットするか、週次のCron自動化(要`ANTHROPIC_API_KEY`)で行う
- お問い合わせ一覧の既読管理・削除・**返信**(Resend経由でメール送信、送信済み返信は各問い合わせの下に履歴表示)、受注への変換
- 受注管理・売上・SNS投稿・アクティビティ・横断検索・月次レポートなど。機能一覧は [admin/README.md](admin/README.md) を参照

パスワードは第三者に共有しないこと。万一漏えいした場合はCloudflareダッシュボードの `ai-company-os` → Settings → Variables で `ADMIN_PASSWORD` を再設定するか、`/settings`画面から変更する。

### お問い合わせ通知・返信メール(Resend)

公開サイトはお問い合わせを受信するとKVに保存し、`RESEND_API_KEY`が設定されていれば所有者(`130967349+kouki-takezawa@users.noreply.github.com`)宛に通知メールを送信する。管理画面からの返信も同じくResend経由。

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
