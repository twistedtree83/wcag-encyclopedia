import type { Counts } from '../catalog/filter';
import { resultsLine } from '../catalog/urlQuery';
import type { CriterionRecord } from '../criteria/types';
import { IndexCard } from './IndexCard';

/**
 * The results under a filter panel, on Home's index and the All criteria page: the polite
 * "Showing N of M criteria." line, then the grid of index cards, or a way out when nothing
 * matches.
 */
export function CriteriaResults({
  records,
  counts,
}: {
  readonly records: readonly CriterionRecord[];
  readonly counts: Counts;
}) {
  return (
    <>
      <p className="count" aria-live="polite">
        {resultsLine(counts)}
      </p>
      {records.length > 0 ? (
        <ul className="grid">
          {records.map((record) => (
            <IndexCard key={record.num} record={record} />
          ))}
        </ul>
      ) : (
        <p className="empty">Nothing matches. Try a number such as 2.4, or clear the filters.</p>
      )}
    </>
  );
}
