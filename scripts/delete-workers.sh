#!/bin/bash

# Cloudflare Workers一括削除スクリプト
# Usage: ./scripts/delete-workers.sh

# .envファイルから環境変数を読み込み
if [ -f .env ]; then
    echo "📄 Loading environment variables from .env file..."
    set -a
    source .env
    set +a
else
    echo "⚠️ .env file not found in current directory"
fi

# 環境変数の確認
if [ -z "$CLOUDFLARE_ACCOUNT_ID" ] || [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ Error: CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are required"
    echo "Please add them to your .env file:"
    echo "CLOUDFLARE_ACCOUNT_ID=your_account_id"
    echo "CLOUDFLARE_API_TOKEN=your_api_token"
    exit 1
fi

echo "🗑️ Cloudflare Workers一括削除スクリプト"
echo "削除対象: mini-games-app-pr-2 ~ mini-games-app-pr-10"
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
        "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/services/$WORKER_NAME")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n -1)

    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ Worker exists, proceeding with deletion..."

        # Worker削除
        DELETE_RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
            "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/services/$WORKER_NAME")

        DELETE_HTTP_CODE=$(echo "$DELETE_RESPONSE" | tail -n1)
        DELETE_BODY=$(echo "$DELETE_RESPONSE" | head -n -1)

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
