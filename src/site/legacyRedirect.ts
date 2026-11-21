/**
 * The previous site was one page whose criteria were addressed as `#1.4.3`. Those links live
 * on in tickets and bookmarks, so the home page sends them to the criterion page.
 *
 * The script is inlined into the home page's `<head>` by `vite.config.ts` (placeholder
 * `<!--@legacy-redirect-->`), so it runs before anything paints. `location.replace` means the
 * old address leaves no history entry, and the relative URL works under any path prefix.
 * Only numbers that have a page are redirected; any other fragment is left alone.
 */

import { EXPECTED } from '../criteria/manifest';

export function legacyRedirectScript(): string {
  const nums = JSON.stringify(EXPECTED.map((c) => c.num));
  return `<script>(function(){var n=location.hash.slice(1);if(${nums}.indexOf(n)!==-1)location.replace('criteria/'+n+'/');})();</script>`;
}
