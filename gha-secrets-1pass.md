# 1Password Secrets Management 実装ロードマップ

## 🎯 目標
- GitHub Actions Secrets の手動設定を撲滅
- 複数プロジェクトでの secrets 管理を効率化
- 1Password Environments を活用した一元管理

## 📋 事前準備チェックリスト

### 1Password 側
- [ ] 1Password Business プラン確認（$8/月、Service Account 利用に必要）
- [ ] 1Password デスクトップアプリインストール
- [ ] 1Password Developer 機能有効化
  - Settings → Developer → "Show 1Password Developer experience" をオン

### 開発環境
- [ ] 1Password CLI インストール（`brew install 1password-cli`）
- [ ] 既存プロジェクトの secrets 棚卸し
- [ ] 現在の GitHub Actions ワークフロー確認

## 🚀 実装フェーズ

### Phase 1: 1Password 設定（30分）

#### 1-1. Service Account 作成
```bash
# 1Password → Integrations → Service Accounts
# Create Service Account → "GitHub-Actions-Personal"
# Vault access: 必要な vault に Read 権限
# トークン保存: ops_xxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 1-2. Environment 作成
```bash
# 1Password → Developer → View Environments
# New environment → "MyApp-Development"
# New environment → "MyApp-Production"
```

#### 1-3. 変数登録
**Development Environment:**
```
CLOUDFLARE_API_TOKEN: cf_dev_token_123
CLOUDFLARE_ACCOUNT_ID: account_id_123
DATABASE_URL: postgresql://localhost:5432/myapp_dev
DEBUG: true
```

**Production Environment:**
```
CLOUDFLARE_API_TOKEN: cf_prod_token_789
CLOUDFLARE_ACCOUNT_ID: account_id_789
DATABASE_URL: postgresql://prod-db.com/myapp
DEBUG: false
```

### Phase 2: 検証ブランチでテスト（20分）

#### 2-1. ブランチ作成
```bash
git checkout -b feature/1password-secrets
```

#### 2-2. GitHub Repository Secret 設定
```bash
# Repository Settings → Secrets and variables → Actions
# New repository secret
Name: OP_SERVICE_ACCOUNT_TOKEN
Secret: ops_xxx_your_token_xxx
```

#### 2-3. テスト用ワークフロー作成
`.github/workflows/test-1password.yml`
```yaml
name: Test 1Password Integration
on:
  push:
    branches: [feature/1password-secrets]
  workflow_dispatch:

jobs:
  test-dev:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Load development secrets
        uses: 1password/load-secrets-action@v3
        with:
          export-env: true
        env:
          OP_SERVICE_ACCOUNT_TOKEN: ${{ secrets.OP_SERVICE_ACCOUNT_TOKEN }}
          OP_ENVIRONMENT: "MyApp-Development"
          
      - name: Verify secrets loaded
        run: |
          echo "Cloudflare Token: ${CLOUDFLARE_API_TOKEN:0:10}..."
          echo "Database URL: ${DATABASE_URL:0:20}..."
          
          if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
            echo "✅ CLOUDFLARE_API_TOKEN loaded"
          else
            echo "❌ CLOUDFLARE_API_TOKEN failed"
            exit 1
          fi
          
      - name: Test deployment (dry run)
        run: |
          echo "Would deploy with:"
          echo "  Token: ${CLOUDFLARE_API_TOKEN:0:10}..."
          echo "  Account: ${CLOUDFLARE_ACCOUNT_ID}"
          # npx wrangler deploy --dry-run
```

#### 2-4. 動作確認
```bash
git add .
git commit -m "Add 1Password integration test"
git push origin feature/1password-secrets

# GitHub Actions 実行結果確認
# ログで secrets が正しく読み込まれているかチェック
```

### Phase 3: 本格導入（15分）

#### 3-1. メインワークフロー更新
`.github/workflows/deploy.yml`
```yaml
name: Deploy
on:
  push:
    branches: [main, develop]

jobs:
  deploy-dev:
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Load development secrets
        uses: 1password/load-secrets-action@v3
        with:
          export-env: true
        env:
          OP_SERVICE_ACCOUNT_TOKEN: ${{ secrets.OP_SERVICE_ACCOUNT_TOKEN }}
          OP_ENVIRONMENT: "MyApp-Development"
          
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm install
        
      - name: Deploy to development
        run: npx wrangler deploy --env development

  deploy-prod:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Load production secrets
        uses: 1password/load-secrets-action@v3
        with:
          export-env: true
        env:
          OP_SERVICE_ACCOUNT_TOKEN: ${{ secrets.OP_SERVICE_ACCOUNT_TOKEN }}
          OP_ENVIRONMENT: "MyApp-Production"
          
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm install
        
      - name: Deploy to production
        run: npx wrangler deploy --env production
```

#### 3-2. 従来の GitHub Secrets 削除
```bash
# Repository Settings → Secrets and variables → Actions
# 以下を削除:
# - CLOUDFLARE_API_TOKEN
# - CLOUDFLARE_ACCOUNT_ID  
# - DATABASE_URL
# - その他移行済み secrets

