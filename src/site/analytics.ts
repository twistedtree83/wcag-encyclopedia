/**
 * The Cloudflare Web Analytics beacon (docs/PRD-seo.md, S-06): the one script tag every page
 * loads when `CF_ANALYTICS_TOKEN` is set in src/site/config.ts, and nothing while it is unset.
 * `scripts/prerender.mjs` writes it at the end of `<body>`, outside `#root`, so hydration never
 * sees it.
 */

const BEACON_SRC = 'https://static.cloudflareinsights.com/beacon.min.js';

const attr = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

export function analyticsBeacon(token: string | undefined): string {
  if (!token) return '';
  return `<script defer src="${BEACON_SRC}" data-cf-beacon="${attr(JSON.stringify({ token }))}"></script>`;
}
