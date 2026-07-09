import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "ሰላም እንግሊዝኛ",
        short_name: "ሰላም",
        description: "ለአማርኛ ተናጋሪዎች በድምፅ የሚመራ የእንግሊዝኛ ትምህርት።",
        theme_color: "#176b39",
        background_color: "#f5f7f5",
        display: "standalone",
        orientation: "portrait-primary",
        icons: [
          {
            src: "/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,webp,woff2}"]
      }
    })
  ]
});
