/**
 * Guideline 2.3 — Seizures and Physical Reactions.
 *
 * The one criterion on this page whose failure must NOT be reproduced. Every other card shows
 * the broken thing; here, showing it could trigger a seizure in the reader the criterion
 * exists to protect. The failing example is therefore a still frame with an annotation — a
 * depiction of the violation, never the violation itself.
 */

import { clockTime, useClockNow } from '../live/clock';
import { FlashMeter, FlashStrip } from '../labs/timing/timingParts';
import type { CriterionRecord, LiveExample } from './types';

/*
 * 2.3.1's live examples (#62). Neither stage flashes, in any state: each banner is still, with
 * one second of it drawn as a film strip, and the flash-rate meter counts its flashes on the
 * stage's mock clock. The broken banner is set to flash 8 times a second; the fixed one draws
 * attention with words and weight and never flashes. The meter's bar moves once, when the clock
 * first moves; after that only its count's text changes.
 */

function Banner({ rate }: { readonly rate: number }) {
  const now = useClockNow();
  const shows =
    now === 0
      ? 'Nothing counted yet'
      : rate > 3
        ? `${rate} flashes a second, over the limit of 3`
        : 'No flashes, within the limit of 3';
  return (
    <div className="tcar" data-timer={shows}>
      <p className="tbanner">Last 2 in stock</p>
      <FlashStrip rate={rate} />
      <a href="#order-now" className="tcar__link" onClick={(e) => e.preventDefault()}>
        Order now
      </a>
      <FlashMeter rate={now === 0 ? null : rate} />
      <p className="tim-note">
        {now === 0 ? 'Counted: nothing yet.' : `Counted: ${rate * now} flashes in ${clockTime(now)}.`}
      </p>
    </div>
  );
}

const FLASH_LIVE: Omit<LiveExample, 'Example'> = {
  keys: ['tab', 'read', 'wait', 'run'],
  instruments: ['clock', 'announcement-log'],
  clock: { end: 60 },
};

export const G2_3: readonly CriterionRecord[] = [
  {
    num: '2.3.1',
    name: 'Three Flashes or Below Threshold',
    level: 'A',
    since: '2.0',
    guideline: '2.3',
    labs: ['flash-rate'],
    gist: 'No large, bright area may flash more than three times in one second.',
    plain:
      'Nothing may flash more than three times per second, unless the flashing area is very ' +
      'small or the flash is low-contrast. Red flashes are held to a stricter limit, because ' +
      'saturated red triggers photosensitive seizures at intensities other colours do not.',
    fail: {
      caption: 'A full-width banner strobing several times a second.',
      live: { Example: () => <Banner rate={8} />, ...FLASH_LIVE },
      render: () => (
        <>
          {/*
            Deliberately still. This is the only criterion on the site whose failure must not be
            reproduced: an actual strobe here could cause a seizure in the reader this criterion
            protects. A depiction is the correct and sufficient way to teach it.
          */}
          <div className="strobe" aria-hidden="true">
            <span className="strobe__frame strobe__frame--a" />
            <span className="strobe__frame strobe__frame--b" />
            <span className="strobe__frame strobe__frame--a" />
            <span className="strobe__frame strobe__frame--b" />
          </div>
          <p className="strobe__label">
            Depicted, not animated — four successive frames of a banner alternating at roughly
            8 Hz.
          </p>
          <p className="example-note">
            Around one in four thousand people has photosensitive epilepsy. For them this is
            not an annoyance; it is a medical event caused by a website.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'The attention is drawn without flashing.',
      live: { Example: () => <Banner rate={0} />, ...FLASH_LIVE },
      render: () => (
        <>
          <div className="notice">
            <span className="notice__title">2 items left in stock</span>
            <span>Order within 3 hours for delivery on Friday.</span>
          </div>
          <p className="example-note">
            Urgency conveyed by contrast, weight, and words. Where motion is genuinely wanted,
            a single slow fade under three flashes per second is safe — and anything animated
            should still respect <span className="alt-code">prefers-reduced-motion</span>.
          </p>
        </>
      ),
    },
    diff: {
      title: 'alert.css',
      lines: [
        { kind: 'del', text: '  animation: strobe 0.12s steps(2) infinite;  /* ~8 flashes/sec */' },
        { kind: 'add', text: '  animation: none;' },
        { kind: 'add', text: '  border-left: 3px solid var(--alert);' },
        { kind: 'add', text: '  font-weight: 600;' },
      ],
      note:
        'If a flash is unavoidable, the safe envelope is under three per second, in a small ' +
        'area, and never saturated red.',
    },
    procedure: [
      'List everything on the page that can flash: videos, animated images, adverts, games, and effects in the interface such as a flashing alert.',
      'Play each one and count the flashes in any one second. Three or fewer in every second passes, whatever their size and colour.',
      'Where anything flashes more than three times in a second, measure the area that flashes at once. On a 1024 by 768 screen, a combined area smaller than 341 by 256 pixels is below the threshold, for red flashes as well as general ones.',
      'Count any flashing to or from a saturated red as red flashes, separately from the rest. A change too faint to count as a general flash can still count as a red one.',
      'Run video and animation that is still in doubt through a flash analyser such as PEAT, the free Photosensitive Epilepsy Analysis Tool from the Trace Center, and fix every segment it fails.',
    ],
    questions: [
      {
        question: 'Does a warning before a flashing video pass 2.3.1?',
        answer:
          'No. A seizure can start before the person has time to read a warning or stop the video. The flashing itself has to stay within the limits.',
      },
      {
        question: 'Can a small area flash faster than three times a second?',
        answer:
          'Yes, when the area is small enough. Flashing that covers less than about a quarter of the central field of vision, roughly 341 by 256 pixels on a 1024 by 768 screen, is below the threshold, and that holds for red flashes too.',
      },
      {
        question: 'Does 2.3.1 apply to video I embed from another site?',
        answer:
          'Yes. Flashing content on your page counts whoever made it. Check an embedded video for flashes before you publish it.',
      },
    ],
  },
];
