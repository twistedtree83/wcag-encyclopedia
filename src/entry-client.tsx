/**
 * Hydrates a pre-rendered page (ADR 0001).
 *
 * The route comes from the document (`<div id="root" data-route>`, written by the prerender
 * step), not from `location.pathname`, which carries the GitHub Pages repository prefix.
 * Once hydrated, `<Site>` sets `<html data-hydrated="true">` so tests can wait for live controls.
 */
import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { Site } from './site/Site';
import { routeFor } from './site/routes';
import './styles/swatch.css';
import './styles/examples.css';

const root = document.getElementById('root');
const route = root ? routeFor(root.dataset.route ?? '') : undefined;
if (!root || !route) throw new Error('entry-client: #root has no known data-route');

hydrateRoot(
  root,
  <StrictMode>
    <Site route={route} />
  </StrictMode>,
);
