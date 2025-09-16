#!/bin/bash

# Cloudflare Workers一括削除スクリプト
# Usage: ./scripts/delete-workers.sh

# 1Passwordから環境変数を取得
if command -v op >/dev/null 2>&1; then
    echo "🔑 Loading credentials from 1Password..."
    
    # 1Passwordから取得を試行
    if CLOUDFLARE_ACCOUNT_ID=$(op item get "CLOUDFLARE_ACCOUNT_ID" --vault harunonpj --fields harunonpj --reveal 2>/dev/null) && \
       CLOUDFLARE_API_TOKEN=$(op item get "CLOUDFLARE_API_TOKEN" --vault harunonpj --fields harunonpj --reveal 2>/dev/null); then
        echo "✅ Successfully loaded credentials from 1Password"
        export CLOUDFLARE_ACCOUNT_ID
        export CLOUDFLARE_API_TOKEN
    else
        echo "❌ Failed to load from 1Password. Make sure you're signed in with 'op signin'"
        exit 1
    fi
else
    echo "❌ Error: 1Password CLI (op) is required"
    echo ""
    echo "Please install 1Password CLI and sign in:"
    echo "1. Install: https://developer.1password.com/docs/cli/get-started/"
    echo "2. Sign in: op signin"
    echo "3. Run this script again"
    exit 1
fi

echo "🗑️ Cloudflare Workers一括削除スクリプト"
echo ""

# まず全てのWorkersをリストアップ
echo "📋 現在のWorkers一覧を取得中..."
LIST_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/scripts")

LIST_HTTP_CODE=$(echo "$LIST_RESPONSE" | tail -n1)
LIST_BODY=$(echo "$LIST_RESPONSE" | head -n -1 2>/dev/null || echo "$LIST_RESPONSE" | sed '$d')

echo "DEBUG: List HTTP Code: $LIST_HTTP_CODE"
echo "DEBUG: List Response: $LIST_BODY"
echo ""

# 削除対象のWorker名リスト
WORKERS_TO_DELETE=(
    # example
    # "mini-games-app-pr-1"
    '2048-game-pr-15'
    '2048-game-pr-16'
)

# 各Workerの削除
for WORKER_NAME in "${WORKERS_TO_DELETE[@]}"; do
    echo "🔍 Checking worker: $WORKER_NAME"

    # Worker存在確認
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/scripts/$WORKER_NAME")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n -1 2>/dev/null || echo "$RESPONSE" | sed '$d')

    echo "DEBUG: HTTP Code: $HTTP_CODE"
    echo "DEBUG: Response Body: $BODY"
    echo "DEBUG: API URL: https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/scripts/$WORKER_NAME"

    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ Worker exists, proceeding with deletion..."

        # Worker削除
        DELETE_RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
            "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/scripts/$WORKER_NAME")

        DELETE_HTTP_CODE=$(echo "$DELETE_RESPONSE" | tail -n1)
        DELETE_BODY=$(echo "$DELETE_RESPONSE" | head -n -1 2>/dev/null || echo "$DELETE_RESPONSE" | sed '$d')

        if [ "$DELETE_HTTP_CODE" = "200" ]; then
            echo "🗑️ Successfully deleted: $WORKER_NAME"
        else
            echo "❌ Failed to delete $WORKER_NAME (HTTP: $DELETE_HTTP_CODE)"
            echo "Response: $DELETE_BODY"
        fi
    elif [ "$HTTP_CODE" = "404" ]; then
        echo "ℹ️ Worker does not exist: $WORKER_NAME"
    else
        echo "⚠️ Error checking worker $WORKER_NAME (HTTP: $HTTP_CODE)"
        echo "Response: $BODY"
    fi

    echo ""
done

echo "🎉 Cleanup complete!"
