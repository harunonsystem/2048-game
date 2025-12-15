/**
 * 2048 Game Worker
 *
 * Wrangler 3+ の [assets] 設定により、静的アセットは自動的に配信される。
 * このWorkerはアセットが見つからない場合のフォールバック処理のみを担当。
 */
export default {
  async fetch(request, env) {
    // ASSETS binding を通じてアセットを取得
    const response = await env.ASSETS.fetch(request);

    // アセットが見つかった場合はそのまま返す
    if (response.status !== 404) {
      return response;
    }

    // 404 の場合は SPA ルーティング用に index.html を返す
    const url = new URL(request.url);
    url.pathname = "/index.html";
    return env.ASSETS.fetch(new Request(url, request));
  },
};