# OP_SERVICE_ACCOUNT_TOKEN のみ残す
```

#### 3-3. マージ
```bash
git checkout main
git merge feature/1password-secrets
git push origin main
```

### Phase 4: 他プロジェクトへの展開（プロジェクトあたり5分）

#### 4-1. Environment 複製
```bash
# 1Password → Environments → MyApp-Development → Manage Environment → Duplicate
# 新しい名前: "OtherProject-Development"
# 必要に応じて変数値を調整
```

#### 4-2. ワークフローテンプレート適用
```bash
# .github/workflows/deploy.yml をコピー
# OP_ENVIRONMENT の値を変更するだけ
OP_ENVIRONMENT: "OtherProject-Development"
```

#### 4-3. GitHub Secret 設定
```bash
# 同じ OP_SERVICE_ACCOUNT_TOKEN を設定
# または プロジェクト別 Service Account を作成
```

## 🔒 セキュリティ設定

### Service Account 権限制限
```bash
# 最小権限の原則
Service Account Settings:
├── Vault access: 必要な Environment のみ Read
├── IP制限: GitHub Actions IP range
└── 定期ローテーション: 30日ごと
```

### GitHub Actions 制限
```yaml
# Pull Request からの実行制限
on:
  push:
    branches: [main, develop]  # 信頼できるブランチのみ
  pull_request_target:         # pull_request は使わない
    types: [labeled]

jobs:
  deploy:
    if: contains(github.event.label.name, 'safe-to-deploy')
```

## 🛠 ローカル開発環境

### 1Password CLI セットアップ
```bash
# Service Account でローカル環境設定
export OP_SERVICE_ACCOUNT_TOKEN="ops_xxx_your_token_xxx"

# 環境変数読み込み
op run --env "MyApp-Development" -- npm run dev

# 特定の値のみ取得
export DATABASE_URL=$(op read "op://Personal/Database/development-url")
```

### 開発用スクリプト
`scripts/dev-env.sh`
```bash
#!/bin/bash
echo "Loading development environment from 1Password..."
op run --env "MyApp-Development" -- "$@"
```

使用例:
```bash
chmod +x scripts/dev-env.sh
./scripts/dev-env.sh npm run dev
./scripts/dev-env.sh npm run test
```

## 📊 運用・メンテナンス

### 定期作業（月1回）
- [ ] Service Account Token ローテーション
- [ ] 1Password アクセスログ確認
- [ ] 不要な Environment・Variable の整理

### 監視項目
- [ ] GitHub Actions の異常実行
- [ ] 1Password への予期しないアクセス
- [ ] Cloudflare API の異常な使用

### トラブルシューティング用コマンド
```bash
# 接続テスト
op whoami

# Environment 一覧
op environment list

# 特定 Environment の変数確認
op environment get "MyApp-Development"

# Service Account 権限確認
op vault list
```

## 🚨 緊急時対応

### Token 漏洩時の対応手順
1. **即座に Service Account 無効化**（1分）
   ```bash
   # 1Password → Service Accounts → Revoke
   ```

2. **新しい Service Account 作成**（3分）
   ```bash
   # 新しいトークン生成
   # GitHub Secrets 更新
   ```

3. **影響範囲調査**（30分）
   ```bash
   # 1Password アクセスログ確認
   # Cloudflare audit log 確認
   # GitHub Actions 実行履歴確認
   ```

### ロールバック手順
```yaml
# 緊急時は従来の GitHub Secrets に戻す
- name: Emergency fallback
  if: failure()
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN_BACKUP }}
  run: npx wrangler deploy
```

## 📈 費用対効果

### コスト
- 1Password Business: $8/月 = $96/年
- 初期設定時間: 1時間
- プロジェクトあたり設定時間: 5分

### 節約効果
- 新プロジェクト立ち上げ: 10分 → 1分（9分節約）
- Secrets 更新作業: 5分×プロジェクト数 → 30秒（大幅節約）
- 年間10プロジェクトの場合: 約1.5時間節約

### ROI
時給$30以上なら年1回目で元が取れる計算

## ✅ 完了チェックリスト

### 設定完了確認
- [ ] 1Password Service Account 作成済み
- [ ] Environment 作成・変数登録済み
- [ ] GitHub Repository に OP_SERVICE_ACCOUNT_TOKEN 設定済み
- [ ] テスト用ワークフロー動作確認済み
- [ ] 本番ワークフロー更新済み
- [ ] 従来の GitHub Secrets 削除済み

### セキュリティ確認
- [ ] Service Account 権限が最小限に設定済み
- [ ] Pull Request 制限設定済み
- [ ] 定期ローテーション計画策定済み

### 運用準備
- [ ] ローカル開発環境設定済み
- [ ] 緊急時対応手順確認済み
- [ ] 他プロジェクトへの展開計画策定済み

---

**🎉 導入完了！**
これで複数プロジェクトでの secrets 管理が劇的に楽になります。何か問題があれば上記のトラブルシューティングを参照してください。