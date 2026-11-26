/**
 * The build-time renderer (ADR 0001). `scripts/prerender.mjs` imports the SSR build of this
 * module and writes one static HTML file per route; `entry-client.tsx` hydrates it.
 */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { legacyRedirectScript } from './site/legacyRedirect';
import { Site, pageMeta } from './site/Site';
import { ROUTES, type Route } from './site/routes';

export { ROUTES };

/**
 * A route rendered for the prerender step: the app markup, the title and description, and
 * `head`, extra markup for the page's `<head>` (the old `#number` redirect, on Home only).
 */
export type Rendered = { html: string; title: string; description: string; head: string };

export function render(route: Route): Rendered {
  const html = renderToString(
    <StrictMode>
      <Site route={route} />
    </StrictMode>,
  );
  const head = route.page === 'home' ? legacyRedirectScript() : '';
  return { html, head, ...pageMeta(route) };
}
