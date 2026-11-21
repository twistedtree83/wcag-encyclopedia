import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tokensCss } from './src/theme/css';

/**
 * The token palettes are emitted into every HTML template at transform time, so the custom properties
 * are present before first paint — no flash of an unthemed page, no runtime cost, and
 * tokens.ts stays the only place a colour is written down.
 */
function injectTokens() {
  return {
    name: 'inject-theme-tokens',
    transformIndexHtml(html: string) {
      return html.replace('<!--@tokens-->', `<style id="theme-tokens">\n${tokensCss()}\n</style>`);
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), injectTokens()],
  // Each page is its own HTML file (ADR 0001): a missing page must 404, not fall back to /.
  appType: 'mpa',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      // index.html is the old single page until R-08/R-10; site.html is the template the
      // prerender step fills once per route.
      input: { main: 'index.html', site: 'site.html' },
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
});
