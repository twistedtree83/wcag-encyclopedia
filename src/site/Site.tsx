import { useEffect } from 'react';
import { criterion } from '../criteria/corpus';
import { EXPECTED_TOTAL } from '../criteria/manifest';
import { AboutPage } from '../pages/AboutPage';
import { ColourCheckPage } from '../pages/ColourCheckPage';
import { CriteriaPage } from '../pages/CriteriaPage';
import { CriterionPage } from '../pages/CriterionPage';
import { HomePage } from '../pages/HomePage';
import { Footer } from './Footer';
import { Header } from './Header';
import { criterionDescription, criterionTitle } from './meta';
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
    case 'colour-check':
      return <ColourCheckPage />;
    case 'criteria':
      return <CriteriaPage />;
    case 'criterion':
      return <CriterionPage record={recordFor(route)} />;
    case 'home':
      return <HomePage />;
  }
}

export function recordFor(route: Route) {
  const record = route.num ? criterion(route.num) : undefined;
  if (!record) throw new Error(`${route.path}: no criterion record for ${route.num}`);
  return record;
}

/**
 * The page's own name: its last step in the breadcrumb trail and, on a criterion page, the
 * article headline in its structured data.
 */
export function pageName(route: Route): string {
  switch (route.page) {
    case 'about':
      return 'About';
    case 'colour-check':
      return 'Colour check';
    case 'criteria':
      return 'Criteria';
    case 'home':
      return 'Home';
    case 'criterion': {
      const record = recordFor(route);
      return `${record.num} ${record.name}`;
    }
  }
}

/** The document title and description for a route. */
export function pageMeta(route: Route): { title: string; description: string } {
  switch (route.page) {
    case 'about':
      return {
        title: 'About the site and its accessibility: WCAG Encyclopedia',
        description:
          'What the WCAG Encyclopedia is, its accessibility statement and how each claim is checked, and where to find the source code.',
      };
    case 'colour-check':
      return {
        title: 'Colour check: WCAG Encyclopedia',
        description:
          'Check any text and background colour against the WCAG contrast thresholds, see the pair in a real layout, and get the closest colour that passes.',
      };
    case 'criteria':
      return {
        title: 'All criteria: WCAG Encyclopedia',
        description: `Search and filter all ${EXPECTED_TOTAL} Level A and AA success criteria of WCAG 2.2, each in a sentence with the way it most often goes wrong.`,
      };
    case 'home':
      return {
        title: 'WCAG Encyclopedia: every criterion, shown broken then fixed',
        description: `All ${EXPECTED_TOTAL} Level A and AA success criteria of WCAG 2.2, explained in plain language, shown broken then fixed, and grouped under WCAG's four principles.`,
      };
    case 'criterion': {
      const record = recordFor(route);
      return {
        title: criterionTitle(record),
        description: criterionDescription(record),
      };
    }
  }
}
