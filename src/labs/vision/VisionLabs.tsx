import { useId, useRef, useState } from 'react';
import { FailIcon, PassIcon } from '../../components/Icons';
import { VISION_FILTERS, type CueSeen, type VisionFilter } from '../../live/vision';
import { VisionDefs, filterPrefix, visionStyle } from '../../live/VisionDefs';
import { AnnouncementLog, useAnnouncementLog } from '../shared/AnnouncementLog';
import { LabChoice } from '../shared/LabChoice';
import { RatioExplained } from '../shared/RatioExplained';
import { LabShell, type Said } from '../shared/LabShell';
import { NT_BG, NT_START, ntState, type NonText } from './nonText';
import { BUTTON_NAME, INSTRUCTIONS, OTHER_NAME, SENSE_START, senseState, type Sensory } from './sensory';
import { UC_COLOURS, UC_START, ucState, type UseOfColour } from './useOfColour';

/**
 * The vision-filter labs (#56): 1.4.1, 1.4.11 and 1.3.3. Each mock is a depicted interface,
 * inert and hidden from assistive technology, drawn through the reader's chosen vision filter
 * (`VisionDefs`). The models measure the same colours the mocks are drawn in.
 */

const FILTER_OPTIONS = VISION_FILTERS.map((v) => ({ value: v.id, label: v.name }));

/** A lab's state with what to announce: `said` is null at the start and after Reset. */
type Model<T> = { readonly m: T; readonly said: Said | null };

function useLab<T>(start: T, sayOf: (m: T) => string) {
  const [model, setModel] = useState<Model<T>>({ m: start, said: null });
  const change = (patch: Partial<T>) =>
    setModel(({ m }) => {
      const next = { ...m, ...patch };
      return { m: next, said: { text: sayOf(next) } };
    });
  const reset = () => setModel({ m: start, said: null });
  return { ...model, change, reset };
}

function FilterChoice({
  id,
  value,
  onChange,
}: {
  readonly id: string;
  readonly value: VisionFilter;
  readonly onChange: (f: VisionFilter) => void;
}) {
  return (
    <LabChoice
      name={`${id}-filter`}
      legend="Vision filter"
      options={FILTER_OPTIONS}
      value={value}
      onChange={onChange}
    />
  );
}

/** Each cue's line, with a glyph and a word as well as colour. */
function CueList({ cues }: { readonly cues: readonly CueSeen[] }) {
  return (
    <ul className="lab-res vis-cues">
      {cues.map((c) => (
        <li key={c.label} className={c.found ? 'ok' : 'bad'}>
          <strong>
            {c.found ? <PassIcon /> : <FailIcon />}
            {c.found ? 'Stands out' : 'Lost'}
          </strong>
          <span>{c.line}</span>
        </li>
      ))}
    </ul>
  );
}

/** 1.4.1: links and a field in error that differ by hue alone, until an underline or icon. */
export function UseOfColourLab() {
  const id = useId();
  const prefix = filterPrefix(id);
  const { m, said, change, reset } = useLab<UseOfColour>(UC_START, (n) => ucState(n).said);
  const s = ucState(m);
  const link = { color: UC_COLOURS.link, textDecoration: m.underline ? 'underline' : 'none' };
  return (
    <LabShell className="lab vis-lab" verdict={s.verdict} said={said} onReset={reset}>
      <div
        className="lab__mock vis-lab__mock vis-target"
        data-lab-mock
        aria-hidden="true"
        inert
        style={{ background: UC_COLOURS.bg, color: UC_COLOURS.text, ...visionStyle(m.filter, prefix) }}
      >
        <p>
          Your order ships in two days. See the <span style={link}>delivery schedule</span> for
          cut-off times, or read the <span style={link}>returns policy</span>.
        </p>
        <div className="vis-lab__fields">
          <span className="vis-lab__label">Name</span>
          <span className="vis-lab__field" style={{ borderColor: UC_COLOURS.edge }}>
            Ada Lovelace
          </span>
          <span className="vis-lab__label">Email</span>
          <span className="vis-lab__field vis-lab__field--bad" style={{ borderColor: UC_COLOURS.error }}>
            ada@example
            {m.icon ? (
              <span className="vis-lab__icon" style={{ background: UC_COLOURS.error }}>
                !
              </span>
            ) : null}
          </span>
        </div>
      </div>
      <VisionDefs prefix={prefix} />

      <div className="lab-controls">
        <FilterChoice id={id} value={m.filter} onChange={(filter) => change({ filter })} />
        <fieldset className="sem-choice">
          <legend>Add a cue that is not colour</legend>
          <label>
            <input
              type="checkbox"
              checked={m.underline}
              onChange={(e) => change({ underline: e.currentTarget.checked })}
            />
            Underline the links
          </label>
          <label>
            <input
              type="checkbox"
              checked={m.icon}
              onChange={(e) => change({ icon: e.currentTarget.checked })}
            />
            Mark the error with an icon
          </label>
        </fieldset>
      </div>

      <CueList cues={s.cues} />
    </LabShell>
  );
}

