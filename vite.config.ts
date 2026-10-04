import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  // Relative base path ensures zero-config compatibility with GitHub Pages (/gs-softwares-deployment/), Vercel, and local previews
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'robots.txt', 'icons/*.png'],
      manifest: {
        id: '/gs-suite',
        name: 'GS Softwares Suite',
        short_name: 'GS Suite',
        description: 'High-performance 100% Client-Side WebAssembly PWA Tools for Images, PDFs, Video, Audio, and Text.',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}']
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'canvas-confetti': path.resolve(__dirname, './src/lib/confetti.ts')
    }
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'engine-pdf': ['@cantoo/pdf-lib', 'pdfjs-dist'],
          'engine-crypto': ['./src/lib/cryptoEngine.ts'],
          'engine-image': ['./src/lib/imageEngine.ts'],
          'engine-audio': ['./src/lib/audioEngine.ts'],
          'engine-video': ['./src/lib/videoEngine.ts'],
          'engine-archive': ['jszip']
        }
      }
    }
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  }
});
