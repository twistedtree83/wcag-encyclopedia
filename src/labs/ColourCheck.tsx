import { useCallback, useEffect, useId, useState } from 'react';
import {
  AA_BODY,
  AA_LARGE,
  AA_UI,
  AAA_BODY,
  contrastRatio,
  formatScore,
  nearestPass,
  normaliseHex,
  passesThreshold,
} from '../color/contrast';
import { FailIcon, PassIcon } from '../components/Icons';
import { useRoute } from '../site/RouteContext';
import { PATHS } from '../site/routes';
import { DEFAULT_PAIR, type ColourPair } from './pairs';

/**
 * The colour check, the site's signature lab (design guide §8.4). Built once, mounted on the
 * Colour check page (wide), in the "Try it yourself" section of 1.4.1, 1.4.3 and 1.4.11, and
 * in the Home hero. Every ratio it shows is measured from the two colours it is drawing with.
 *
 * State lives in `useColourPair`, owned by whoever mounts the check, so a page can load a
 * pair into it (quick-start chips, "Try it in the checker", `?fg=`/`?bg=`).
 */

export type ColourPairState = ColourPair & {
  /** Counts the reader's changes; the verdict is announced after each one. */
  readonly changes: number;
  /** Load a pair. `announce: false` for loads the reader did not make (URL preload). */
  readonly set: (fg: string, bg: string, options?: { announce?: boolean }) => void;
};

export function useColourPair(initial: ColourPair = DEFAULT_PAIR): ColourPairState {
  const [pair, setPair] = useState<ColourPair>(initial);
  const [changes, setChanges] = useState(0);
  const set = useCallback<ColourPairState['set']>((fg, bg, { announce = true } = {}) => {
    setPair({ fg, bg });
    if (announce) setChanges((c) => c + 1);
  }, []);
  return { ...pair, changes, set };
}

/** The four results, in the design's order. */
const CHECKS = [
  { threshold: AA_BODY, rule: 'Body text', level: 'AA · 1.4.3' },
  { threshold: AA_LARGE, rule: 'Large text', level: 'AA · 1.4.3' },
  { threshold: AAA_BODY, rule: 'Body text', level: 'AAA · 1.4.6' },
  { threshold: AA_UI, rule: 'Borders and icons', level: 'AA · 1.4.11' },
] as const;

/** How long the verdict waits after the last change before it is announced. Deliberate. */
export const ANNOUNCE_DELAY_MS = 500;

/** The sentence the live region reads, e.g. "2.84 to 1. Fails for text and for controls." */
export function verdict(ratio: number): string {
  const said = `${formatScore(ratio)} to 1.`;
  if (passesThreshold(ratio, AAA_BODY)) return `${said} Passes for all text, even AAA.`;
  if (passesThreshold(ratio, AA_BODY)) return `${said} Passes for all text at AA.`;
  if (passesThreshold(ratio, AA_LARGE)) {
    return `${said} Passes only for large text, borders and icons.`;
  }
  return `${said} Fails for text and for controls.`;
}

type Props = {
  readonly state: ColourPairState;
  /** Prefix for every id inside. Defaults to a generated one, so two checks never collide. */
  readonly id?: string;
  /** The wide layout of the Colour check page: preview on the right. */
  readonly wide?: boolean;
  /** An h2 heading for the check. Without one the form is named "Colour check". */
  readonly title?: string;
};