/** 1.4.11: fade the edges of a field and a checkbox until they fail 3:1. */
export function NonTextContrastLab() {
  const id = useId();
  const prefix = filterPrefix(id);
  const { m, said, change, reset } = useLab<NonText>(NT_START, (n) => ntState(n).said);
  const s = ntState(m);
  const slider = `${id}-fade`;
  const edge = { borderColor: s.edge };
  return (
    <LabShell className="lab vis-lab" verdict={s.verdict} said={said} onReset={reset}>
      <div
        className="lab__mock vis-lab__mock vis-target"
        data-lab-mock
        aria-hidden="true"
        inert
        style={{ background: NT_BG, color: UC_COLOURS.text, ...visionStyle(m.filter, prefix) }}
      >
        <div className="vis-lab__fields">
          <span className="vis-lab__label">Email address</span>
          <span className="vis-lab__field" style={edge}>
            you@example.com
          </span>
          <span className="vis-lab__check">
            <span className="vis-lab__box" style={edge} />
            Email me order updates
          </span>
        </div>
      </div>
      <VisionDefs prefix={prefix} />

      <div className="lab-controls">
        <div className="slide">
          <label htmlFor={slider}>
            <span>Fade the edges</span>
            <span>{m.faded}% faded</span>
          </label>
          <input
            type="range"
            id={slider}
            min={0}
            max={100}
            value={m.faded}
            aria-valuetext={`${m.faded}% faded`}
            onChange={(e) => change({ faded: Number(e.currentTarget.value) })}
          />
        </div>
        <FilterChoice id={id} value={m.filter} onChange={(filter) => change({ filter })} />
      </div>

      <div className="labout">
        <span>Edges against the background</span>
        <output htmlFor={slider} aria-live="off">
          {s.ratioText}
        </output>
      </div>
      <RatioExplained ratio={s.ratio} />
      <ul className="lab-res">
        <li className={s.result.passes ? 'ok' : 'bad'}>
          <strong>
            {s.result.passes ? <PassIcon /> : <FailIcon />}
            {s.result.passes ? 'Passes' : 'Fails'}
          </strong>
          <span>
            {s.result.name}, {s.result.level}
          </span>
          <span>{s.result.sentence}</span>
        </li>
      </ul>
    </LabShell>
  );
}

/** 1.3.3: an instruction that points by shape, colour and place, or names the button. */
export function SensoryLab() {
  const id = useId();
  const prefix = filterPrefix(id);
  const { m, said, change, reset } = useLab<Sensory>(SENSE_START, (n) => senseState(n).said);
  const s = senseState(m);
  const mock = useRef<HTMLDivElement>(null);
  const lines = useAnnouncementLog(mock, m.instruction);
  return (
    <LabShell className="lab vis-lab" verdict={s.verdict} said={said} onReset={reset}>
      <div
        className="lab__mock vis-lab__mock vis-target"
        data-lab-mock
        aria-hidden="true"
        inert
        ref={mock}
        style={visionStyle(m.filter, prefix)}
      >
        <div className="vis-step">
          <p className="vis-step__say">{s.text}</p>
          <div className="vis-step__buttons">
            <button type="button" tabIndex={-1} className="vis-btn vis-btn--stop">
              {OTHER_NAME}
            </button>
            <button type="button" tabIndex={-1} className="vis-btn vis-btn--go">
              {BUTTON_NAME}
            </button>
          </div>
        </div>
      </div>
      <VisionDefs prefix={prefix} />

      <div className="lab-controls">
        <LabChoice
          name={`${id}-say`}
          legend="The instruction"
          options={INSTRUCTIONS}
          value={m.instruction}
          onChange={(instruction) => change({ instruction })}
        />
        <FilterChoice id={id} value={m.filter} onChange={(filter) => change({ filter })} />
      </div>

      <ul className="lab-res">
        <li className={s.names ? 'ok' : 'bad'}>
          <strong>
            {s.names ? <PassIcon /> : <FailIcon />}
            {s.names ? 'Names it' : 'No name'}
          </strong>
          <span>
            {s.names ? `Says “${BUTTON_NAME}”` : 'Never says which button by its name'}
            {s.pointsBy ? `. Points by ${s.pointsBy}` : ''}
          </span>
        </li>
      </ul>
      <CueList cues={[s.cue]} />
      <AnnouncementLog id={id} lines={lines} title="Read aloud" />
    </LabShell>
  );
}
