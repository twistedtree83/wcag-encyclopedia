/**
 * The build-time renderer (ADR 0001). `scripts/prerender.mjs` imports the SSR build of this
 * module and writes one static HTML file per route; `entry-client.tsx` hydrates it.
 */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { Site, pageMeta } from './site/Site';
import { ROUTES, type Route } from './site/routes';

export { ROUTES };

export function render(route: Route): { html: string; title: string; description: string } {
  const html = renderToString(
    <StrictMode>
      <Site route={route} />
    </StrictMode>,
  );
  return { html, ...pageMeta(route) };
}
