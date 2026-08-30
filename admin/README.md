# admin (旧 ai-company-os)

会社を1人で運営するための「AI事業部」。Hono製のCloudflare Worker(SSR)。[freelance-hp](../README.md)本体とは別のCloudflare Workerとしてデプロイされる管理画面。

もとはこのリポジトリの`admin/`だったが、開発の都合で一時的に[ai-company-os](https://github.com/kouki-takezawa/ai-company-os)という別リポジトリ・別Workerに切り出されていた。本ディレクトリはそれを`freelance-hp`リポジトリへ統合し直したもの(旧`ai-company-os`リポジトリは廃止)。単なる管理画面ではなく、トップページ(`/`)自体が組織図になっており、各部門(営業部・制作部・マーケティング/SEO部・カスタマーサクセス保守部・総務経理部)のボックスに実データと該当ページへのリンクが埋め込まれている。

## できること

| 機能 | パス | 所属部門 |
|---|---|---|
| 組織図・全社サマリー(ホーム) | `/` | 経営管理部 |
| 承認センター(全部門の承認待ちを1画面に集約) | `/approvals` | 経営管理部 |
| お問い合わせ(既読管理・返信・受注への変換、検索) | `/inquiries` | 営業部 |
| 受注管理(クライアント・金額・納期・進捗、検索・並び替え、CSV出力) | `/orders` | 制作部 |
| SNS投稿(下書き承認・投稿済み管理) | `/sns` | SNS部 |
| 売上(月次確定売上・未入金・見込み額、月次グラフ) | `/revenue` | 総務・経理部 |
| アクティビティ(AI・社長の操作履歴、90日分) | `/activity` | — |
| クライアント一覧・詳細(受注・お問い合わせをクライアント名で横断表示) | `/clients` `/clients/:name` | 営業部 |
| 全データ横断検索(受注・お問い合わせ・SNS投稿・アクティビティ) | `/search` | — |
| 月次経営レポート(印刷・PDF向けの専用ビュー) | `/reports/monthly` | 総務・経理部 |
| アクセス解析(Cloudflare Web Analytics) | `/analytics` | — |
| ゴミ箱(お問い合わせ・受注の論理削除、30日で自動消去) | `/trash` | — |
| 設定(ログインID・パスワードの確認と変更) | `/settings` | — |

その他、全ページ共通の機能として以下がある。

- **ダーク/ライト表示切り替え**: サイドバー下部のボタン、またはOS側の設定に自動追従(`prefers-color-scheme`)
- **サイドバーの折り畳み**: サイドバー上部のボタンでアイコンのみの表示に切り替え可能(ブラウザに保存)。各部門の見出しをクリックすると、その部門のメニューだけを個別に折り畳める(アコーディオン式、こちらもブラウザに保存)
- **一覧画面の一括操作**: 受注・お問い合わせ・SNS投稿の一覧はチェックボックスで複数選択でき、選択すると一覧上部に固定の操作バー(一括削除・一括既読・一括投稿済みなど)が表示される
- **アクセントカラーパレット**: Aurora(標準)/Forest/Sunset/Oceanの4色から選択可(ブラウザに保存)
- **コマンドパレット(Ctrl+K / Cmd+K)**: キーボードで全ページ・操作へジャンプ。一致がなければEnterで`/search`へ
- **AIチャットパネル(PM AI)**: 画面右下から実データを踏まえた質問ができる(`POST /assistant/chat`、要 `ANTHROPIC_API_KEY`)
- **通知センター(ベル)**: 直近のアクティビティ履歴を表示(`GET /notifications`)。未読件数をバッジ表示
- **リアルタイム反映**: Durable Object 1部屋(`LiveRoom`)経由のWebSocket(`/live/ws`)で、承認待ち件数の変化を他タブ・他端末にも即時反映
- **キーボード操作**: 一覧画面でJ/Kキーによる行移動・Enterで開く、`?`でショートカット一覧を表示
- **受注管理のマスター/ディテール表示**: 一覧の行をクリックすると右側(`?selected=`)で編集でき、ページ遷移なしに近い操作感
- **組織図の演出**: AI社員ごとに役職名から色を決めた発光オーブ表示、日替わりのAI社員コメント(実データのしきい値から選択、数字の捏造なし)、部門カードのドラッグ&ドロップ並べ替え(ブラウザに保存)、承認待ちが0件になった際の控えめな祝福演出(効果音は既定オフ、サイドバーの「効果音」ボタンで切り替え)
- **PWA**: `/manifest.webmanifest`でホーム画面に追加可能(オフラインキャッシュは行わない)
- モバイルではハンバーガーメニュー、通知バッジはホバー/フォーカスで詳細をツールチップ表示
- ページ遷移時にトップの読み込みバーを表示(体感速度向上)、空データ状態は専用のイラスト付き表示

**実績・料金・お知らせ・SEO(サイトの内容)は、人間が編集する画面をあえて置いていない**。HPのレイアウト・内容はAIが自律的に判断して更新していく前提のため、マーケティング/SEO部のボックスは実績数などの現況表示と、公開サイトを見るリンクのみになっている(下記「content/SNSのAIによる自律更新」参照)。

ログインはメールアドレス+パスワードで行う。ログイン情報はCloudflare KV(`auth:admin`、`src/auth.ts`)に保存し、初回アクセス時にWorkers Secretsの`ADMIN_EMAIL`/`ADMIN_PASSWORD`から自動移行する(パスワードはPBKDF2でハッシュ化して保存、平文は保持しない)。`/settings`からログインID・パスワードを変更でき、以後はKV側の値が使われる(Secrets側は初回移行用にのみ使われる)。認証ゲートは有効で、`/login`以外の全ルートがログイン必須。

お問い合わせ・受注データは公開サイト(`../`、freelance-hp本体)と同じCloudflare KVネームスペースを共有している(`wrangler.jsonc`の`DATA`バインディング)。公開サイトのお問い合わせフォームがKVに書き込み、ここで読み書きする。実績・料金等のカウント表示は、GitHub Contents API経由で`content/*.json`を読みに行っている。**同じリポジトリ内だが、公開サイトとこの管理画面はCloudflare上では引き続き別々のWorker(`freelance-hp` / `ai-company-os`)としてデプロイされる**(下記「デプロイ」参照)。

## content/SNSのAIによる自律更新

毎週日曜21:00 UTC(月曜6:00 JST)、マーケティング/SEO部・SNS部AIが実際のサービス内容と直近の投稿履歴を踏まえて新しいブログ記事案・SNS投稿案を考える(Cloudflare Cron Trigger、`src/ai.ts`)。ブログはそのままGitHubへコミット、SNSは下書きとして保存し投稿は引き続き`/sns`での承認が必要。`POST /automation/run-content`でいつでも手動実行できる。**`ANTHROPIC_API_KEY`が必要**(未設定時は安全にスキップ)。詳細は[docs/SPEC.md §2.2](docs/SPEC.md)参照。

## 環境変数(Cloudflare Workers Secrets)

```bash
npx wrangler secret put ADMIN_EMAIL       # 初回のみ使用(KVへの移行元)。変更は/settingsから行う
npx wrangler secret put ADMIN_PASSWORD    # 同上
npx wrangler secret put SESSION_SECRET
npx wrangler secret put CONTENT_GITHUB_TOKEN   # freelance-hpへのrepo書き込み権限が必要
npx wrangler secret put CF_ANALYTICS_TOKEN     # 任意。未設定でもアクセス解析以外は動作する
npx wrangler secret put RESEND_API_KEY         # 任意。未設定だとお問い合わせへの返信メール送信のみ不可
npx wrangler secret put ANTHROPIC_API_KEY      # 任意。未設定だとcontent/SNSの自律更新・AIチャットパネルのみ不可
```

リアルタイム反映機能は Cloudflare Durable Objects(`LIVE`バインディング、`wrangler.jsonc`の`durable_objects`/`migrations`)を使用する。無料プランでは`new_sqlite_classes`マイグレーションが必須(`new_classes`だとデプロイに失敗する)。

ローカル開発時は`.dev.vars`([.dev.vars.example](.dev.vars.example)参照、gitignore済み)に同じ変数を設定する。

```bash
cd admin
npm install
npm run dev      # wrangler dev
npm run deploy   # 本番デプロイ(Worker名は wrangler.jsonc の "ai-company-os" のまま)
```

## デプロイ (Cloudflare)

`admin/**`に変更があったときのみ、リポジトリルートの [.github/workflows/deploy-admin.yml](../.github/workflows/deploy-admin.yml) が自動デプロイする(リポジトリSecretに`CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` に加え、上記の各Secretsが必要。`RESEND_API_KEY` / `ANTHROPIC_API_KEY`のみCIのフローに含めておらず、初回は手動で`wrangler secret put`する運用)。

Worker名(`wrangler.jsonc`の`name`)は統合前と同じ`ai-company-os`のまま維持しているため、公開URLやCloudflare側のシークレット・設定は変更していない。
