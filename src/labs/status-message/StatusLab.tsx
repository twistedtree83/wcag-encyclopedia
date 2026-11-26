import { useId, useLayoutEffect, useRef, useState } from 'react';
import { liveRegionLines, fromDom, type Announcement } from '../shared/announce';
import { AnnouncementLog } from '../shared/AnnouncementLog';
import { LabShell, type Said } from '../shared/LabShell';
import { ADD, BASKET_START, basketMessage, statusSaid, statusVerdict, toggleSaid } from './statusMessage';

/**
 * The 4.1.3 lab (#51). The reader chooses whether a mock shop's "added to basket" message is a
 * status region, then presses Add to basket. The announcement log shows what a screen reader
 * announced, read from the mock's markup after the press: the status region's new text, or
 * nothing. Focus never moves; the press happens on the lab's own button.
 *
 * The mock is depicted, inert and hidden from assistive technology; the lab's one polite region
 * says what the reader's screen reader would have heard.
 */

/** The mock shop: a product, its depicted button, the basket count and the message. */
export function StatusMock({
  inRegion,
  count,
  message,
}: {
  readonly inRegion: boolean;
  readonly count: number;
  readonly message: string;
}) {
  return (
    <div className="status-shop">
      <p className="status-shop__item">Wireless headphones</p>
      <button type="button" tabIndex={-1} className="btn o sm">
        {ADD}
      </button>
      <p className="status-shop__basket">Basket ({count})</p>
      <p className="status-shop__msg" role={inRegion ? 'status' : undefined}>
        {message}
      </p>
    </div>
  );
}

type Model = {
  readonly inRegion: boolean;
  readonly count: number;
  readonly message: string;
  /** How many times the reader has pressed Add; the log is re-read after each. */
  readonly adds: number;
  readonly log: readonly Announcement[];
  readonly said: Said | null;
};

const START: Model = {
  inRegion: false,
  count: BASKET_START,
  message: '',
  adds: 0,
  log: [],
  said: null,
};

/** How many announcements the log keeps. */
const KEEP = 4;

export function StatusLab() {
  const id = useId();
  const [model, setModel] = useState<Model>(START);
  const mock = useRef<HTMLDivElement>(null);
  const { inRegion, count, message, adds, log, said } = model;

  // After each press, read what the mock's live regions now say: that is what is announced.
  useLayoutEffect(() => {
    if (adds === 0 || !mock.current) return;
    const announced = liveRegionLines(fromDom(mock.current)).filter((l) => l.name);
    setModel((m) => ({
      ...m,
      log: [...m.log, ...announced].slice(-KEEP),
      said: { text: statusSaid(announced.map((l) => l.name)) },
    }));
  }, [adds]);

  const add = () =>
    setModel((m) => ({ ...m, count: m.count + 1, message: basketMessage(m.count + 1), adds: m.adds + 1 }));

  return (
    <LabShell
      className="lab status-lab"
      verdict={statusVerdict(inRegion)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div className="lab__mock nrv-mock" data-lab-mock aria-hidden="true" inert ref={mock}>
        <StatusMock inRegion={inRegion} count={count} message={message} />
      </div>
      <div className="status-controls">
        <label className="nrv-on">
          <input
            type="checkbox"
            checked={inRegion}
            onChange={(e) => {
              const next = e.target.checked;
              setModel((m) => ({ ...m, inRegion: next, said: { text: toggleSaid(next) } }));
            }}
          />
          Put the message in a status region, role="status"
        </label>
        <button type="button" className="btn o sm" onClick={add}>
          Press {ADD}
        </button>
      </div>
      <div className="nrv-out">
        <div className="nrv-code">
          <p className="alog__h">The markup</p>
          <code>{inRegion ? '<p role="status">…</p>' : '<p>…</p>'}</code>
        </div>
        <AnnouncementLog id={id} lines={log} title="Screen reader announced" empty="Nothing announced yet." />
      </div>
    </LabShell>
  );
}
