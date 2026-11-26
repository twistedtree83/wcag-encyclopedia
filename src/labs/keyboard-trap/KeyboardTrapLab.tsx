import { useId, useState } from 'react';
import {
  TRAP_MODES,
  TRAP_START,
  trapChoose,
  trapLeave,
  trapPress,
  trapSaid,
  trapVerdict,
  whereText,
  type Trap,
  type TrapAt,
} from './keyboardTrap';
import { LabShell, type Said } from '../shared/LabShell';
import { Choice } from '../name-role-value/NameRoleValueLab';

/**
 * The 2.1.2 lab (#45): a newsletter widget drawn inside the mock traps simulated focus, traps it
 * with Escape as the exit, or lets it go. The reader steps simulated focus with "Press Tab" and
 * "Press Escape" and watches the drawn ring loop or leave.
 *
 * The trap is drawn, never real: the mock is inert and hidden from assistive technology, every
 * control here is an ordinary button or radio that real Tab passes through, and "Take focus out
 * of the widget" always brings simulated focus back, whatever the widget does.
 */

type Model = { readonly trap: Trap; readonly said: Said | null };

const START: Model = { trap: TRAP_START, said: null };

export function KeyboardTrapLab() {
  const id = useId();
  const [{ trap, said }, setModel] = useState<Model>(START);
  const ring = (at: TrapAt) => (trap.at === at ? ' is-focus' : '');
  const act = (next: (t: Trap) => Trap) =>
    setModel((m) => {
      const t = next(m.trap);
      return { trap: t, said: { text: t.last ?? '' } };
    });

  return (
    <LabShell
      className="lab trap-lab"
      verdict={trapVerdict(trap.mode)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div className="lab__mock trap-mock" data-lab-mock aria-hidden="true" inert>
        <div className={trap.mode === 'trap' ? 'trap' : 'trap trap--ok'}>
          <span className="trap__title">Newsletter</span>
          <span className={`swatch-field border--strong${ring('email')}`}>you@example.com</span>
          <span className={`realbtn trap-mock__btn${ring('subscribe')}`}>Subscribe</span>
          <span className="trap__cycle">
            {trap.mode === 'trap'
              ? 'Tab ⟲ cycles between these two, forever'
              : trap.mode === 'exit'
                ? 'Tab ⟲ loops · Escape lets focus out'
                : 'Tab moves on to the page'}
          </span>
        </div>
        <span className={`trap-mock__next${ring('after')}`}>Next: read the article</span>
      </div>

      <div className="lab-controls">
        <Choice
          name={`${id}-mode`}
          legend="The widget"
          options={TRAP_MODES}
          value={trap.mode}
          onChange={(mode) => setModel({ trap: trapChoose(trap, mode), said: { text: trapSaid(mode) } })}
        />
        <div className="kb-keys" role="group" aria-label="Simulated keys, inside the drawing">
          <button type="button" className="btn o sm" onClick={() => act((t) => trapPress(t, 'tab'))}>
            Press Tab
          </button>
          <button
            type="button"
            className="btn o sm"
            onClick={() => act((t) => trapPress(t, 'escape'))}
          >
            Press Escape
          </button>
          <button type="button" className="btn o sm" onClick={() => act(trapLeave)}>
            Take focus out of the widget
          </button>
          <output className="kb-last" aria-live="off">
            Simulated focus: {whereText(trap)}.
          </output>
        </div>
      </div>

      <div className="lab-out">
        <p className="lab-note">
          {trap.last ??
            'Only the drawing is ever trapped. Your own focus moves through this lab as usual.'}
        </p>
      </div>
    </LabShell>
  );
}
