import { useId, useState } from 'react';
import { Slider } from '../focus-ring/FocusRingLab';
import { LabShell, type Said } from '../shared/LabShell';
import {
  FIELD,
  MAX_HEIGHT,
  MAX_TOP,
  OBSCURE_START,
  STEP_PX,
  WINDOW_PX,
  hiddenShare,
  obscureSaid,
  obscureVerdict,
  placeText,
  type Banner,
} from './obscured';

/**
 * The 2.4.11 lab (#46): a window with a focused field and a sticky banner. The reader moves the
 * banner and changes its height, and sees how much of the focused field it hides. 2.4.11 fails
 * only when none of the field is left showing.
 *
 * The mock is depicted: inert and hidden from assistive technology, drawn to scale in percent of
 * its 200px model. The readout says the share hidden in text.
 */

type Model = { readonly banner: Banner; readonly said: Said | null };

const START: Model = { banner: OBSCURE_START, said: null };

const pc = (px: number) => `${(px / WINDOW_PX) * 100}%`;

export function ObscuredLab() {
  const id = useId();
  const [{ banner, said }, setModel] = useState<Model>(START);
  const change = (patch: Partial<Banner>) =>
    setModel((m) => {
      const next = { ...m.banner, ...patch };
      return { banner: next, said: { text: obscureSaid(next) } };
    });
  const share = hiddenShare(banner);

  return (
    <LabShell
      className="lab nob-lab"
      verdict={obscureVerdict(banner)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div className="lab__mock nob-mock" data-lab-mock aria-hidden="true" inert>
        <span className="nob-mock__line" style={{ top: pc(20) }} />
        <span
          className="nob-mock__field"
          style={{ top: pc(FIELD.top), height: pc(FIELD.height) }}
        >
          Focused field
        </span>
        <span className="nob-mock__line" style={{ top: pc(140) }} />
        <span
          className="nob-mock__banner"
          style={{ top: pc(banner.top), height: pc(Math.min(banner.height, WINDOW_PX - banner.top)) }}
        >
          Sticky banner
        </span>
      </div>

      <div className="sem-controls">
        <Slider
          id={`${id}-top`}
          label="Banner position"
          value={banner.top}
          text={placeText(banner.top)}
          max={MAX_TOP}
          step={STEP_PX}
          onChange={(top) => change({ top })}
        />
        <Slider
          id={`${id}-h`}
          label="Banner height"
          value={banner.height}
          text={`${banner.height}px`}
          min={STEP_PX}
          max={MAX_HEIGHT}
          step={STEP_PX}
          onChange={(height) => change({ height })}
        />
      </div>

      <div className="lab-code">
        <p className="alog__h">The focused field</p>
        <output className="nob-share" aria-live="off">
          {share >= 1
            ? 'Completely hidden'
            : share > 0
              ? `${Math.round(share * 100)}% hidden, still in view`
              : 'Clear of the banner'}
        </output>
      </div>
    </LabShell>
  );
}
