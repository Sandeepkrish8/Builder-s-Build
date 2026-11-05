import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" keeps asset paths relative, so the build also works on GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    // three.js is large and rarely changes: ship it as its own cached chunk
    rollupOptions: { output: { manualChunks: { three: ["three"] } } },
    chunkSizeWarningLimit: 600,
  },
  test: { environment: "node" },
});
