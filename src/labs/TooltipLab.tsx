import { useMemo, useState } from 'react';
import { LabShell, type Said } from './LabShell';
import {
  CONDITIONS,
  TIP_START,
  TIP_TEXT,
  tipAct,
  tipSaid,
  tipVerdict,
  withConditions,
  type TipAction,
  type TipLab,
} from './tooltip';

/**
 * The 1.4.13 lab (#47): the reader sets the tooltip's three behaviours and tries to read it with a
 * simulated pointer and keys. The mock is depicted (inert, hidden from assistive technology); the
 * pointer in it is drawn, and the readout says what is open.
 */

type Model = { readonly lab: TipLab; readonly heard: number };

const START: Model = { lab: TIP_START, heard: 0 };

const ACTIONS: readonly { readonly action: TipAction; readonly label: string }[] = [
  { action: 'hover', label: 'Hover the words' },
  { action: 'into', label: 'Move into the tooltip' },
  { action: 'wait', label: 'Wait five seconds' },
  { action: 'escape', label: 'Press Escape' },
];

function Cursor() {
  return (
    <svg className="tt-cursor" viewBox="0 0 16 22" width="16" height="22" focusable="false">
      <path d="M1 1 L1 17 L5 13 L8 20 L11 19 L8 12 L14 12 Z" />
    </svg>
  );
}

export function TooltipLab() {
  const [{ lab, heard }, setModel] = useState<Model>(START);
  const said = useMemo<Said | null>(() => (heard > 0 ? { text: tipSaid(lab) } : null), [heard, lab]);
  const update = (next: (l: TipLab) => TipLab) =>
    setModel((m) => ({ lab: next(m.lab), heard: m.heard + 1 }));

  return (
    <LabShell className="lab tip-lab" verdict={tipVerdict(lab)} said={said} onReset={() => setModel(START)}>
      <div className="lab__mock tt-mock" data-lab-mock aria-hidden="true" inert>
        <p className="example-prose tt-line">
          Estimated total{' '}
          <span className="tipword tt-word">
            incl. duties
            {lab.pointer === 'word' ? <Cursor /> : null}
          </span>
          <span className={lab.conditions.hoverable ? 'tt-spot tt-spot--near' : 'tt-spot'}>
            {lab.open ? <span className="tt-tip">{TIP_TEXT}</span> : null}
            {lab.pointer === 'tip' ? <Cursor /> : null}
          </span>
        </p>
      </div>

      <div className="lab-controls">
        <fieldset className="sem-choice">
          <legend>The tooltip</legend>
          {CONDITIONS.map(({ condition, label }) => (
            <label key={condition}>
              <input
                type="checkbox"
                checked={lab.conditions[condition]}
                onChange={(e) =>
                  update((l) => withConditions({ ...l.conditions, [condition]: e.target.checked }))
                }
              />
              {label}
            </label>
          ))}
        </fieldset>
        <fieldset className="sem-choice tt-acts">
          <legend>Try to read it</legend>
          {ACTIONS.map(({ action, label }) => (
            <button
              key={action}
              type="button"
              className="btn o sm"
              onClick={() => update((l) => tipAct(l, action))}
            >
              {label}
            </button>
          ))}
        </fieldset>
      </div>

      <output className="lab-code tt-now" aria-live="off">
        {lab.open ? `Open: “${TIP_TEXT}”` : 'No tooltip is open.'}
      </output>
    </LabShell>
  );
}
