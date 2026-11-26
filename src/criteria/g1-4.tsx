/**
 * Guideline 1.4 — Distinguishable.
 *
 * T-02 authors 1.4.1 as the exemplar that establishes the record shape. T-07 adds 1.4.11
 * (the markup-diff variant), T-09 adds 1.4.10 (the demo variant), and T-16 completes the
 * remaining six.
 */

import { useEffect, useId, useRef, useState } from 'react';
import type { CriterionRecord, LiveExample } from './types';
import { MeasuredRatio } from '../components/MeasuredRatio';
import { CataloguePage } from '../labs/ReflowLab';
import { DESKTOP } from '../labs/zoom';
import { NoticeCard } from '../labs/NoticeCard';
import { CARD_WINDOW } from '../labs/textFit';
import { SalePage } from '../labs/ImagesOfTextLab';
import { SALE_WINDOW } from '../labs/imagesOfText';
import { useClockNow } from '../live/clock';
import { levelsAt } from '../labs/autoplay';
import { LevelMeter } from '../labs/timingParts';

/** 1.4.10 live examples (#53): the catalogue in a zoom frame, fixed width or reflowing. */
function FixedCatalogue() {
  return <CataloguePage layout="fixed" />;
}
function ReflowingCatalogue() {
  return <CataloguePage layout="reflow" />;
}
const REFLOW_LIVE = { keys: ['zoom'], instruments: ['zoom-meter'], zoomFrame: DESKTOP } as const;

/** 1.4.4 and 1.4.12 live examples (#54): a notice card in a zoom frame, its boxes locked or flexible. */
function LockedNotice() {
  return <NoticeCard locked />;
}
function FlexibleNotice() {
  return <NoticeCard locked={false} />;
}
const RESIZE_LIVE = { keys: ['text-size'], instruments: ['text-fit'], zoomFrame: CARD_WINDOW } as const;
const SPACING_LIVE = { keys: ['spacing'], instruments: ['text-fit'], zoomFrame: CARD_WINDOW } as const;

/** 1.4.5 live examples (#55): the sale heading in a zoom frame, as a picture or as text. */
function ImageHeadline() {
  return <SalePage heading="image" />;
}
function TextHeadline() {
  return <SalePage heading="text" />;
}
const IMAGES_LIVE = { keys: ['zoom', 'restyle'], instruments: ['text-look'], zoomFrame: SALE_WINDOW } as const;

const DUTIES = 'Duties are estimated at checkout and charged by your carrier on delivery.';
const WORD_HOVER = 'the words “incl. duties”';

/**
 * 1.4.13's broken tooltip, live (#47): it opens while the pointer is on the words or they have
 * focus, and closes the moment either leaves. The tooltip is not part of what is hovered, so the
 * pointer can't reach it, and nothing listens for Escape. `data-hover` marks where the bar's
 * pointer can go.
 */
function FleetingTip() {
  const [open, setOpen] = useState(false);
  return (
    <p className="example-prose live-tip">
      Estimated total{' '}
      <span
        className="tipword live-tip__word"
        tabIndex={0}
        data-hover={WORD_HOVER}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        incl. duties
      </span>
      <span
        role="tooltip"
        className="live-tip__tip live-tip__tip--fleeting"
        data-hover="the tooltip"
        hidden={!open}
      >
        {DUTIES}
      </span>
    </p>
  );
}

/**
 * 1.4.13's fixed tooltip, live (#47): the words and the tooltip are hovered together, so the
 * pointer can move into it; Escape anywhere closes it without moving the pointer; and no timer
 * closes it. A simulated Escape counts only when it is aimed at this example.
 */
function SteadyTip() {
  const tipId = useId();
  const wrap = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const at = e.target as Node;
      const here = wrap.current && (at.contains(wrap.current) || wrap.current.contains(at));
      if (e.key === 'Escape' && (e.isTrusted || here)) setDismissed(true);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  const open = (hovered || focused) && !dismissed;
  return (
    <p className="example-prose live-tip">
      Estimated total{' '}
      <span
        className="live-tip__wrap"
        ref={wrap}
        onMouseEnter={() => {
          setHovered(true);
          setDismissed(false);
        }}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          type="button"
          className="tipword live-tip__word"
          aria-describedby={tipId}
          data-hover={WORD_HOVER}
          onFocus={() => {
            setFocused(true);
            setDismissed(false);
          }}
          onBlur={() => setFocused(false)}
        >
          incl. duties
        </button>
        <span role="tooltip" id={tipId} className="live-tip__tip" data-hover="the tooltip" hidden={!open}>
          {DUTIES}
        </span>
      </span>
    </p>
  );
}

