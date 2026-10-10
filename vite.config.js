import { defineConfig } from 'vite';

export default defineConfig({
  // Base public path for GitHub Pages deployment
  base: '/balatro-web-game/',
  server: {
    port: 3000,
    open: true,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
});
