import { useRoute } from '../site/RouteContext';

/** Home / Criteria / current, in a labelled nav, the current item marked (design guide 8.14). */
export function Breadcrumb({
  trail,
  current,
}: {
  trail: readonly { to: string; label: string }[];
  current: string;
}) {
  const { href } = useRoute();
  return (
    <nav className="trail" aria-label="Breadcrumb">
      <ol>
        {trail.map(({ to, label }) => (
          <li key={label}>
            <a href={href(to)}>{label}</a>
          </li>
        ))}
        <li>
          <span aria-current="page">{current}</span>
        </li>
      </ol>
    </nav>
  );
}
