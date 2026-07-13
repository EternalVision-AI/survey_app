import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const ensureTrailingSlash = (value: string) => (value.endsWith("/") ? value : `${value}/`);
const basePath = ensureTrailingSlash(process.env.VITE_BASE_PATH || "/");

export default defineConfig({
  base: basePath,
  plugins: [react()],
  server: {
    port: 5173,
    host: "0.0.0.0",       // allow access from any IP
    allowedHosts: ["famkb.ch"], // add your hostname/IP here
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      // Backend API surfaces mounted under the app's base path. Deliberately
      // scoped to these three subpaths (not the whole /unibas/survey prefix)
      // so the SPA's own page routes (e.g. /unibas/survey/reports) are still
      // served by Vite instead of being proxied to the backend and 404ing.
      "/unibas/survey/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/unibas/survey/internal": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/unibas/survey/data": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
