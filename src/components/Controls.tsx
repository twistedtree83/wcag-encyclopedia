/**
 * Search and the conformance-level filter.
 *
 * Level is a single-select segmented control. Each button carries `aria-pressed`, so the
 * active option reaches a screen reader through state rather than through the fill colour —
 * the page obeying 1.4.1 in its own chrome.
 */

import type { LevelFilter, Query } from '../catalog/filter';

const LEVELS: readonly { value: LevelFilter; label: string }[] = [
  { value: 'All', label: 'Everything' },
  { value: 'A', label: 'Level A' },
  { value: 'AA', label: 'Level AA' },
];

export function Controls({
  query,
  onChange,
  summary,
  /**
   * Two instances exist — one in the masthead, one in the drawer — and only ever one is
   * exposed at a time. They still need distinct element ids, or `label for` is ambiguous
   * and the document is invalid regardless of which is visible.
   */
  idPrefix,
}: {
  query: Query;
  onChange: (next: Query) => void;
  summary: string;
  idPrefix: string;
}) {
  const searchId = `${idPrefix}-search`;
  return (
    <div className="controls">
      <div className="controls__search">
        <label className="controls__label" htmlFor={searchId}>
          Search
        </label>
        <input
          id={searchId}
          className="controls__input"
          type="search"
          placeholder="Criterion name or number"
          value={query.text}
          onChange={(e) => onChange({ ...query, text: e.target.value })}
        />
      </div>

      <fieldset className="controls__group">
        <legend className="visually-hidden">Conformance level filter</legend>
        {LEVELS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className="controls__seg"
            aria-pressed={query.level === value}
            onClick={() => onChange({ ...query, level: value })}
          >
            {label}
          </button>
        ))}
      </fieldset>

      {/*
        The count is a live region: it is the only feedback that a filter did anything, and a
        screen reader user who types into the search box would otherwise get silence. It
        changes only on filter input, so it does not chatter the way the scroll strip would.
      */}
      <p className="controls__summary" role="status" aria-live="polite">
        {summary}
      </p>
    </div>
  );
}
