import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnnouncementLog, useAnnouncementLog } from '../shared/AnnouncementLog';
import { LabChoice } from '../shared/LabChoice';
import { LabShell, type Said } from '../shared/LabShell';
import {
  MOCKS,
  PARTS,
  PART_LABEL,
  STRUCTURE_START,
  ordered,
  structureSaid,
  structureVerdict,
  type Part,
  type Structure,
} from './structure';
import { searchFromStructure, structureFromSearch } from './structureQuery';

/**
 * The 1.3.1 flagship lab (#48): the reader switches each part of a mock form or table between
 * styled divs and the real element, and the log, read from the mock's own markup, says the
 * structure a screen reader finds. On screen the two builds look the same; only the log changes.
 *
 * The mock is depicted: inert and hidden from assistive technology. State is in the URL
 * (`structureQuery.ts`), applied after mount without being announced.
 */

type Model = {
  readonly structure: Structure;
  /** Counts the reader's changes; 0 at the start, after a URL preload and after Reset. */
  readonly heard: number;
};

const START: Model = { structure: STRUCTURE_START, heard: 0 };

const ROWS = [
  ['Saturday', '9am to 5pm'],
  ['Sunday', 'Closed'],
] as const;

/** The mock, built from real elements or from styled divs, part by part. */
export function StructureMock({
  structure,
  idPrefix,
}: {
  readonly structure: Structure;
  readonly idPrefix: string;
}) {
  const real = (p: Part) => structure.real.includes(p);
  const heading = structure.mock === 'form' ? 'Track your order' : 'Opening hours';
  return (
    <div className="st">
      {real('heading') ? <h3 className="st-h">{heading}</h3> : <div className="st-h">{heading}</div>}
      {structure.mock === 'form' ? (
        <>
          <p className="st-p">You will need:</p>
          {real('list') ? (
            <ul className="st-list">
              <li>Your order number</li>
              <li>The postcode it went to</li>
            </ul>
          ) : (
            <div className="st-list">
              <div>• Your order number</div>
              <div>• The postcode it went to</div>
            </div>
          )}
          {(['Order number', 'Postcode'] as const).map((name, i) => {
            const fieldId = `${idPrefix}-f${i}`;
            return (
              <div className="st-field" key={name}>
                {real('labels') ? (
                  <label htmlFor={fieldId}>{name}</label>
                ) : (
                  <div className="st-label">{name}</div>
                )}
                <input id={fieldId} type="text" tabIndex={-1} />
              </div>
            );
          })}
        </>
      ) : real('headers') ? (
        <table className="st-table">
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">Hours</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([day, hours]) => (
              <tr key={day}>
                <td>{day}</td>
                <td>{hours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="st-table st-table--divs">
          <div className="st-tr st-th">
            <div>Day</div>
            <div>Hours</div>
          </div>
          {ROWS.map(([day, hours]) => (
            <div className="st-tr" key={day}>
              <div>{day}</div>
              <div>{hours}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function StructureLab() {
  const id = useId();
  const [{ structure, heard }, setModel] = useState<Model>(START);
  const mock = useRef<HTMLDivElement>(null);
  const lines = useAnnouncementLog(mock, structure);

  // Only the reader's own changes are spoken: a preload and Reset leave `heard` at 0.
  const said = useMemo<Said | null>(
    () => (heard > 0 ? { text: structureSaid(structure.mock, lines) } : null),
    [heard, lines, structure.mock],
  );

  useEffect(() => {
    const preload = structureFromSearch(window.location.search);
    if (preload) setModel((m) => ({ ...m, structure: preload }));
  }, []);

  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const { pathname, hash } = window.location;
    const search = searchFromStructure(structure);
    window.history.replaceState(window.history.state, '', pathname + search + hash);
  }, [structure]);

  const change = (next: (s: Structure) => Structure) =>
    setModel((m) => ({ structure: next(m.structure), heard: m.heard + 1 }));

  const toggle = (part: Part, on: boolean) =>
    change((s) => ({
      ...s,
      real: ordered(on ? [...s.real, part] : s.real.filter((p) => p !== part)),
    }));

  return (
    <LabShell
      className="lab st-lab"
      verdict={structureVerdict(structure)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div className="lab__mock st-mock" data-lab-mock aria-hidden="true" inert ref={mock}>
        <StructureMock structure={structure} idPrefix={`${id}-mock`} />
      </div>

      <div className="sem-controls">
        <LabChoice
          name={`${id}-mock`}
          legend="The mock"
          options={MOCKS}
          value={structure.mock}
          onChange={(mock) => change((s) => ({ ...s, mock }))}
        />
        <fieldset className="sem-choice">
          <legend>Built from real elements</legend>
          {PARTS[structure.mock].map((part) => (
            <label key={part}>
              <input
                type="checkbox"
                checked={structure.real.includes(part)}
                onChange={(e) => toggle(part, e.target.checked)}
              />
              {PART_LABEL[part]}
            </label>
          ))}
        </fieldset>
      </div>

      <AnnouncementLog id={id} lines={lines} />
    </LabShell>
  );
}
