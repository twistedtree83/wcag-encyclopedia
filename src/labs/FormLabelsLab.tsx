import { useId, useMemo, useRef, useState } from 'react';
import { AnnouncementLog, useAnnouncementLog } from './AnnouncementLog';
import {
  FL_HINT,
  FL_LABEL,
  FL_START,
  LABEL_SHOWN,
  flSaid,
  flVerdict,
  onScreen,
  type FormLabels,
} from './formLabels';
import { LabShell, type Said } from './LabShell';
import { Choice } from './NameRoleValueLab';

/**
 * The 3.3.2 lab (#52): the reader switches a field between a placeholder alone and a persistent
 * visible label with its format, and types into it. What is typed appears in the mock, so a
 * placeholder visibly vanishes; the log says what a screen reader hears, and a readout what is
 * still on screen.
 *
 * The mock is a depicted field: inert and hidden from assistive technology. The log speaks for it.
 */

type Model = {
  readonly f: FormLabels;
  /** Counts the reader's changes; 0 at the start and after Reset. */
  readonly heard: number;
};

const START: Model = { f: FL_START, heard: 0 };

/** The mock field after the reader's choices, holding what they typed. */
export function FormLabelsMock({ f, id }: { readonly f: FormLabels; readonly id: string }) {
  const field = `${id}-dob`;
  const hint = `${id}-hint`;
  if (f.shown === 'placeholder') {
    return (
      <div className="lform">
        <input
          type="text"
          tabIndex={-1}
          readOnly
          value={f.typed}
          placeholder={FL_LABEL}
          className="lform__field"
        />
      </div>
    );
  }
  return (
    <div className="lform">
      <label className="lform__label" htmlFor={field}>
        {FL_LABEL}
      </label>
      <p className="lform__hint" id={hint}>
        {FL_HINT}
      </p>
      <input
        id={field}
        type="text"
        tabIndex={-1}
        readOnly
        value={f.typed}
        aria-describedby={hint}
        className="lform__field"
      />
    </div>
  );
}

export function FormLabelsLab() {
  const id = useId();
  const [{ f, heard }, setModel] = useState<Model>(START);
  const mock = useRef<HTMLDivElement>(null);
  const lines = useAnnouncementLog(mock, f);

  // Only the reader's own changes are spoken: Reset leaves `heard` at 0.
  const said = useMemo<Said | null>(
    () => (heard > 0 ? { text: flSaid(f, lines) } : null),
    [heard, f, lines],
  );

  const change = (patch: Partial<FormLabels>) =>
    setModel((m) => ({ f: { ...m.f, ...patch }, heard: m.heard + 1 }));

  return (
    <LabShell
      className="lab flab"
      verdict={flVerdict(f)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div className="lab__mock flab__mock" data-lab-mock aria-hidden="true" inert ref={mock}>
        <FormLabelsMock f={f} id={id} />
      </div>

      <div className="lab-controls">
        <Choice
          name={`${id}-shown`}
          legend="What labels the field"
          options={LABEL_SHOWN}
          value={f.shown}
          onChange={(shown) => change({ shown })}
        />
        <label className="flab__type">
          Type into the field
          <input
            type="text"
            autoComplete="off"
            value={f.typed}
            onChange={(e) => change({ typed: e.target.value })}
          />
        </label>
      </div>

      <div className="lab-out">
        <output className="flab__screen" aria-live="off">
          {onScreen(f)}
        </output>
        <AnnouncementLog id={id} lines={lines} />
      </div>
    </LabShell>
  );
}
