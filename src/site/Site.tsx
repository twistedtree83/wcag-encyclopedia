import { useEffect } from 'react';
import { criterion } from '../criteria/corpus';
import { AboutPage } from '../pages/AboutPage';
import { CriterionPage } from '../pages/CriterionPage';
import { Footer } from './Footer';
import { Header } from './Header';
import { RouteProvider } from './RouteContext';
import type { Route } from './routes';

/**
 * One pre-rendered page: the Swatch shell (skip link, header, main, footer) around the page
 * the route names. Rendered to static HTML at build time and hydrated in the browser with
 * the same route, so both sides render the same tree.
 */
export function Site({ route }: { route: Route }) {
  // Effects only run in the browser, after hydration commits: from here the page is live.
  useEffect(() => {
    document.documentElement.setAttribute('data-hydrated', 'true');
  }, []);

  return (
    <RouteProvider value={route}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="wrap">
        <Header />
        <main id="main">
          <Page route={route} />
        </main>
        <Footer />
      </div>
    </RouteProvider>
  );
}

function Page({ route }: { route: Route }) {
  switch (route.page) {
    case 'about':
      return <AboutPage />;
    case 'criterion':
      return <CriterionPage record={recordFor(route)} />;
  }
}

function recordFor(route: Route) {
  const record = route.num ? criterion(route.num) : undefined;
  if (!record) throw new Error(`${route.path}: no criterion record for ${route.num}`);
  return record;
}

/** The document title and description for a route. */
export function pageMeta(route: Route): { title: string; description: string } {
  switch (route.page) {
    case 'about':
      return {
        title: 'About: WCAG Encyclopedia',
        description:
          'What the WCAG Encyclopedia is, its accessibility statement and how each claim is checked, and where to find the source code.',
      };
    case 'criterion': {
      const record = recordFor(route);
      return {
        title: `${record.num} ${record.name}: WCAG Encyclopedia`,
        description: `WCAG 2.2 success criterion ${record.num}, ${record.name}, in plain language, shown broken and then fixed.`,
      };
    }
  }
}