export function ColourCheck({ state, id: given, wide = false, title }: Props) {
  const generated = useId();
  const id = given ?? `cc${generated.replace(/[^a-zA-Z0-9]/g, '')}`;
  const { fg, bg, changes, set } = state;
  const [grey, setGrey] = useState(false);
  const [live, setLive] = useState('');

  const ratio = contrastRatio(fg, bg);
  const bodyFails = !passesThreshold(ratio, AA_BODY);
  const fix = bodyFails ? nearestPass(fg, bg) : null;

  useEffect(() => {
    if (changes === 0) return;
    const timer = setTimeout(() => setLive(verdict(contrastRatio(fg, bg))), ANNOUNCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [changes, fg, bg]);

  return (
    <form
      className={wide ? 'chk wide' : 'chk'}
      id={id}
      onSubmit={(e) => e.preventDefault()}
      {...(title ? { 'aria-labelledby': `${id}-h` } : { 'aria-label': 'Colour check' })}
    >
      {title ? (
        <h2 className="t" id={`${id}-h`}>
          {title}
        </h2>
      ) : null}
      <p className="s">
        Pick a text colour and a background. Everything below is drawn in those two colours and
        measured live.
      </p>
      <div className="chk-in">
        <ColourField
          id={`${id}-fg`}
          legend="Text colour"
          name="Text colour"
          value={fg}
          onColour={(c) => set(c, bg)}
        />
        <button
          type="button"
          className="swap"
          aria-label="Swap text and background colours"
          onClick={() => set(bg, fg)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path
              d="M4 7h12m0 0-3-3m3 3-3 3M16 13H4m0 0 3-3m-3 3 3 3"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <ColourField
          id={`${id}-bg`}
          legend="Background"
          name="Background"
          value={bg}
          onColour={(c) => set(fg, c)}
        />
      </div>

      <div
        className={grey ? 'prev grey' : 'prev'}
        role="group"
        aria-label="Preview in the chosen colours"
        style={{ color: fg, background: bg }}
      >
        <p className="pvh">Opening hours</p>
        <p>
          Monday to Friday, nine until five. <span className="lnk">See holiday hours</span>
        </p>
        <div className="row">
          <span className="fbtn">Book a visit</span>
          <span className="finp">Email address</span>
        </div>
        <small>Small print: closed on public holidays.</small>
      </div>

      <div className="score">
        <span>Contrast ratio</span>
        <output htmlFor={`${id}-fg ${id}-bg`}>{`${formatScore(ratio)} : 1`}</output>
      </div>

      <ul className="res">
        {CHECKS.map(({ threshold, rule, level }) => {
          const ok = passesThreshold(ratio, threshold);
          return (
            <li className={ok ? 'ok' : 'bad'} key={`${rule} ${level}`}>
              <strong>
                {ok ? <PassIcon /> : <FailIcon />}
                {ok ? 'Passes' : 'Fails'}
              </strong>
              <span>{`${rule}, ${level}`}</span>
              <span>{`Threshold ${threshold} : 1`}</span>
            </li>
          );
        })}
      </ul>

      {fix ? (
        <div className="fix">
          <span>
            Closest passing text colour: <b>{fix}</b>
            {`, ${formatScore(contrastRatio(fix, bg))} : 1`}
          </span>
          <button type="button" className="btn o sm" onClick={() => set(fix, bg)}>
            {`Use ${fix}`}
          </button>
        </div>
      ) : null}

      <label className="chk-x">
        <input type="checkbox" checked={grey} onChange={(e) => setGrey(e.target.checked)} />
        Preview in greyscale
      </label>

      <p className="sr" aria-live="polite">
        {live}
      </p>
    </form>
  );
}

/**
 * One colour: a native picker and a hex field. The hex field ignores a partly typed code
 * until it is a whole one, and shows the current colour again when it loses focus.
 */
function ColourField({
  id,
  legend,
  name,
  value,
  onColour,
}: {
  id: string;
  legend: string;
  name: string;
  value: string;
  onColour: (colour: string) => void;
}) {
  // What the reader is typing, and the colour it was typed against. A draft typed against
  // another colour (a swap, a preset) is stale and the field shows the colour instead.
  const [draft, setDraft] = useState<{ text: string; over: string } | null>(null);
  const shown = draft && draft.over === value ? draft.text : value;

  return (
    <fieldset>
      <legend>{legend}</legend>
      <div className="cf">
        <input
          type="color"
          id={`${id}c`}
          aria-label={`${name} picker`}
          value={value.toLowerCase()}
          onChange={(e) => {
            const c = normaliseHex(e.target.value);
            if (c) {
              setDraft(null);
              onColour(c);
            }
          }}
        />
        <input
          type="text"
          id={id}
          aria-label={`${name} hex code`}
          spellCheck={false}
          autoComplete="off"
          maxLength={7}
          value={shown}
          onChange={(e) => {
            const text = e.target.value;
            const c = normaliseHex(text);
            setDraft({ text, over: c ?? value });
            if (c && c !== value) onColour(c);
          }}
          onBlur={() => setDraft(null)}
        />
      </div>
    </fieldset>
  );
}

/** The colour check as a lab on a criterion page, with a way into the full page. */
export function ColourCheckLab() {
  const state = useColourPair();
  const { href } = useRoute();
  const query = `?fg=${state.fg.slice(1)}&bg=${state.bg.slice(1)}`;
  return (
    <>
      <ColourCheck state={state} />
      <p className="lab-more">
        <a className="btn o" href={href(PATHS.colourCheck + query)}>
          Open the full colour check
        </a>
      </p>
    </>
  );
}
