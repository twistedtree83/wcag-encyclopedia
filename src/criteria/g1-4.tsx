/**
 * Guideline 1.4 — Distinguishable.
 *
 * T-02 authors 1.4.1 as the exemplar that establishes the record shape. T-07 adds 1.4.11
 * (the markup-diff variant), T-09 adds 1.4.10 (the demo variant), and T-16 completes the
 * remaining six.
 */

import type { CriterionRecord } from './types';

export const G1_4: readonly CriterionRecord[] = [
  {
    num: '1.4.1',
    name: 'Use of Color',
    level: 'A',
    guideline: '1.4',
    plain:
      'Colour can carry meaning, but never on its own. If removing all colour from the screen ' +
      'would lose information, add a shape, a label, an underline, or an icon.',
    fail: {
      caption: 'Hue is the only signal.',
      render: () => (
        <>
          <p className="example-prose">
            Your order ships in two days. See the{' '}
            <span className="swatch-link">delivery schedule</span> for regional cut-off
            times, or read the <span className="swatch-link">returns policy</span>.
          </p>
          <p className="example-note">
            Links are blue text and nothing else. In greyscale, at low vision, or on a
            monochrome display they are indistinguishable from the sentence around them.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'A persistent underline was added.',
      render: () => (
        <>
          <p className="example-prose">
            Your order ships in two days. See the{' '}
            <a className="example-link" href="#1.4.1">
              delivery schedule
            </a>{' '}
            for regional cut-off times, or read the{' '}
            <a className="example-link" href="#1.4.1">
              returns policy
            </a>
            .
          </p>
          <p className="example-note">
            The underline survives greyscale, inverted colour, and a monochrome print-out.
            Colour still helps; it is no longer load-bearing.
          </p>
        </>
      ),
    },
  },
];
