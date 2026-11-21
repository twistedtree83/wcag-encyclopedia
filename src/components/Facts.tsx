import type { ReactNode } from 'react';
import type { CriterionRecord, Principle } from '../criteria/types';
import { Marker } from './Tags';

/** Where the criterion sits in the standard (design guide 8.14). */
export function Facts({ record, principle }: { record: CriterionRecord; principle: Principle }) {
  const rows: readonly (readonly [string, ReactNode])[] = [
    [
      'Principle',
      <>
        <Marker principle={principle.num} />
        {principle.name}
      </>,
    ],
    ['Guideline', record.guideline],
    ['Level', record.level],
    ['In WCAG since', record.since],
    ['Number', record.num],
  ];
  return (
    <dl className="facts surf" aria-label="Facts about this criterion">
      {rows.map(([term, value]) => (
        <div key={term}>
          <dt>{term}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
