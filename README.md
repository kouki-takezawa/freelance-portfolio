# freelance-hp

個人事業主(HP/LP/システム開発)向け集客サイト。Next.js (App Router, 静的エクスポート) + Tailwind CSS製。

## 開発

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # 静的サイトを out/ に出力
```

## 未確定・要対応のTODO

- `src/lib/site.ts`: 屋号が決まったら `siteName` / `siteNameShort` を差し替え。問い合わせ受信用メールアドレス(`email`)も設定
- `functions/api/contact.js`: 現状はログ出力のみの仮実装。送信先メールが決まったらResend等のメールAPI連携を実装
- `src/lib/works.ts`: 実績が公開できるようになったら `isSample: false` の実案件を追加
- `src/lib/services.ts`: 受注実績が増えたら料金目安を実態に合わせて見直し

## デプロイ (Cloudflare)

このリポジトリは `wrangler.jsonc` で静的アセットの出力先(`out/`)を宣言しており、Cloudflareの「Workers(静的アセット)」でのGit連携デプロイを想定しています。

1. https://dash.cloudflare.com/ にログイン(未登録なら無料アカウント作成)
2. 「Workers & Pages」→「Create」→「Import a repository」(または「Connect to Git」)
3. このGitHubリポジトリ(`kouki-takezawa/freelance-hp`)を選択
4. ビルド設定(プロジェクト作成後でも Settings → Build から変更可能):
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy` (デフォルトのままでOK。`wrangler.jsonc`の`assets.directory`が`out/`を参照する)
5. 設定を保存すると、`main`ブランチへのpushのたびに自動でビルド・デプロイされる
6. 公開URLは `https://<プロジェクト名>.<サブドメイン>.workers.dev` の形式

**すでに設定なしでデプロイしてしまった場合**: プロジェクト画面の「Settings」→「Build」からBuild commandを`npm run build`に設定し直し、「Deployments」(または「Builds」)一覧から最新コミットで再デプロイ(Retry / Create deployment)してください。`wrangler.jsonc`をpushした後に再デプロイすれば、出力先ディレクトリの設定も反映されます。

独自ドメインを取得したら、プロジェクトの「Custom domains」から接続できます。
