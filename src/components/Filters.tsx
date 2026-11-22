import type { ReactNode } from 'react';
import type { LevelFilter, PrincipleFilter, Query } from '../catalog/filter';
import { PRINCIPLES } from '../criteria/structure';
import { Marker } from './Tags';

const LEVELS: readonly LevelFilter[] = ['All', 'A', 'AA'];

/**
 * The filter panel (design guide §8.7): a search field, principle chips and level chips with
 * the separate "New in 2.2" toggle. Shared by the All criteria page and Home's index; the
 * owner keeps the query. `id` prefixes every id inside, so the panel can sit on any page.
 */
export function Filters({
  id,
  query,
  onChange,
}: {
  id: string;
  query: Query;
  onChange: (over: Partial<Query>) => void;
}) {
  return (
    <form className="filters" role="search" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label htmlFor={`${id}-search`}>Search criteria</label>
        <input
          id={`${id}-search`}
          type="search"
          placeholder="Try “focus”, “1.4” or “captions”"
          autoComplete="off"
          value={query.text}
          onChange={(e) => onChange({ text: e.target.value })}
        />
      </div>
      <ChipGroup id={`${id}-principle`} label="Principle">
        <Chip pressed={query.principle === 'All'} onClick={() => onChange({ principle: 'All' })}>
          All
        </Chip>
        {PRINCIPLES.map((p) => (
          <Chip
            key={p.num}
            pressed={query.principle === p.num}
            onClick={() => onChange({ principle: p.num as PrincipleFilter })}
          >
            <Marker principle={p.num as 1 | 2 | 3 | 4} />
            {p.name}
          </Chip>
        ))}
      </ChipGroup>
      <ChipGroup id={`${id}-level`} label="Level">
        {LEVELS.map((level) => (
          <Chip key={level} pressed={query.level === level} onClick={() => onChange({ level })}>
            {level}
          </Chip>
        ))}
        <Chip pressed={query.newIn22} onClick={() => onChange({ newIn22: !query.newIn22 })}>
          New in 2.2
        </Chip>
      </ChipGroup>
    </form>
  );
}

function ChipGroup({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <span className="gl" id={id}>
        {label}
      </span>
      <div className="chips" role="group" aria-labelledby={id}>
        {children}
      </div>
    </div>
  );
}

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick}>
      {children}
    </button>
  );
}
