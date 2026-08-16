/**
 * Guideline 1.4 — Distinguishable.
 *
 * T-02 authors 1.4.1 as the exemplar that establishes the record shape. T-07 adds 1.4.11
 * (the markup-diff variant), T-09 adds 1.4.10 (the demo variant), and T-16 completes the
 * remaining six.
 */

import type { CriterionRecord } from './types';
import { MeasuredRatio } from '../components/MeasuredRatio';

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

  {
    num: '1.4.11',
    name: 'Non-text Contrast',
    level: 'AA',
    guideline: '1.4',
    plain:
      'The parts of a control that tell you it is a control — the input’s edge, the checkbox ' +
      'box, the focus ring, the chart key — need 3:1 against whatever sits behind them.',
    fail: {
      caption: 'The field and checkbox edges vanish; only the placeholder hints anything is editable.',
      render: () => (
        <>
          <p className="swatch-label">Email address</p>
          <div aria-hidden="true" className="swatch-field border--weak">
            you@example.com
          </div>
          <div className="swatch-row">
            <span aria-hidden="true" className="swatch-check border--weak" />
            Email me order updates
          </div>
          <MeasuredRatio fg="swatch-border-weak" bg="panel" kind="ui" label="border" />
          <p className="example-note">
            The border is a hair lighter than the surface it sits on. Sighted users with good
            vision fill in the edge from memory; nobody else can.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'One border colour, changed on every control at once.',
      render: () => (
        <>
          <p className="swatch-label">Email address</p>
          <div aria-hidden="true" className="swatch-field border--strong">
            you@example.com
          </div>
          <div className="swatch-row">
            <span aria-hidden="true" className="swatch-check border--strong" />
            Email me order updates
          </div>
          <MeasuredRatio fg="swatch-border-strong" bg="panel" kind="ui" label="border" />
          <p className="example-note">
            The same layout, the same type, the same spacing. The only change is the border —
            and now the control announces itself.
          </p>
        </>
      ),
    },
    diff: {
      title: 'styles.css, one declaration',
      lines: [
        { kind: 'context', text: '.field,' },
        { kind: 'context', text: '.checkbox {' },
        { kind: 'del', text: '  border: 1px solid #EBEBEB;  /* fails 1.4.11 */' },
        { kind: 'add', text: '  border: 1px solid #6A6A6A;  /* passes        */' },
        { kind: 'context', text: '  border-radius: 4px;' },
        { kind: 'context', text: '}' },
      ],
      note:
        'Lines are marked - and + as well as tinted, so the diff reads without colour. One ' +
        'declaration fixes every control that shares the class.',
    },
  },
  {
    num: '1.4.10',
    name: 'Reflow',
    level: 'AA',
    guideline: '1.4',
    demo: 'reflow-1-4-10',
    plain:
      'At 320 CSS pixels wide, content must not require scrolling in two directions. Same ' +
      'content, one column, no horizontal scrollbar.',
    fail: {
      caption: 'Fixed 110px columns force a horizontal scrollbar — two-direction scrolling.',
      render: () => (
        <div className="mini">
          <div className="mini__frame">
            <div className="mini__row mini__row--fixed">
              <span className="mini__tile" />
              <span className="mini__tile" />
              <span className="mini__tile" />
            </div>
            <span className="mini__scrollbar" aria-hidden="true" />
          </div>
          <p className="example-note">
            The grid keeps its three tracks at every width, so the reader has to scroll sideways
            to reach the third — while also scrolling down to read. Two directions at once.
          </p>
        </div>
      ),
    },
    pass: {
      caption: 'minmax(0, 1fr) replaced the fixed track width.',
      render: () => (
        <div className="mini">
          <div className="mini__frame">
            <div className="mini__col">
              <span className="mini__tile" />
              <span className="mini__tile" />
              <span className="mini__tile" />
            </div>
          </div>
          <p className="example-note">
            The same three tiles, stacked. Nothing is hidden and nothing is dropped — the
            layout simply stops insisting on a width the screen does not have.
          </p>
        </div>
      ),
    },
    diff: {
      title: 'catalogue.css, the grid track',
      lines: [
        { kind: 'context', text: '.catalogue {' },
        { kind: 'context', text: '  display: grid;' },
        { kind: 'del', text: '  grid-template-columns: repeat(3, 110px);  /* never narrows */' },
        { kind: 'add', text: '  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));' },
        { kind: 'context', text: '  gap: 6px;' },
        { kind: 'context', text: '}' },
      ],
      note:
        'A fixed track cannot reflow. Letting the track shrink to zero and letting auto-fit ' +
        'decide the count is what turns three columns into one.',
    },
  },
];