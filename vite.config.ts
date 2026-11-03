/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// On GitHub Pages the app lives under /<repo-name>/. Set VITE_BASE in CI.
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "English Tracker",
        short_name: "English",
        description: "Daily English study tracker: plan, Anki streak, vocabulary, grammar, writing and level tests.",
        theme_color: "#0f6b5c",
        background_color: "#f6f4ef",
        display: "standalone",
        start_url: base,
        scope: base,
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        navigateFallback: "index.html",
        // Supabase API calls must always hit the network.
        runtimeCaching: [{ urlPattern: /supabase\.co/, handler: "NetworkOnly" }]
      }
    })
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"]
  }
});
