/**
 * Hydrates a pre-rendered page (ADR 0001).
 *
 * The route comes from the document (`<div id="root" data-route>`, written by the prerender
 * step), not from `location.pathname`, which carries the GitHub Pages repository prefix.
 * Once hydrated, `<Site>` sets `<html data-hydrated="true">` so tests can wait for live controls.
 */
// The shared stylesheets come first, so each lab's own lab.css (imported by its lab.ts, through
// the registry) lands after them in the bundle, as its rules sat after the shared ones before.
// Self-hosted fonts (docs/CONVENTIONS.md, "Tokens and CSS"): latin subset, only the weights
// the design uses. Each @font-face sets font-display: swap.
import '@fontsource/figtree/latin-400.css';
import '@fontsource/figtree/latin-500.css';
import '@fontsource/figtree/latin-600.css';
import '@fontsource/figtree/latin-700.css';
import '@fontsource/figtree/latin-800.css';
import '@fontsource/onest/latin-400.css';
import '@fontsource/onest/latin-500.css';
import '@fontsource/onest/latin-600.css';
import '@fontsource/onest/latin-700.css';
import './styles/swatch.css';
import './styles/examples.css';
import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { Site } from './site/Site';
import { routeFor } from './site/routes';

const root = document.getElementById('root');
const route = root ? routeFor(root.dataset.route ?? '') : undefined;
if (!root || !route) throw new Error('entry-client: #root has no known data-route');

hydrateRoot(
  root,
  <StrictMode>
    <Site route={route} />
  </StrictMode>,
);
