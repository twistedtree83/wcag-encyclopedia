import type { ComponentType } from 'react';
import { AnnouncementLog } from '../labs/AnnouncementLog';
import { spoken } from '../labs/announce';
import { lastOf, logOf, type StageEvent } from './events';

/**
 * The instruments a live example's stage can carry (#43, CONTEXT.md "Instrument"), by id. A
 * record's live example names them in `instruments`; the stage draws each one directly beneath
 * the example, in that order, and feeds it the stage's events, simulated or real alike.
 *
 * An instrument is a pure view of the events: no state of its own, no reading of the DOM.
 * Adding one: write the component, then add ONE line to INSTRUMENTS (parallel tickets each add
 * their own line, so keep one entry per line, in any order).
 */

export type InstrumentProps = {
  /** A unique prefix for ids, from the stage's `useId`. */
  readonly id: string;
  readonly events: readonly StageEvent[];
};

/** The announcement log under a stage: what a screen reader said as the reader operated it. */
function LogInstrument({ id, events }: InstrumentProps) {
  return <AnnouncementLog id={id} lines={logOf(events)} empty="Nothing said yet." />;
}

/** What the last "Autofill" put in each field (#49). */
function AutofillInstrument({ id, events }: InstrumentProps) {
  const last = lastOf(events, 'autofill');
  return (
    <div className="alog">
      <p className="alog__h" id={`${id}-h`}>
        Autofill
      </p>
      {last ? (
        <ol aria-labelledby={`${id}-h`}>
          {last.fields.map((f, i) => (
            <li key={i} className={f.value ? undefined : 'alog__blank'}>
              {f.name}: {f.value || 'left empty'}
            </li>
          ))}
        </ol>
      ) : (
        <p className="alog__empty">Not tried yet.</p>
      )}
    </div>
  );
}

/** What the last voice command was, and what it clicked (#49). */
function VoiceInstrument({ id, events }: InstrumentProps) {
  const last = lastOf(events, 'voice');
  return (
    <div className="alog">
      <p className="alog__h" id={`${id}-h`}>
        Voice control
      </p>
      {last ? (
        <ol aria-labelledby={`${id}-h`}>
          <li>You said “{last.phrase}”</li>
          <li className={last.clicked ? undefined : 'alog__blank'}>
            {last.clicked ? `Clicked ${spoken(last.clicked)}` : 'Nothing matched'}
          </li>
        </ol>
      ) : (
        <p className="alog__empty">Nothing said yet.</p>
      )}
    </div>
  );
}

export const INSTRUMENTS: Readonly<Record<string, ComponentType<InstrumentProps>>> = {
  'announcement-log': LogInstrument,
  autofill: AutofillInstrument,
  'voice-control': VoiceInstrument,
};

/** The ids in `ids` that no registered instrument answers to. Empty when all resolve. */
export function unresolvedInstruments(ids: readonly string[]): string[] {
  return ids.filter((id) => !Object.hasOwn(INSTRUMENTS, id));
}
