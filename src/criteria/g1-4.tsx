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
  {
    num: '1.4.2',
    name: 'Audio Control',
    level: 'A',
    guideline: '1.4',
    plain:
      'If sound plays automatically for more than three seconds, there has to be a way to stop ' +
      'it — a control on the page, not just the operating system volume. Screen reader users ' +
      'cannot hear their own screen reader over it.',
    fail: {
      caption: 'Autoplaying audio with no control on the page.',
      render: () => (
        <>
          <p className="example-prose">A background video with sound starts as the page loads.</p>
          <p className="example-note">
            A screen reader user now has two voices competing and cannot hear the one that
            would let them find the mute button. Turning down the system volume silences their
            screen reader too, which ends the session.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'It does not autoplay — and if it must, a stop control comes first.',
      render: () => (
        <>
          <p className="example-prose">
            The video loads paused, with a visible play control.
          </p>
          <p className="example-note">
            The simplest way to pass is not to autoplay. Where autoplay is required, put a
            pause or mute control at the very start of the tab order, so it can be reached
            before anything else.
          </p>
        </>
      ),
    },
  },

  {
    num: '1.4.3',
    name: 'Contrast (Minimum)',
    level: 'AA',
    guideline: '1.4',
    plain:
      'Body text needs at least 4.5:1 against its background. Text at 24px, or 18.66px and ' +
      'bold, needs 3:1. Measure it rather than judging by eye — a screen at full brightness in ' +
      'a dim room is the most forgiving possible viewing condition, and it is the one you are ' +
      'designing in.',
    fail: {
      caption: 'Hierarchy built by fading text out.',
      render: () => (
        <>
          <p className="swatch-label">Card number</p>
          <p className="faded mono" data-depicts-failure>4242 4242 4242 4242</p>
          <p className="faded" data-depicts-failure>
            Placeholder grey, helper grey, and disabled grey are three different mistakes with
            the same cause.
          </p>
          <MeasuredRatio fg="swatch-text-weak" bg="panel" kind="body" />
        </>
      ),
    },
    pass: {
      caption: 'Hierarchy moved from lightness to weight and scale.',
      render: () => (
        <>
          <p className="swatch-label">Card number</p>
          <p className="solid mono">4242 4242 4242 4242</p>
          <p className="solid">
            Helper text keeps its quieter voice through size and weight rather than by fading
            towards the background.
          </p>
          <MeasuredRatio fg="swatch-text-strong" bg="panel" kind="body" />
        </>
      ),
    },
  },

  {
    num: '1.4.4',
    name: 'Resize Text',
    level: 'AA',
    guideline: '1.4',
    plain:
      'Text has to survive being enlarged to 200% without losing content or function. That ' +
      'means no fixed pixel heights around text, and no boxes that clip when their contents ' +
      'grow.',
    fail: {
      caption: 'A fixed-height box clips its own text when enlarged.',
      render: () => (
        <>
          <div className="clipbox clipbox--fixed">
            <span>Your subscription renews on 4 March and can be cancelled any time before then.</span>
          </div>
          <p className="example-note">
            <span className="alt-code">height: 48px</span> with{' '}
            <span className="alt-code">overflow: hidden</span>. At 200% the sentence is cut in
            half and the reader never learns there was more.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'The box grows with its contents.',
      render: () => (
        <>
          <div className="clipbox">
            <span>Your subscription renews on 4 March and can be cancelled any time before then.</span>
          </div>
          <p className="example-note">
            <span className="alt-code">min-height</span> instead of{' '}
            <span className="alt-code">height</span>, and no overflow clipping. Sizing in
            <span className="alt-code"> rem</span> rather than <span className="alt-code">px</span>{' '}
            also makes text follow the reader’s own browser setting.
          </p>
        </>
      ),
    },
    diff: {
      title: 'notice.css',
      lines: [
        { kind: 'context', text: '.notice {' },
        { kind: 'del', text: '  height: 48px;' },
        { kind: 'del', text: '  overflow: hidden;' },
        { kind: 'add', text: '  min-height: 3rem;' },
        { kind: 'context', text: '}' },
      ],
      note: 'Two declarations. Almost every resize failure is one of these two.',
    },
  },

  {
    num: '1.4.5',
    name: 'Images of Text',
    level: 'AA',
    guideline: '1.4',
    plain:
      'Use real text, not a picture of text. Pictures of text do not reflow, do not respond to ' +
      'a reader’s font or colour settings, blur when enlarged, and cannot be selected, ' +
      'searched, or translated. Logos are exempt.',
    fail: {
      caption: 'A headline exported as an image.',
      render: () => (
        <>
          <span aria-hidden="true" className="imgtext">
            Spring sale — 30% off
          </span>
          <p className="example-note">
            Baked at one size and one palette. It ignores the reader’s font size, it pixelates
            at 400% zoom, it cannot be translated, and its alt text is one more thing to keep
            in sync.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'The same headline as live text.',
      render: () => (
        <>
          <span className="realtext">Spring sale — 30% off</span>
          <p className="example-note">
            Styled with CSS, so it scales, reflows, inverts with the theme, and can be
            selected and translated. Web fonts made the image version unnecessary years ago.
          </p>
        </>
      ),
    },
  },

  {
    num: '1.4.12',
    name: 'Text Spacing',
    level: 'AA',
    guideline: '1.4',
    plain:
      'A reader must be able to increase line height to 1.5×, paragraph spacing to 2×, letter ' +
      'spacing to 0.12em, and word spacing to 0.16em without losing content. People with ' +
      'dyslexia and low vision use exactly these overrides.',
    fail: {
      caption: 'Loosened spacing pushes text out of a rigid container.',
      render: () => (
        <>
          <div className="spacing spacing--rigid">
            <span>Delivery is free on orders over £40 and takes two to three working days.</span>
          </div>
          <p className="example-note">
            The container was sized to fit the text exactly as designed. Apply a reader
            stylesheet and the last line is clipped.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'The container is sized by its contents.',
      render: () => (
        <>
          <div className="spacing">
            <span>Delivery is free on orders over £40 and takes two to three working days.</span>
          </div>
          <p className="example-note">
            No fixed height, no clipping, and nothing positioned absolutely on the assumption
            that a line is exactly one line tall. This is 1.4.4’s discipline applied to
            spacing rather than size.
          </p>
        </>
      ),
    },
  },

  {
    num: '1.4.13',
    name: 'Content on Hover or Focus',
    level: 'AA',
    guideline: '1.4',
    plain:
      'Anything that appears on hover or focus — a tooltip, a popover, a dropdown — has to be ' +
      'dismissable without moving the pointer, stay visible while the pointer travels into it, ' +
      'and remain until it is dismissed or stops being relevant.',
    fail: {
      caption: 'The tooltip vanishes before it can be read or reached.',
      render: () => (
        <>
          <p className="example-prose">
            Estimated total{' '}
            <span className="tipword">
              incl. duties
              <span aria-hidden="true" className="tip tip--fleeting">
                Duties are estimated at checkout…
              </span>
            </span>
          </p>
          <p className="example-note">
            It disappears the instant the pointer leaves the word, so its own text cannot be
            selected or magnified. Escape does nothing, so a magnifier user has no way to
            clear it off the screen either.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'Hoverable, dismissable, and persistent.',
      render: () => (
        <>
          <p className="example-prose">
            Estimated total{' '}
            <span className="tipword">
              incl. duties
              <span aria-hidden="true" className="tip">
                Duties are estimated at checkout and charged by your carrier on delivery.
              </span>
            </span>
          </p>
          <p className="example-note">
            The pointer can travel into the tooltip without it closing, Escape dismisses it
            without moving the pointer, and nothing times it out. All three conditions, not
            just the popular one.
          </p>
        </>
      ),
    },
  },
];