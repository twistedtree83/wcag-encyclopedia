import { useId, useMemo, useState } from 'react';
import { LabChoice } from '../shared/LabChoice';
import { LabShell, type Said } from '../shared/LabShell';
import {
  CANCEL_FIRES,
  CANCEL_START,
  DRAG_REORDERS,
  DRAG_START,
  MAP_START,
  MAP_ZOOMS,
  MOTION_BUTTONS,
  MOTION_SHAKING,
  MOTION_START,
  cancelSaid,
  cancelVerdict,
  dragSaid,
  dragVerdict,
  mapSaid,
  mapVerdict,
  motionSaid,
  motionVerdict,
  shake,
  slideOff,
} from './pointerVerdicts';

/**
 * The pointer labs (#58): 2.5.1, 2.5.2, 2.5.4 and 2.5.7. Each mock is a drawing, inert and hidden
 * from assistive technology; the reader switches its design with radio groups, and for 2.5.2 and
 * 2.5.4 makes the gesture with one button. Models and wording in `pointerVerdicts.ts`.
 */

/** A lab's state with how many changes the reader has made, so `said` is new for each one. */
type Model<S> = { readonly lab: S; readonly heard: number };

function useLab<S>(start: S, say: (s: S) => string) {
  const [{ lab, heard }, setModel] = useState<Model<S>>({ lab: start, heard: 0 });
  const said = useMemo<Said | null>(() => (heard > 0 ? { text: say(lab) } : null), [heard, lab, say]);
  const update = (next: (s: S) => S) => setModel((m) => ({ lab: next(m.lab), heard: m.heard + 1 }));
  const reset = () => setModel({ lab: start, heard: 0 });
  return { lab, said, update, reset };
}

export function PointerGesturesLab() {
  const id = useId();
  const { lab, said, update, reset } = useLab(MAP_START, mapSaid);
  const buttons = lab.zoom === 'buttons';
  return (
    <LabShell className="lab pg-lab" verdict={mapVerdict(lab)} said={said} onReset={reset}>
      <div className="lab__mock ptr-mock" data-lab-mock aria-hidden="true" inert>
        <div className="ptr-map">
          <span className="ptr-map__hint">pinch to zoom</span>
          {buttons ? (
            <span className="ptr-map__zoom">
              <span className="ptr-key">+</span>
              <span className="ptr-key">−</span>
            </span>
          ) : null}
        </div>
      </div>
      <div className="lab-controls">
        <LabChoice
          name={`${id}-zoom`}
          legend="The map zooms by"
          options={MAP_ZOOMS}
          value={lab.zoom}
          onChange={(zoom) => update(() => ({ zoom }))}
        />
        <output className="lab-code" aria-live="off">
          {buttons ? 'With one finger: + and − zoom' : 'With one finger: no way to zoom'}
        </output>
      </div>
    </LabShell>
  );
}

export function PointerCancellationLab() {
  const id = useId();
  const { lab, said, update, reset } = useLab(CANCEL_START, cancelSaid);
  return (
    <LabShell className="lab pc-lab" verdict={cancelVerdict(lab)} said={said} onReset={reset}>
      <div className="lab__mock ptr-mock" data-lab-mock aria-hidden="true" inert>
        <div className="ptr-press">
          <span className={lab.last === 'deleted' ? 'ptr-draft is-gone' : 'ptr-draft'}>
            Draft: notes for Monday
          </span>
          <span className="ptr-key ptr-key--wide">Delete draft</span>
          <span className="ptr-note">acts on pointer {lab.fires}</span>
        </div>
      </div>
      <div className="lab-controls">
        <LabChoice
          name={`${id}-fires`}
          legend="Delete draft acts on"
          options={CANCEL_FIRES}
          value={lab.fires}
          onChange={(fires) => update(() => ({ fires, last: null }))}
        />
        <div className="ptr-try">
          <button type="button" className="btn o sm" onClick={() => update(slideOff)}>
            Press and slide off
          </button>
          <output className="lab-code" aria-live="off">
            {lab.last === 'deleted'
              ? 'Deleted on the way down'
              : lab.last === 'cancelled'
                ? 'Slid off: nothing deleted'
                : 'Not tried yet'}
          </output>
        </div>
      </div>
    </LabShell>
  );
}

export function MotionActuationLab() {
  const id = useId();
  const { lab, said, update, reset } = useLab(MOTION_START, motionSaid);
  return (
    <LabShell className="lab ma-lab" verdict={motionVerdict(lab)} said={said} onReset={reset}>
      <div className="lab__mock ptr-mock" data-lab-mock aria-hidden="true" inert>
        <div className={lab.last === 'undid' ? 'ptr-phone is-shaken' : 'ptr-phone'}>
          <span className="ptr-phone__msg">
            {lab.last === 'undid' ? '“Lunch on Friday” is back' : 'Archived “Lunch on Friday”'}
          </span>
          {lab.button ? <span className="ptr-key">↺ Undo</span> : null}
          <span className="ptr-note">
            {lab.shaking === 'always'
              ? 'Shake to undo (no setting)'
              : `Settings: shake to undo ${lab.shaking}`}
          </span>
        </div>
      </div>
      <div className="lab-controls">
        <LabChoice
          name={`${id}-button`}
          legend="Undo button"
          options={MOTION_BUTTONS}
          value={lab.button ? 'shown' : 'none'}
          onChange={(v) => update((s) => ({ ...s, button: v === 'shown', last: null }))}
        />
        <LabChoice
          name={`${id}-shaking`}
          legend="Shake to undo"
          options={MOTION_SHAKING}
          value={lab.shaking}
          onChange={(shaking) => update((s) => ({ ...s, shaking, last: null }))}
        />
        <div className="ptr-try">
          <button type="button" className="btn o sm" onClick={() => update(shake)}>
            Shake the phone
          </button>
          <output className="lab-code" aria-live="off">
            {lab.last === 'undid' ? 'Undid the archive' : lab.last === 'ignored' ? 'Ignored the shake' : 'Not shaken yet'}
          </output>
        </div>
      </div>
    </LabShell>
  );
}

const ROWS = ['Collect from store', 'Standard delivery', 'Next day'];

export function DraggingMovementsLab() {
  const id = useId();
  const { lab, said, update, reset } = useLab(DRAG_START, dragSaid);
  const buttons = lab.reorder === 'buttons';
  return (
    <LabShell className="lab dm-lab" verdict={dragVerdict(lab)} said={said} onReset={reset}>
      <div className="lab__mock ptr-mock" data-lab-mock aria-hidden="true" inert>
        <div className="ptr-list">
          {ROWS.map((row) => (
            <span key={row} className="ptr-list__row">
              <span className="ptr-list__handle">⠿</span>
              {row}
              {buttons ? (
                <span className="ptr-list__moves">
                  <span className="ptr-key">↑</span>
                  <span className="ptr-key">↓</span>
                </span>
              ) : null}
            </span>
          ))}
        </div>
      </div>
      <div className="lab-controls">
        <LabChoice
          name={`${id}-reorder`}
          legend="Rows are reordered by"
          options={DRAG_REORDERS}
          value={lab.reorder}
          onChange={(reorder) => update(() => ({ reorder }))}
        />
        <output className="lab-code" aria-live="off">
          {buttons ? 'Without dragging: one tap moves a row' : 'Without dragging: nothing moves'}
        </output>
      </div>
    </LabShell>
  );
}
