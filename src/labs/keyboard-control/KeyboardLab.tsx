import { useId, useRef, useState } from 'react';
import { AnnouncementLog, useAnnouncementLog } from '../shared/AnnouncementLog';
import {
  CONTROLS,
  KB_START,
  MARKUP,
  basketText,
  kbChoose,
  kbPress,
  kbSaid,
  kbVerdict,
  type Kb,
  type KbKey,
} from './keyboard';
import { LabShell, type Said } from '../shared/LabShell';
import { Choice } from '../name-role-value/NameRoleValueLab';

/**
 * The 2.1.1 lab (#45): the reader builds "Add to basket" as a click-only div, a div with
 * tabindex or a real button, then tries it with simulated Tab, Enter and Space. A drawn ring
 * shows where simulated focus is; the log says what a screen reader calls the control.
 *
 * The mock is depicted: inert and hidden from assistive technology. A click-only div on the
 * real page would fail 2.1.1 for real, so the keys are simulated.
 */

type Model = { readonly kb: Kb; readonly said: Said | null };

const START: Model = { kb: KB_START, said: null };

const KEYS: readonly { readonly key: KbKey; readonly label: string }[] = [
  { key: 'tab', label: 'Press Tab' },
  { key: 'enter', label: 'Press Enter' },
  { key: 'space', label: 'Press Space' },
];

export function KeyboardLab() {
  const id = useId();
  const [{ kb, said }, setModel] = useState<Model>(START);
  const control = useRef<HTMLDivElement>(null);
  const lines = useAnnouncementLog(control, kb.control);
  const ring = kb.focused ? ' is-focus' : '';

  return (
    <LabShell
      className="lab kb-lab"
      verdict={kbVerdict(kb.control)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div className="lab__mock kb-mock" data-lab-mock aria-hidden="true" inert>
        <span className="kb-mock__field">Quantity: 1</span>
        <div ref={control}>
          {kb.control === 'button' ? (
            <button type="button" className={`realbtn${ring}`} tabIndex={-1}>
              Add to basket
            </button>
          ) : (
            <div
              className={`fakebtn${ring}`}
              tabIndex={kb.control === 'focusable' ? 0 : undefined}
            >
              Add to basket
            </div>
          )}
        </div>
        <span className="kb-mock__count">{basketText(kb.basket)}</span>
      </div>

      <div className="lab-controls">
        <Choice
          name={`${id}-control`}
          legend="Build the control as"
          options={CONTROLS}
          value={kb.control}
          onChange={(c) => setModel({ kb: kbChoose(kb, c), said: { text: kbSaid(c) } })}
        />
        <div className="kb-keys" role="group" aria-label="Try it by keyboard">
          {KEYS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className="btn o sm"
              onClick={() =>
                setModel((m) => {
                  const next = kbPress(m.kb, key);
                  return { kb: next, said: { text: next.last ?? '' } };
                })
              }
            >
              {label}
            </button>
          ))}
          <output className="kb-last" aria-live="off">
            {kb.last ?? 'No key pressed yet.'}
          </output>
        </div>
      </div>

      <div className="lab-out">
        <div className="lab-code">
          <p className="alog__h">The markup</p>
          <code>{MARKUP[kb.control]}</code>
        </div>
        <AnnouncementLog id={id} lines={lines} title="A screen reader calls it" />
      </div>
    </LabShell>
  );
}
