import type { CriterionRecord } from '../criteria/types';
import { useRoute } from '../site/RouteContext';
import { criterionPath } from '../site/routes';

/** Previous and next criterion in number order. At either end only one link shows. */
export function Pager({ prev, next }: { prev?: CriterionRecord; next?: CriterionRecord }) {
  const { href } = useRoute();
  return (
    <nav className="pager" aria-label="Previous and next criteria">
      {prev ? (
        <a className="surf" href={href(criterionPath(prev.num))} rel="prev">
          <span className="k">
            <span aria-hidden="true">←</span> Previous
          </span>
          <b>
            {prev.num} {prev.name}
          </b>
        </a>
      ) : (
        <span />
      )}
      {next ? (
        <a className="surf nx" href={href(criterionPath(next.num))} rel="next">
          <span className="k">
            Next <span aria-hidden="true">→</span>
          </span>
          <b>
            {next.num} {next.name}
          </b>
        </a>
      ) : null}
    </nav>
  );
}
