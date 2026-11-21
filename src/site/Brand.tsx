import { useRoute } from './RouteContext';
import { PATHS } from './routes';

/** The logo: three accent dots and the name. Links home. */
export function Brand() {
  const { href } = useRoute();
  return (
    <a className="brand" href={href(PATHS.home)}>
      <i aria-hidden="true">
        <b className="brand__dot brand__dot--a1" />
        <b className="brand__dot brand__dot--a2" />
        <b className="brand__dot brand__dot--a3" />
      </i>
      WCAG Encyclopedia
    </a>
  );
}