const TIP_KEYS: LiveExample['keys'] = ['hover', 'tab', 'escape'];

/*
 * The colour criteria's live examples (#56). Each marks the parts whose colour carries meaning
 * with `data-cue` (src/live/cues.ts), and "Vision filter" measures them through greyscale and the
 * colour-vision views. The text around them is --ink-2 (`.vis-prose`), so the depicted link is
 * under 3:1 from it in both themes and only its hue sets it apart.
 */

/*
 * The broken links are drawn as the static example draws them, as coloured spans: as real links
 * inside the inert stage, axe's link-in-text-block would still flag them (ADR 0002).
 */
function HueLink({ underlined, children }: { underlined: boolean; children: string }) {
  return underlined ? (
    <a className="example-link vis-link" href="#1.4.1" data-cue={`the link “${children}”`}>
      {children}
    </a>
  ) : (
    <span className="swatch-link vis-link" data-cue={`the link “${children}”`}>
      {children}
    </span>
  );
}

function HueLinks({ underlined }: { underlined: boolean }) {
  return (
    <p className="vis-prose">
      Your order ships in two days. See the{' '}
      <HueLink underlined={underlined}>delivery schedule</HueLink> for regional cut-off times, or
      read the <HueLink underlined={underlined}>returns policy</HueLink>.
    </p>
  );
}

const COLOUR_LINKS: LiveExample['keys'] = ['vision'];

function EdgedFields({ strong }: { strong: boolean }) {
  const id = useId();
  const edge = strong ? 'border--strong' : 'border--weak';
  return (
    <div className="vis-fields">
      <label htmlFor={`${id}-email`}>Email address</label>
      <input
        id={`${id}-email`}
        type="email"
        className={`swatch-field ${edge}`}
        placeholder="you@example.com"
        data-cue="the field’s edge"
        data-cue-part="border"
        data-cue-vs="surface"
      />
      <label className="vis-fields__check">
        <input
          type="checkbox"
          className={`vis-check ${edge}`}
          data-cue="the checkbox’s edge"
          data-cue-part="border"
          data-cue-vs="surface"
        />
        Email me order updates
      </label>
      <MeasuredRatio
        fg={strong ? 'ex-border-strong' : 'ex-border-weak'}
        bg="card-bg"
        kind="ui"
        label="border"
      />
    </div>
  );
}

const EDGE_KEYS: LiveExample['keys'] = ['vision', 'tab', 'shift-tab', 'space'];

/*
 * The faint text keeps the static example's `data-depicts-failure`: the same text, so nothing new
 * is excluded from axe. The badges measure against --card-bg, the surface live examples sit on.
 */
function CardText({ faint }: { faint: boolean }) {
  const cls = faint ? 'faded' : 'solid';
  const depicts = faint ? { 'data-depicts-failure': true } : {};
  return (
    <>
      <p className="swatch-label">Card number</p>
      <p
        className={`${cls} mono`}
        data-cue="the card number"
        data-cue-vs="surface"
        data-cue-need="4.5"
        {...depicts}
      >
        4242 4242 4242 4242
      </p>
      <p className={cls} data-cue="the helper text" data-cue-vs="surface" data-cue-need="4.5" {...depicts}>
        {faint
          ? 'Placeholder grey, helper grey, and disabled grey are three different mistakes with the same cause.'
          : 'Helper text keeps its quieter voice through size and weight rather than by fading towards the background.'}
      </p>
      <MeasuredRatio fg={faint ? 'ex-text-weak' : 'ex-text-strong'} bg="card-bg" kind="body" />
    </>
  );
}

const TEXT_KEYS: LiveExample['keys'] = ['vision', 'read'];

/*
 * 1.4.2's live examples (#62): a track that plays as the page loads, drawn as a level meter
 * because the site is silent; it moves only on the stage's mock clock. The broken one has no
 * control; the fixed one has a real "Pause audio" button first, before anything else.
 * `data-timer` names the phase, never the level, so a running clock is quiet.
 */

const AUDIBLE = 3;

function TrackPanel({ playing, now }: { readonly playing: boolean; readonly now: number }) {
  return (
    <>
      <p className="tim-track">Now playing: Summer sale jingle</p>
      <LevelMeter levels={levelsAt(playing, now)} playing={playing} />
      <a href="#sale-details" className="tcar__link" onClick={(e) => e.preventDefault()}>
        See the sale
      </a>
    </>
  );
}

