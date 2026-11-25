import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnnouncementLog, useAnnouncementLog } from './AnnouncementLog';
import { LabShell, type Said } from './LabShell';
import {
  CONTROLS,
  LABEL,
  NAMES,
  NRV_START,
  STATES,
  markupOf,
  nrvVerdict,
  saidFor,
  type Nrv,
} from './nameRoleValue';
import { nrvFromSearch, searchFromNrv } from './nrvQuery';

/**
 * The 4.1.2 flagship lab (#42): the reader edits a mock toggle's element, name and state, and the
 * announcement log, read from the mock's own markup, says what a screen reader would. The verdict
 * passes once role, name and state are all exposed.
 *
 * The mock is a depicted control: inert and hidden from assistive technology, so a half-built
 * control is never put in front of a real screen-reader user. The log speaks for it instead.
 *
 * State is in the URL (`nrvQuery.ts`): the page pre-renders the start, applies the query after
 * mount without announcing it, and writes changes back with `history.replaceState`.
 */

type Model = {
  readonly nrv: Nrv;
  /** Counts the reader's changes; 0 at the start, after a URL preload and after Reset. */
  readonly heard: number;
};

const START: Model = { nrv: NRV_START, heard: 0 };

/** The mock control and its visible text, as a page author might have built it. */
export function NrvMock({ nrv, labelId }: { readonly nrv: Nrv; readonly labelId: string }) {
  const { control, name, state, on } = nrv;
  const attrs: Record<string, string> = {};
  if (control === 'role-button') attrs.role = 'button';
  if (control === 'switch') attrs.role = 'switch';
  if (state !== 'none') attrs[state] = String(on);
  if (name === 'aria-label') attrs['aria-label'] = LABEL;
  if (name === 'labelledby') attrs['aria-labelledby'] = labelId;

  const inside = (
    <>
      <span className={on ? 'toggle toggle--on' : 'toggle'}>
        <span className="toggle__knob" />
      </span>
      {name === 'content' ? <span>{LABEL}</span> : null}
    </>
  );
  return (
    <div className="nrv-row">
      {control === 'button' ? (
        <button type="button" tabIndex={-1} className="nrv-ctl" {...attrs}>
          {inside}
        </button>
      ) : (
        <div className="nrv-ctl" {...attrs}>
          {inside}
        </div>
      )}
      {name === 'content' ? null : <span id={labelId}>{LABEL}</span>}
    </div>
  );
}

export function Choice<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="nrv-choice">
      <legend>{legend}</legend>
      {options.map((o) => (
        <label key={o.value}>
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          {o.label}
        </label>
      ))}
    </fieldset>
  );
}

export function NameRoleValueLab() {
  const id = useId();
  const [{ nrv, heard }, setModel] = useState<Model>(START);
  const mock = useRef<HTMLDivElement>(null);
  const lines = useAnnouncementLog(mock, nrv);
  const labelId = `${id}-label`;

  // Only the reader's own changes are spoken: a preload and Reset leave `heard` at 0.
  const said = useMemo<Said | null>(
    () => (heard > 0 ? { text: saidFor(lines) } : null),
    [heard, lines],
  );

  useEffect(() => {
    const preload = nrvFromSearch(window.location.search);
    if (preload) setModel((m) => ({ ...m, nrv: preload }));
  }, []);

  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const { pathname, hash } = window.location;
    window.history.replaceState(window.history.state, '', pathname + searchFromNrv(nrv) + hash);
  }, [nrv]);

  const change = (patch: Partial<Nrv>) =>
    setModel((m) => ({ nrv: { ...m.nrv, ...patch }, heard: m.heard + 1 }));

  return (
    <LabShell
      className="lab nrv-lab"
      verdict={nrvVerdict(nrv)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div className="lab__mock nrv-mock" data-lab-mock aria-hidden="true" inert ref={mock}>
        <NrvMock nrv={nrv} labelId={labelId} />
      </div>

      <div className="nrv-controls">
        <Choice
          name={`${id}-el`}
          legend="Role: the element"
          options={CONTROLS}
          value={nrv.control}
          onChange={(control) => change({ control })}
        />
        <Choice
          name={`${id}-name`}
          legend="Name: where it comes from"
          options={NAMES}
          value={nrv.name}
          onChange={(name) => change({ name })}
        />
        <Choice
          name={`${id}-state`}
          legend="State: the attribute"
          options={STATES}
          value={nrv.state}
          onChange={(state) => change({ state })}
        />
        <label className="nrv-on">
          <input type="checkbox" checked={nrv.on} onChange={(e) => change({ on: e.target.checked })} />
          Switched on
        </label>
      </div>

      <div className="nrv-out">
        <div className="nrv-code">
          <p className="alog__h">The markup</p>
          <code>{markupOf(nrv)}</code>
        </div>
        <AnnouncementLog id={id} lines={lines} />
      </div>
    </LabShell>
  );
}
