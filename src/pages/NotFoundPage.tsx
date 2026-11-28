import { CORPUS } from '../criteria/corpus';
import { useRoute } from '../site/RouteContext';
import { PATHS } from '../site/routes';

const TOTAL = CORPUS.length;

/**
 * The 404 page (S-05): shown, with status 404, for any address the site has no page for. It
 * is served at that address, so its links come from `href`, which makes them root-absolute
 * here (`linkFrom` in src/site/routes.ts).
 */
export function NotFoundPage() {
  const { href } = useRoute();
  return (
    <section className="ph" aria-labelledby="not-found-title">
      <p className="eyebrow">Error 404</p>
      <h1 id="not-found-title">Page not found</h1>
      <p className="lede">
        {`There is no page at this address. The link may have a typo, or the page may have moved. Every one of the ${TOTAL} WCAG 2.2 Level A and AA success criteria, the testable checks a web page has to pass, has its own page, listed under All criteria.`}
      </p>
      <div className="prose">
        <p>
          The blog has articles on subjects that span several criteria, such as changes
          between WCAG versions and ways of testing a page.
        </p>
      </div>
      <div className="cta">
        <a className="btn p" href={href(PATHS.criteria)}>
          {`Browse all ${TOTAL} criteria `}
          <span aria-hidden="true">→</span>
        </a>
        <a className="btn o" href={href(PATHS.home)}>
          Go to the home page
        </a>
        <a className="btn o" href={href(PATHS.blog)}>
          Read the blog
        </a>
      </div>
    </section>
  );
}
