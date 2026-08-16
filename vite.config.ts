import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tokensCss } from './src/theme/css';

/**
 * The token palettes are emitted into index.html at transform time, so the custom properties
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
  build: { outDir: 'dist', sourcemap: false },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
});
