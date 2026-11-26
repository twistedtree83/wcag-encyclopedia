import { useEffect } from 'react';
import { AA_BODY, AA_LARGE, AA_UI, AAA_BODY } from '../color/contrast';
import { PairCard } from '../components/PairCard';
import { ColourCheck, useColourPair } from '../labs/colour-check/ColourCheck';
import { pairFromSearch } from '../labs/colour-check/pairQuery';
import { PAIRS, PRESETS, type ColourPair } from '../labs/colour-check/pairs';

/** The id of the wide check, and of its text-colour hex field (`cc-fg`). */
const CHECK_ID = 'cc';

/**
 * The Colour check page (design guide §9.2): head with quick-start chips, the wide check,
 * "Done well, done badly", what the numbers mean, and what a ratio can't tell you.
 * `?fg=` and `?bg=` preload a pair once the page is live.
 */
export function ColourCheckPage() {
  const state = useColourPair();
  const { set } = state;

  // The URL is read after hydration, so the static HTML always shows the default pair.
  useEffect(() => {
    const pair = pairFromSearch(window.location.search, state);
    if (pair) set(pair.fg, pair.bg, { announce: false });
    // Once, on load: later changes are the reader's.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tryPair = ({ fg, bg }: ColourPair) => {
    set(fg, bg);
    document.getElementById(CHECK_ID)?.scrollIntoView({ block: 'start' });
    document.getElementById(`${CHECK_ID}-fg`)?.focus({ preventScroll: true });
  };

  return (
    <>
      <section className="ph" aria-labelledby="cc-title">
        <p className="eyebrow">Tool · Success criteria 1.4.3 and 1.4.11, plus the AAA result for 1.4.6</p>
        <h1 id="cc-title">
          Colour check. <em>Will people read it?</em>
        </h1>
        <p className="lede">
          Pick a text colour and a background. You see the pair in a real layout, every
          threshold it passes or fails, and the nearest colour that would pass.
        </p>
        <ul className="presets" aria-label="Start from a common pair">
          {PRESETS.map((p) => (
            <li key={p.name}>
              <button type="button" onClick={() => set(p.fg, p.bg)}>
                <span className="d" aria-hidden="true">
                  <i style={{ background: p.bg }} />
                  <i style={{ background: p.fg }} />
                </span>
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <ColourCheck state={state} id={CHECK_ID} wide title="Your colours" />

      <section className="band" aria-labelledby="pairs-title">
        <div className="bh">
          <div>
            <h2 id="pairs-title">Done well, done badly</h2>
            <p>
              Six mistakes we see most, each next to its fix. Load one into the colour check and
              try your own fix.
            </p>
          </div>
        </div>
        <ul className="pairs">
          {PAIRS.map((p) => (
            <PairCard key={p.title} pair={p} onTry={tryPair} />
          ))}
        </ul>
      </section>

      <section className="band" aria-labelledby="numbers-title">
        <div className="bh">
          <div>
            <h2 id="numbers-title">What the numbers mean</h2>
            <p>
              Contrast is measured from 1 : 1, the same colour twice, to 21 : 1, black on white.
              The threshold you need depends on what the colour is doing.
            </p>
          </div>
        </div>
        <ul className="learn">
          <li className="surf">
            <p className="big">{`${AA_BODY} : 1`}</p>
            <h3>Body text</h3>
            <p>
              Anything people read below large size. Level AA, criterion 1.4.3. At AAA,
              criterion 1.4.6 asks for {`${AAA_BODY} : 1`}.
            </p>
          </li>
          <li className="surf">
            <p className="big">{`${AA_LARGE} : 1`}</p>
            <h3>Large text</h3>
            <p>At least 24px, or 18.66px when bold. Bigger letters stay readable with less contrast.</p>
          </li>
          <li className="surf">
            <p className="big">{`${AA_UI} : 1`}</p>
            <h3>Controls and graphics</h3>
            <p>
              Field borders, focus rings, icons and chart lines, measured against what sits next
              to them. Criterion 1.4.11.
            </p>
          </li>
        </ul>
      </section>

      <section className="band" aria-labelledby="limits-title">
        <div className="limits">
          <div className="bh">
            <div>
              <h2 id="limits-title">What a ratio can’t tell you</h2>
              <p>Passing the threshold is the minimum. These still need a human look.</p>
            </div>
          </div>
          <ul>
            <li>
              <b>Thin and small fonts</b>
              <span>
                A hairline weight at {`${AA_BODY} : 1`} can still be hard to read. The ratio
                assumes ordinary strokes.
              </span>
            </li>
            <li>
              <b>Text over images</b>
              <span>
                A photo has hundreds of background colours. Check the lightest part behind the
                text, or add a solid backing.
              </span>
            </li>
            <li>
              <b>Hover, focus and disabled states</b>
              <span>Each state is a new pair of colours. Check them all, not just the resting one.</span>
            </li>
            <li>
              <b>Colour as the only signal</b>
              <span>
                Two colours can both pass and still be told apart only by hue. Criterion 1.4.1
                asks for a second cue, such as an icon or underline.
              </span>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
