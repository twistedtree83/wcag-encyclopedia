import { useId, useMemo, useRef, useState } from 'react';
import { AnnouncementLog, useAnnouncementLog } from './AnnouncementLog';
import { LabShell, type Said } from './LabShell';
import { Choice } from './NameRoleValueLab';
import {
  LAYOUTS,
  SEQ_START,
  SOURCES,
  STEP,
  readingOrder,
  screenOrder,
  seqSaid,
  seqVerdict,
  type Seq,
} from './sequence';

/**
 * The 1.3.2 lab (#49): the reader orders three checkout steps in the source and chooses whether
 * CSS `order` sorts them on screen. The announcement log reads the mock in source order, so CSS
 * that makes a scrambled source look right is heard for what it is.
 *
 * The mock is depicted: inert and hidden from assistive technology. The log speaks for it.
 */

type Model = { readonly seq: Seq; readonly heard: number };

const START: Model = { seq: SEQ_START, heard: 0 };

export function SequenceLab() {
  const id = useId();
  const [{ seq, heard }, setModel] = useState<Model>(START);
  const mock = useRef<HTMLDivElement>(null);
  const lines = useAnnouncementLog(mock, seq);
  const said = useMemo<Said | null>(
    () => (heard > 0 ? { text: seqSaid(seq) } : null),
    [heard, seq],
  );
  const change = (patch: Partial<Seq>) =>
    setModel((m) => ({ seq: { ...m.seq, ...patch }, heard: m.heard + 1 }));

  return (
    <LabShell
      className="lab seq-lab"
      verdict={seqVerdict(seq)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div className="lab__mock seq-mock" data-lab-mock aria-hidden="true" inert ref={mock}>
        <div className="seq">
          {readingOrder(seq).map((s) => (
            <div
              key={s}
              className="seq__step"
              style={seq.layout === 'order' ? { order: STEP[s].num } : undefined}
            >
              <b>{STEP[s].num}.</b> {STEP[s].label}
            </div>
          ))}
        </div>
      </div>

      <div className="lab-controls">
        <Choice
          name={`${id}-source`}
          legend="Source order: the markup"
          options={SOURCES}
          value={seq.source}
          onChange={(source) => change({ source })}
        />
        <Choice
          name={`${id}-layout`}
          legend="CSS on the row"
          options={LAYOUTS}
          value={seq.layout}
          onChange={(layout) => change({ layout })}
        />
      </div>

      <div className="lab-out">
        <div className="lab-code">
          <p className="alog__h">On screen, left to right</p>
          <code>
            {screenOrder(seq)
              .map((s) => `${STEP[s].num}. ${STEP[s].label}`)
              .join(' → ')}
          </code>
        </div>
        <AnnouncementLog id={id} lines={lines} title="Screen reader reads, in source order" />
      </div>
    </LabShell>
  );
}
