import { useId, useState } from 'react';
import { LabShell, type Said } from './LabShell';
import { Choice } from './NameRoleValueLab';
import {
  BINDING,
  SC_MODES,
  WORD,
  scDictate,
  scSaid,
  scTypedSaid,
  scVerdict,
  type ScMode,
} from './shortcuts';

/**
 * The 2.1.4 lab (#45): "e" archives the message. The reader binds it always on, remapped to
 * Alt+E, or only while the message has focus, then dictates a phrase into the reply box and
 * watches the shortcut fire, or not.
 *
 * The mock is depicted: inert and hidden from assistive technology. Dictation is simulated.
 */

type Model = {
  readonly mode: ScMode;
  /** Whether the phrase has been dictated since the binding last changed. */
  readonly dictated: boolean;
  readonly said: Said | null;
};

const START: Model = { mode: 'always', dictated: false, said: null };

export function ShortcutLab() {
  const id = useId();
  const [{ mode, dictated, said }, setModel] = useState<Model>(START);
  const { typed, fired } = dictated ? scDictate(mode, WORD) : { typed: '', fired: 0 };

  return (
    <LabShell
      className="lab sc-lab"
      verdict={scVerdict(mode)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div className="lab__mock sc-mock" data-lab-mock aria-hidden="true" inert>
        <div className="sc-mock__msg">
          <b>Quarterly report</b>
          <span>{fired > 0 ? 'Archived' : 'In the inbox'}</span>
        </div>
        <span className="sc-mock__label">Reply</span>
        <span className="swatch-field border--strong sc-mock__reply">{typed || ' '}</span>
      </div>

      <div className="lab-controls">
        <Choice
          name={`${id}-mode`}
          legend="The archive shortcut"
          options={SC_MODES}
          value={mode}
          onChange={(m) => setModel({ mode: m, dictated: false, said: { text: scSaid(m) } })}
        />
        <div className="kb-keys" role="group" aria-label="Simulated speech input">
          <button
            type="button"
            className="btn o sm"
            onClick={() =>
              setModel((m) => ({ ...m, dictated: true, said: { text: scTypedSaid(m.mode) } }))
            }
          >
            Dictate “{WORD}”
          </button>
          <output className="kb-last" aria-live="off">
            {dictated
              ? fired > 0
                ? `Fired ${fired} times. The reply box got “${typed}”.`
                : `Nothing fired. The reply box got “${typed}”.`
              : 'Nothing dictated yet.'}
          </output>
        </div>
      </div>

      <div className="lab-out">
        <div className="lab-code">
          <p className="alog__h">The binding</p>
          <code>{BINDING[mode]}</code>
        </div>
      </div>
    </LabShell>
  );
}