function AutoplayTrack() {
  const now = useClockNow();
  const shows = now < AUDIBLE ? 'Playing' : 'Still playing after 3 seconds, no control';
  return (
    <div className="tcar" data-timer={shows}>
      <TrackPanel playing now={now} />
    </div>
  );
}

function PausableTrack() {
  const now = useClockNow();
  const [paused, setPaused] = useState(false);
  const shows = paused
    ? 'Paused by the reader'
    : now < AUDIBLE
      ? 'Playing, with Pause audio'
      : 'Playing after 3 seconds, with Pause audio';
  return (
    <div className="tcar" data-timer={shows}>
      <button type="button" className="btn o sm" onClick={() => setPaused(!paused)}>
        {paused ? 'Play audio' : 'Pause audio'}
      </button>
      <TrackPanel playing={!paused} now={now} />
    </div>
  );
}

const AUDIO_LIVE: Omit<LiveExample, 'Example'> = {
  keys: ['tab', 'shift-tab', 'enter', 'read', 'wait', 'run'],
  instruments: ['clock', 'announcement-log'],
  clock: { end: 60 },
};

export const G1_4: readonly CriterionRecord[] = [
  {
    num: '1.4.1',
    name: 'Use of Color',
    level: 'A',
    since: '2.0',
    guideline: '1.4',
    labs: ['colour-check', 'use-of-colour'],
    plain:
      'Colour can carry meaning, but never on its own. If removing all colour from the screen ' +
      'would lose information, add a shape, a label, an underline, or an icon.',
    fail: {
      caption: 'Hue is the only signal.',
      live: {
        Example: () => <HueLinks underlined={false} />,
        keys: COLOUR_LINKS,
        instruments: ['vision-filter'],
      },
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
      live: {
        Example: () => <HueLinks underlined />,
        keys: COLOUR_LINKS,
        instruments: ['vision-filter'],
      },
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
    since: '2.1',
    guideline: '1.4',
    labs: ['colour-check', 'non-text-contrast'],
    plain:
      'The parts of a control that tell you it is a control — the input’s edge, the checkbox ' +
      'box, the focus ring, the chart key — need 3:1 against whatever sits behind them.',
    fail: {
      caption: 'The field and checkbox edges vanish; only the placeholder hints anything is editable.',
      live: {
        Example: () => <EdgedFields strong={false} />,
        keys: EDGE_KEYS,
        instruments: ['vision-filter', 'announcement-log'],
      },
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
          <MeasuredRatio fg="ex-border-weak" bg="deep" kind="ui" label="border" />
          <p className="example-note">
            The border is a hair lighter than the surface it sits on. Sighted users with good
            vision fill in the edge from memory; nobody else can.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'One border colour, changed on every control at once.',
      live: {
        Example: () => <EdgedFields strong />,
        keys: EDGE_KEYS,
        instruments: ['vision-filter', 'announcement-log'],
      },
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
          <MeasuredRatio fg="ex-border-strong" bg="deep" kind="ui" label="border" />
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
    since: '2.1',
    guideline: '1.4',
    demos: ['reflow-1-4-10'],
    labs: ['reflow'],
    plain:
      'At 320 CSS pixels wide, content must not require scrolling in two directions. Same ' +
      'content, one column, no horizontal scrollbar.',
    fail: {
      caption: 'Fixed-width columns: zoomed to 320px wide, the page scrolls sideways as well as down.',
      live: { Example: FixedCatalogue, ...REFLOW_LIVE },
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
      caption: 'A track that can shrink replaced the fixed track width, so the columns reflow.',
      live: { Example: ReflowingCatalogue, ...REFLOW_LIVE },
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
        { kind: 'del', text: '  grid-template-columns: repeat(3, 18em);  /* never narrows */' },
        { kind: 'add', text: '  grid-template-columns: repeat(auto-fit, minmax(min(100%, 12em), 1fr));' },
        { kind: 'context', text: '  gap: 1em;' },
        { kind: 'context', text: '}' },
      ],
      note:
        'A fixed track cannot reflow. Letting each track shrink to the width available, and ' +
        'letting auto-fit decide the count, is what turns three columns into one.',
    },
  },
  {
    num: '1.4.2',
    name: 'Audio Control',
    level: 'A',
    since: '2.0',
    guideline: '1.4',
    labs: ['audio-control'],
    plain:
      'If sound plays automatically for more than three seconds, there has to be a way to stop ' +
      'it — a control on the page, not just the operating system volume. Screen reader users ' +
      'cannot hear their own screen reader over it.',
    fail: {
      caption: 'Autoplaying audio with no control on the page.',
      live: { Example: AutoplayTrack, ...AUDIO_LIVE },
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
      live: { Example: PausableTrack, ...AUDIO_LIVE },
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
    since: '2.0',
    guideline: '1.4',
    labs: ['colour-check', 'fade-text'],
    plain:
      'Body text needs at least 4.5:1 against its background. Text at 24px, or 18.66px and ' +
      'bold, needs 3:1. Measure it rather than judging by eye — a screen at full brightness in ' +
      'a dim room is the most forgiving possible viewing condition, and it is the one you are ' +
      'designing in.',
    fail: {
      caption: 'Hierarchy built by fading text out.',
      live: {
        Example: () => <CardText faint />,
        keys: TEXT_KEYS,
        instruments: ['vision-filter', 'announcement-log'],
      },
      render: () => (
        <>
          <p className="swatch-label">Card number</p>
          <p className="faded mono" data-depicts-failure>4242 4242 4242 4242</p>
          <p className="faded" data-depicts-failure>
            Placeholder grey, helper grey, and disabled grey are three different mistakes with
            the same cause.
          </p>
          <MeasuredRatio fg="ex-text-weak" bg="deep" kind="body" />
        </>
      ),
    },
    pass: {
      caption: 'Hierarchy moved from lightness to weight and scale.',
      live: {
        Example: () => <CardText faint={false} />,
        keys: TEXT_KEYS,
        instruments: ['vision-filter', 'announcement-log'],
      },
      render: () => (
        <>
          <p className="swatch-label">Card number</p>
          <p className="solid mono">4242 4242 4242 4242</p>
          <p className="solid">
            Helper text keeps its quieter voice through size and weight rather than by fading
            towards the background.
          </p>
          <MeasuredRatio fg="ex-text-strong" bg="deep" kind="body" />
        </>
      ),
    },
  },

  {
    num: '1.4.4',
    name: 'Resize Text',
    level: 'AA',
    since: '2.0',
    guideline: '1.4',
    labs: ['resize-text'],
    plain:
      'Text has to survive being enlarged to 200% without losing content or function. That ' +
      'means no fixed pixel heights around text, and no boxes that clip when their contents ' +
      'grow.',
    fail: {
      caption: 'A fixed-height box clips its own text when enlarged.',
      live: { Example: LockedNotice, ...RESIZE_LIVE },
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
      live: { Example: FlexibleNotice, ...RESIZE_LIVE },
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
    since: '2.0',
    guideline: '1.4',
    labs: ['images-of-text'],
    plain:
      'Use real text, not a picture of text. Pictures of text do not reflow, do not respond to ' +
      'a reader’s font or colour settings, blur when enlarged, and cannot be selected, ' +
      'searched, or translated. Logos are exempt.',
    fail: {
      caption: 'A headline exported as an image.',
      live: { Example: ImageHeadline, ...IMAGES_LIVE },
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
      live: { Example: TextHeadline, ...IMAGES_LIVE },
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
    since: '2.1',
    guideline: '1.4',
    labs: ['text-spacing'],
    plain:
      'A reader must be able to increase line height to 1.5×, paragraph spacing to 2×, letter ' +
      'spacing to 0.12em, and word spacing to 0.16em without losing content. People with ' +
      'dyslexia and low vision use exactly these overrides.',
    fail: {
      caption: 'Loosened spacing pushes text out of a rigid container.',
      live: { Example: LockedNotice, ...SPACING_LIVE },
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
      live: { Example: FlexibleNotice, ...SPACING_LIVE },
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
    since: '2.1',
    guideline: '1.4',
    plain:
      'Anything that appears on hover or focus — a tooltip, a popover, a dropdown — has to be ' +
      'dismissable without moving the pointer, stay visible while the pointer travels into it, ' +
      'and remain until it is dismissed or stops being relevant.',
    labs: ['tame-tooltip'],
    fail: {
      caption: 'The tooltip vanishes before it can be read or reached.',
      live: { Example: FleetingTip, keys: TIP_KEYS, instruments: ['pointer-log'] },
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
      live: { Example: SteadyTip, keys: TIP_KEYS, instruments: ['pointer-log'] },
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