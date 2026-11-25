import { useId, useMemo, useRef, useState } from 'react';
import { AnnouncementLog, useAnnouncementLog } from './AnnouncementLog';
import { ES_START, ES_TEXT, ES_VALUE, MESSAGES, esSaid, esVerdict, type ErrorSuggestion } from './errorSuggestion';
import { LabShell, type Said } from './LabShell';
import { Choice } from './NameRoleValueLab';

/**
 * The 3.3.3 lab (#59): the reader submits a mock form with a two-digit year and picks what the
 * error says, "Invalid input" or the format with an example. The log says what a screen reader
 * hears. The mock is a depicted form: inert and hidden from assistive technology.
 */

type Model = {
  readonly s: ErrorSuggestion;
  /** Counts the reader's changes; 0 at the start and after Reset. */
  readonly heard: number;
};

const START: Model = { s: ES_START, heard: 0 };

/** The mock form after the reader's choices: one date field, and its error once submitted. */
export function ErrorSuggestionMock({ s, id }: { readonly s: ErrorSuggestion; readonly id: string }) {
  const field = `${id}-date`;
  const err = `${id}-err`;
  return (
    <div className="lform">
      <label className="lform__label" htmlFor={field}>
        Date
      </label>
      <input
        id={field}
        type="text"
        tabIndex={-1}
        readOnly
        value={ES_VALUE}
        className={s.submitted ? 'lform__field lform__field--bad' : 'lform__field'}
        {...(s.submitted ? { 'aria-invalid': true, 'aria-describedby': err } : {})}
      />
      {s.submitted ? (
        <p className="lform__err" id={err}>
          <span aria-hidden="true">✕ </span>
          {ES_TEXT[s.message]}
        </p>
      ) : null}
    </div>
  );
}

export function ErrorSuggestionLab() {
  const id = useId();
  const [{ s, heard }, setModel] = useState<Model>(START);
  const mock = useRef<HTMLDivElement>(null);
  const lines = useAnnouncementLog(mock, s);

  // Only the reader's own changes are spoken: Reset leaves `heard` at 0.
  const said = useMemo<Said | null>(
    () => (heard > 0 ? { text: esSaid(s, lines) } : null),
    [heard, s, lines],
  );

  const change = (patch: Partial<ErrorSuggestion>) =>
    setModel((m) => ({ s: { ...m.s, ...patch }, heard: m.heard + 1 }));

  return (
    <LabShell className="lab flab eslab" verdict={esVerdict(s)} said={said} onReset={() => setModel(START)}>
      <div className="lab__mock flab__mock" data-lab-mock aria-hidden="true" inert ref={mock}>
        <ErrorSuggestionMock s={s} id={id} />
      </div>

      <div className="lab-controls">
        <Choice
          name={`${id}-message`}
          legend="What the error says"
          options={MESSAGES}
          value={s.message}
          onChange={(message) => change({ message })}
        />
        <button type="button" className="btn o sm" onClick={() => change({ submitted: true })}>
          Submit the form
        </button>
      </div>

      <AnnouncementLog id={id} lines={lines} />
    </LabShell>
  );
}
