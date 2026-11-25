import { useId, useMemo, useRef, useState } from 'react';
import { AnnouncementLog, useAnnouncementLog } from './AnnouncementLog';
import { LabShell, type Said } from './LabShell';
import { LIN_START, linName, linSaid, linVerdict, voiceMatches, type Lin } from './labelInName';

/**
 * The 2.5.3 lab (#49): the reader edits a mock button's visible text and its aria-label
 * separately. The announcement log says the name a screen reader hears, and a simulated voice
 * command, "click" plus the visible text, shows whether voice control can reach the button.
 *
 * The mock is depicted: inert and hidden from assistive technology. The log speaks for it.
 */

type Model = { readonly lin: Lin; readonly heard: number };

const START: Model = { lin: LIN_START, heard: 0 };

export function LabelInNameLab() {
  const id = useId();
  const [{ lin, heard }, setModel] = useState<Model>(START);
  const mock = useRef<HTMLDivElement>(null);
  const lines = useAnnouncementLog(mock, lin);
  const said = useMemo<Said | null>(
    () => (heard > 0 ? { text: linSaid(lin) } : null),
    [heard, lin],
  );
  const change = (patch: Partial<Lin>) =>
    setModel((m) => ({ lin: { ...m.lin, ...patch }, heard: m.heard + 1 }));

  const visible = lin.visible.trim();
  const reached = voiceMatches(visible, linName(lin));

  return (
    <LabShell
      className="lab lin-lab"
      verdict={linVerdict(lin)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div className="lab__mock lin-mock" data-lab-mock aria-hidden="true" inert ref={mock}>
        <button
          type="button"
          tabIndex={-1}
          className="namebox__visual"
          aria-label={lin.ariaLabel.trim() ? lin.ariaLabel : undefined}
        >
          {lin.visible}
        </button>
      </div>

      <div className="lab-controls">
        <div className="lin-field">
          <label htmlFor={`${id}-visible`}>Visible text on the button</label>
          <input
            id={`${id}-visible`}
            type="text"
            value={lin.visible}
            onChange={(e) => change({ visible: e.target.value })}
          />
        </div>
        <div className="lin-field">
          <label htmlFor={`${id}-aria`}>aria-label</label>
          <input
            id={`${id}-aria`}
            type="text"
            aria-describedby={`${id}-aria-hint`}
            value={lin.ariaLabel}
            onChange={(e) => change({ ariaLabel: e.target.value })}
          />
          <p className="lin-hint" id={`${id}-aria-hint`}>
            Leave it empty for no aria-label.
          </p>
        </div>
      </div>

      <div className="lab-out">
        <div className="alog">
          <p className="alog__h" id={`${id}-voice`}>
            Voice control
          </p>
          <ol aria-labelledby={`${id}-voice`}>
            <li>{visible ? `You say “click ${visible}”` : 'No visible text to say'}</li>
            <li className={reached ? undefined : 'alog__blank'}>
              {reached ? 'It clicks the button' : 'Nothing happens'}
            </li>
          </ol>
        </div>
        <AnnouncementLog id={id} lines={lines} />
      </div>
    </LabShell>
  );
}
