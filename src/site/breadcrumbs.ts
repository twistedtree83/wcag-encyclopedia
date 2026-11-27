/**
 * A page's breadcrumb trail: Home first, the page itself last. The criterion page draws it
 * (`components/Breadcrumb.tsx`) and the structured data writes it as a `BreadcrumbList`
 * (`jsonLd.ts`), so the two cannot disagree. Home has no trail.
 *
 * Pure data, no JSX, so the e2e specs can import it.
 */

import { PATHS, type Route } from './routes';

/** One step of a trail: a route path and the name it is shown with. */
export type Crumb = { readonly path: string; readonly name: string };

const HOME: Crumb = { path: PATHS.home, name: 'Home' };
const CRITERIA: Crumb = { path: PATHS.criteria, name: 'Criteria' };

/** `name` is the page's own step: "1.4.3 Contrast (Minimum)", "About". */
export function trailFor(route: Route, name: string): readonly Crumb[] {
  const own = { path: route.path, name };
  switch (route.page) {
    case 'home':
      return [];
    case 'criterion':
      return [HOME, CRITERIA, own];
    case 'about':
    case 'colour-check':
    case 'criteria':
      return [HOME, own];
  }
}
