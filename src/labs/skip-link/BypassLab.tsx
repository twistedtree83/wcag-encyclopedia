import { useId, useState } from 'react';
import {
  BYPASS_START,
  MAX_LINKS,
  MIN_LINKS,
  bypassSaid,
  bypassVerdict,
  pressesToMain,
  type Bypass,
} from './bypass';
import { Slider } from '../focus-ring/FocusRingLab';
import { LabShell, type Said } from '../shared/LabShell';

/**
 * The 2.4.1 lab (#46): a mock page with a long menu before the article. The reader takes the
 * skip link away or puts it back and lengthens the menu, and the count of Tab presses to reach
 * the article follows. Every stop is numbered in the mock in the order Tab reaches it.
 *
 * The mock is depicted: inert and hidden from assistive technology. The count says it in text.
 */

type Model = { readonly bypass: Bypass; readonly said: Said | null };

const START: Model = { bypass: BYPASS_START, said: null };

export function BypassLab() {
  const id = useId();
  const [{ bypass, said }, setModel] = useState<Model>(START);
  const change = (patch: Partial<Bypass>) =>
    setModel((m) => {
      const next = { ...m.bypass, ...patch };
      return { bypass: next, said: { text: bypassSaid(next) } };
    });

  const first = bypass.skip ? 2 : 1;
  const presses = pressesToMain(bypass);

  return (
    <LabShell
      className="lab bp-lab"
      verdict={bypassVerdict(bypass)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div className="lab__mock bp-mock" data-lab-mock aria-hidden="true" inert>
        <div className="bp-mock__head">
          {bypass.skip ? <span className="bp-chip bp-chip--skip">Skip to content</span> : null}
          <span className="bp-chip">Logo</span>
          {Array.from({ length: bypass.links }, (_, i) => (
            <span key={i} className="bp-chip bp-chip--link">
              {first + 1 + i}
            </span>
          ))}
          <span className="bp-chip">Search</span>
        </div>
        <div className="bp-mock__main">Article</div>
      </div>

      <div className="sem-controls">
        <fieldset className="sem-choice">
          <legend>Bypass</legend>
          <label>
            <input
              type="checkbox"
              checked={bypass.skip}
              onChange={(e) => change({ skip: e.target.checked })}
            />
            Skip link, first on the page
          </label>
        </fieldset>
        <Slider
          id={`${id}-links`}
          label="Links in the menu"
          value={bypass.links}
          text={String(bypass.links)}
          min={MIN_LINKS}
          max={MAX_LINKS}
          onChange={(links) => change({ links })}
        />
      </div>

      <div className="lab-code">
        <p className="alog__h">To reach the article</p>
        <output className="bp-count" aria-live="off">
          {bypass.skip ? '1 Tab, then Enter' : `${presses} Tab presses`}
        </output>
      </div>
    </LabShell>
  );
}
