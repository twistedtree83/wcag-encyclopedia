import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { posts } from './src/blog/plugin';
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

/**
 * `vite preview` answers a path that matches no built file the way Cloudflare does
 * (`not_found_handling: "404-page"` in wrangler.jsonc): with dist/404.html and status 404, so
 * e2e/not-found.spec.ts tests the page as readers get it. Runs after the static and HTML
 * middlewares, so only requests they did not answer reach it.
 */
function notFoundPage(): Plugin {
  return {
    name: 'not-found-page',
    configurePreviewServer(server) {
      const dist = server.config.build.outDir;
      const built = (file: string) => existsSync(file) && statSync(file).isFile();
      return () => {
        server.middlewares.use((req, res, next) => {
          let path: string;
          try {
            path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
          } catch {
            return next(); // a malformed escape: let the server's own handling answer it
          }
          const file = join(dist, path);
          const page = join(dist, '404.html');
          if (built(file) || built(join(file, 'index.html')) || !built(page)) return next();
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(readFileSync(page));
        });
      };
    },
  };
}

export default defineConfig({
  base: './',
  // `posts` compiles src/blog/posts/*.md to data at build time (src/blog/plugin.ts).
  plugins: [posts(), react(), injectTokens(), notFoundPage()],
  // Each page is its own HTML file (ADR 0001): a missing page must 404, not fall back to /.
  appType: 'mpa',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      // site.html is the template the prerender step fills once per route, Home included
      // (dist/index.html).
      input: { site: 'site.html' },
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
});
