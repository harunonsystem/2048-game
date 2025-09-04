import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "./index.html",
      },
    },
  },
  server: {
    open: true,
  },
  optimizeDeps: {
    exclude: ["@rollup/rollup-linux-x64-gnu", "@rollup/rollup-linux-x64-musl"],
  },
});
