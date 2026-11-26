import type { CriterionRecord } from '../criteria/types';
import { principleFor } from '../criteria/structure';
import { useRoute } from '../site/RouteContext';
import { criterionPath } from '../site/routes';
import { LevelTag, Marker, NewTag } from './Tags';

/**
 * One criterion as a card in a grid (design guide 8.8); the whole card links to its page.
 * Render inside `<ul className="grid">`. Shared by the criterion page ("Also in"), the All
 * criteria index and Home.
 */
export function IndexCard({ record }: { record: CriterionRecord }) {
  const { href } = useRoute();
  const principle = principleFor(record.guideline);
  if (!principle) throw new Error(`${record.num}: no principle for guideline ${record.guideline}`);
  return (
    <li>
      <a className="surf" href={href(criterionPath(record.num))}>
        <span className="top">
          <Marker principle={principle.num} />
          {record.num}
          <span className="sr">, {principle.name}</span>
          {record.since === '2.2' ? <NewTag /> : null}
          <LevelTag level={record.level} />
        </span>
        <h3>{record.name}</h3>
        <p>
          <b>Fails when:</b> {record.fail.caption}
        </p>
      </a>
    </li>
  );
}
