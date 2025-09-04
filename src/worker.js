import { getAssetFromKV } from "@cloudflare/kv-asset-handler";

export default {
  async fetch(request, env, ctx) {
    try {
      // Serve static assets
      return await getAssetFromKV(request, {
        ASSET_NAMESPACE: env.__STATIC_CONTENT,
        ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
      });
    } catch (e) {
      // If asset not found, serve index.html for SPA routing
      try {
        return await getAssetFromKV(request, {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
          mapRequestToAsset: (req) =>
            new Request(`${new URL(req.url).origin}/index.html`, req),
        });
      } catch (e) {
        return new Response("Not found", { status: 404 });
      }
    }
  },
};
