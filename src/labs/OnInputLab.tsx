import { useId, useState } from 'react';
import { LabShell, type Said } from './LabShell';
import { Choice } from './NameRoleValueLab';
import {
  ADDRESS,
  COUNTRIES,
  COUNTRY,
  OI_NAME,
  OI_START,
  WHEN,
  oiChoose,
  oiGo,
  oiVerdict,
  oiWhen,
  type OnInput,
  type Step,
} from './onInput';

/**
 * The 3.2.2 lab (#59): the reader decides whether changing the country in a depicted checkout
 * goes to that country's page by itself or waits for Go, then changes it. Every page change
 * happens inside the mock, which is inert and hidden from assistive technology; the reader's
 * controls sit beside it.
 */

type Model = {
  readonly o: OnInput;
  /** What the last change of the reader's says; null at the start and after Reset. */
  readonly said: Said | null;
};

const START: Model = { o: OI_START, said: null };

/** The depicted checkout page: its address, the typed name, the country select and maybe Go. */
export function OnInputMock({ o, id }: { readonly o: OnInput; readonly id: string }) {
  return (
    <div className="olab__page">
      <p className="addrbar" data-page={o.page}>
        {ADDRESS[o.page]}
      </p>
      <div className="lform">
        <label className="lform__label" htmlFor={`${id}-name`}>
          Name
        </label>
        <input
          id={`${id}-name`}
          type="text"
          tabIndex={-1}
          readOnly
          value={o.kept ? OI_NAME : ''}
          className="lform__field"
        />
        <label className="lform__label" htmlFor={`${id}-country`}>
          Country
        </label>
        <select id={`${id}-country`} tabIndex={-1} value={o.chosen} onChange={() => {}} className="lform__field">
          {COUNTRIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        {o.when === 'go' ? (
          <span className="btn p sm">Go</span>
        ) : null}
      </div>
    </div>
  );
}

export function OnInputLab() {
  const id = useId();
  const [{ o, said }, setModel] = useState<Model>(START);
  const apply = (step: (o: OnInput) => Step) =>
    setModel((m) => {
      const next = step(m.o);
      return { o: next.o, said: { text: next.said } };
    });

  return (
    <LabShell className="lab flab olab" verdict={oiVerdict(o)} said={said} onReset={() => setModel(START)}>
      <div className="lab__mock flab__mock" data-lab-mock aria-hidden="true" inert>
        <OnInputMock o={o} id={id} />
      </div>

      <div className="lab-controls">
        <Choice
          name={`${id}-when`}
          legend="When the country changes, the page"
          options={WHEN}
          value={o.when}
          onChange={(when) => apply((m) => oiWhen(m, when))}
        />
        <Choice
          name={`${id}-country`}
          legend="Choose the country"
          options={COUNTRIES}
          value={o.chosen}
          onChange={(c) => apply((m) => oiChoose(m, c))}
        />
        {o.when === 'go' ? (
          <button type="button" className="btn o sm" onClick={() => apply(oiGo)}>
            Press Go
          </button>
        ) : null}
      </div>

      <p className="olab__out">
        <output aria-live="off">
          On the page: {ADDRESS[o.page]}. Name: {o.kept ? OI_NAME : 'empty'}. Country: {COUNTRY[o.chosen]}.
        </output>
      </p>
    </LabShell>
  );
}
