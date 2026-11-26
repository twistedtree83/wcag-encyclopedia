/**
 * Drawn parts shared by the timing labs and live examples (#62): the carousel's slides, the
 * audio level meter (the site is silent, so sound is drawn), and the flash-rate meter with its
 * one-second film strip. None of them animates. The flash parts never change luminance on their
 * own: the strip is still, and the meter's bar moves only when the reader changes the rate or
 * first moves the clock.
 */

import { FLASH_LIMIT, FLASH_SCALE, flashFrames, flashLabel } from './flashRate';
import { SLIDES } from './carousel';

/** The carousel's current slide, and its dots, as text. */
export function Slides({ slide }: { readonly slide: number }) {
  return (
    <div className="tslides">
      <p className="tslides__slide">{SLIDES[slide]}</p>
      <p className="tslides__dots">
        <span aria-hidden="true">{SLIDES.map((_, i) => (i === slide ? '●' : '○')).join(' ')}</span>{' '}
        Slide {slide + 1} of {SLIDES.length}
      </p>
    </div>
  );
}

/** A drawn sound-level meter: five bars, at heights in percent. */
export function LevelMeter({ levels, playing }: { readonly levels: readonly number[]; readonly playing: boolean }) {
  return (
    <div className="tlevel">
      <span className="tlevel__bars" aria-hidden="true">
        {levels.map((h, i) => (
          <span key={i} className="tlevel__bar" style={{ height: `${h}%` }} />
        ))}
      </span>
      <span className="tlevel__text">
        {playing ? 'Sound playing (drawn: this site is silent)' : 'Silent'}
      </span>
    </div>
  );
}

/** One second of a banner as 16 still frames, dark where it flashes. Depicted, never played. */
export function FlashStrip({ rate }: { readonly rate: number }) {
  return (
    <div className="tstrip">
      <span className="tstrip__frames" aria-hidden="true">
        {flashFrames(rate).map((dark, i) => (
          <span key={i} className={dark ? 'tstrip__f tstrip__f--dark' : 'tstrip__f'} />
        ))}
      </span>
      <span className="tstrip__label">One second, as 16 still frames: {rate} dark</span>
    </div>
  );
}

/**
 * The flash-rate meter: the rate as a bar on a 0–8 scale, with the limit marked at 3. `rate`
 * null is nothing counted yet. Over the limit is said in words as well as the error colour.
 */
export function FlashMeter({ rate }: { readonly rate: number | null }) {
  const over = rate !== null && rate > FLASH_LIMIT;
  return (
    <div className="fmeter">
      <span className="fmeter__track" aria-hidden="true">
        <span
          className={over ? 'fmeter__bar fmeter__bar--over' : 'fmeter__bar'}
          style={{ width: `${((rate ?? 0) / FLASH_SCALE) * 100}%` }}
        />
        <span className="fmeter__limit" style={{ left: `${(FLASH_LIMIT / FLASH_SCALE) * 100}%` }} />
      </span>
      <span className={over ? 'fmeter__text bad' : 'fmeter__text'}>
        {rate === null
          ? 'Flash rate: nothing counted yet'
          : `Flash rate: ${rate === 0 ? 'no flashes' : flashLabel(rate)}, ${over ? 'over' : 'within'} the limit of ${FLASH_LIMIT}`}
      </span>
    </div>
  );
}
