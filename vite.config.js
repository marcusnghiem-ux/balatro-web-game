import { defineConfig } from 'vite';

export default defineConfig({
  // Base public path for GitHub Pages deployment
  base: '/balatro-web-game/',

  server: {
    port: 3000,
    open: true,
    host: true,
    // Disable server-side caching during development so changes appear instantly
    headers: {
      'Cache-Control': 'no-store'
    }
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,

    // CACHE-BUSTING: Vite appends content-hash suffixes (e.g. index-Bx4kDf2Z.js).
    // Every new build generates new hashes → CDN/browser caches always invalidated.
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        // Split game engine and UI into separate cached chunks
        manualChunks(id) {
          if (id.includes('/src/game/')) return 'game-engine';
          if (id.includes('/src/ui/'))   return 'ui-layer';
        }
      }
    },

    minify: 'esbuild',
    chunkSizeWarningLimit: 500
  },

  // Inject build timestamp — useful for verifying deployments in DevTools console
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
});

