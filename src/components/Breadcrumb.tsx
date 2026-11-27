import type { Crumb } from '../site/breadcrumbs';
import { useRoute } from '../site/RouteContext';

/**
 * Home / Criteria / current, in a labelled nav, the current item marked (design guide 8.14).
 * `trail` comes from `trailFor` (src/site/breadcrumbs.ts), which the structured data's
 * BreadcrumbList also uses, so the two match. Its last crumb is the page itself.
 */
export function Breadcrumb({ trail }: { trail: readonly Crumb[] }) {
  const { href } = useRoute();
  return (
    <nav className="trail" aria-label="Breadcrumb">
      <ol>
        {trail.slice(0, -1).map(({ path, name }) => (
          <li key={name}>
            <a href={href(path)}>{name}</a>
          </li>
        ))}
        <li>
          <span aria-current="page">{trail.at(-1)?.name}</span>
        </li>
      </ol>
    </nav>
  );
}
