import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages serves this repo at https://<user>.github.io/bms-mastery/
// so the production base path must match the repository name.
// If you name the GitHub repo something other than "bms-mastery",
// change BASE_PATH below to "/<your-repo-name>/".
const BASE_PATH = '/bms-mastery/';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? BASE_PATH : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'BMS Mastery',
        short_name: 'BMS Mastery',
        description:
          'Learn Building Management Systems to expert level — ADHD-friendly micro-lessons.',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
  server: {
    port: 5180,
  },
}));
