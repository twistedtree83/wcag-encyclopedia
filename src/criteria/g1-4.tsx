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
import { CataloguePage } from '../labs/reflow/ReflowLab';
import { DESKTOP } from '../labs/shared/zoom';
import { NoticeCard } from '../labs/text-fit/NoticeCard';
import { CARD_WINDOW } from '../labs/shared/textFit';
import { SalePage } from '../labs/images-of-text/ImagesOfTextLab';
import { SALE_WINDOW } from '../labs/images-of-text/imagesOfText';
import { useClockNow } from '../live/clock';
import { levelsAt } from '../labs/timing/autoplay';
import { LevelMeter } from '../labs/timing/timingParts';

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
    procedure: [
      'Find everything on the page that uses colour to say something: links in text, required or invalid form fields, chart lines and segments, status labels, selected tabs, calendar days.',
      'Turn the page grey with the Rendering panel in Chrome or Edge DevTools (Emulate vision deficiencies, then Achromatopsia) and look at each item again.',
      'Check each one still says the same thing without colour, through an icon, a text label, an underline, a pattern or a change of shape.',
      'For links inside a paragraph with no underline, measure the link colour against the text colour around it with the DevTools colour picker or the free Colour Contrast Analyser. Below 3:1, the link needs another cue.',
      'Read any instruction that names a colour, such as "fields in red are required", and check the same information is given another way.',
    ],
    questions: [
      {
        question: 'Do links in body text have to be underlined to pass 1.4.1?',
        answer:
          'No. An underline is the simplest other cue, but W3C also accepts links marked by colour alone when the link colour has a contrast ratio of at least 3:1 with the text around it.',
      },
      {
        question: 'Can I use red to show an error?',
        answer:
          'Yes, as long as red is not the only sign. Add an icon or a message in text, so a person who cannot tell red from other colours still finds the error.',
      },
      {
        question: 'Does a chart pass 1.4.1 if each line has its own colour?',
        answer:
          'Only when something else tells the lines apart as well, such as a label at the end of each line, a different marker shape or a dashed pattern.',
      },
    ],
  },

  {
    num: '1.4.11',
    name: 'Non-text Contrast',
    level: 'AA',
    since: '2.1',
    guideline: '1.4',
    labs: ['colour-check', 'non-text-contrast'],
    gist: 'Field edges, checkboxes and focus rings need 3:1 contrast.',
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
    procedure: [
      'List each control whose edge people need to see to find it: text inputs, checkboxes, radio buttons, switches, and buttons with only an icon.',
      'Measure each edge against the background next to it with the DevTools colour picker or the free Colour Contrast Analyser. It needs at least 3:1.',
      'Check each state that shows by appearance alone: the tick in a checked box, the knob of a switch, the marker under the selected tab. Each needs 3:1 against what is next to it.',
      'Tab through the page and measure the focus indicator of each control against the background around it. It needs 3:1 too.',
      'Find the graphics people need to understand the content, such as icons with no text, chart lines and pie segments, and measure each against its background. Leave out parts whose information is also given in text, such as a pie segment with its value printed on it.',
      'Leave out disabled controls, and controls left in the browser’s default style.',
    ],
    questions: [
      {
        question: 'Does a button with text need a visible border to pass 1.4.11?',
        answer:
          'No. When the text shows that it is a button, no edge is needed. A border helps some people, but 1.4.11 does not ask for one.',
      },
      {
        question: 'Does the focus indicator need 3:1 contrast?',
        answer:
          'Yes. A focus indicator is a visual state of the control, and W3C says it needs 3:1 against the background next to it.',
      },
      {
        question: 'Do disabled controls need 3:1 contrast?',
        answer:
          'No. Controls people cannot use are exempt, and so are controls whose look the browser sets and the author has not changed.',
      },
    ],
  },
  {
    num: '1.4.10',
    name: 'Reflow',
    level: 'AA',
    since: '2.1',
    guideline: '1.4',
    demos: ['reflow-1-4-10'],
    labs: ['reflow'],
    gist: 'At 320 CSS pixels wide, a page scrolls one way only.',
    plain:
      'At 320 CSS pixels wide, content must not require scrolling in two directions. Same ' +
      'content, one column, no horizontal scrollbar.',
    fail: {
      caption: 'Fixed-width columns make the page scroll sideways as well as down at 320px wide.',
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
    procedure: [
      'Set the browser window to 1280px wide and zoom to 400%, or set the device toolbar in DevTools to 320px wide. Both give a viewport 320 CSS pixels wide.',
      'Scroll through the page. Check you only need to scroll up and down, never sideways, to read the text.',
      'Check nothing has been lost. Navigation can move into a menu button, but every link, control and piece of content must still be there and work.',
      'Note anything that still scrolls sideways and check it needs two dimensions to make sense, such as a data table, a map, a diagram or a video. The text around it must still reflow.',
      'For content that scrolls sideways by design, such as text set in vertical lines, set the viewport to 256 CSS pixels tall and check you only need to scroll in one direction.',
    ],
    questions: [
      {
        question: 'Can a data table scroll sideways and still pass 1.4.10?',
        answer:
          'Yes. A data table needs two dimensions to make sense, so it is exempt, ideally inside its own scrolling container. The headings and text around the table still have to reflow.',
      },
      {
        question: 'Can I hide content behind a menu at 320px?',
        answer:
          'Yes, as long as people can still reach it. Moving the navigation into a menu button is not a loss of content.',
      },
      {
        question: 'Is 1.4.10 the same as 1.4.4 Resize Text?',
        answer:
          'No. 1.4.4 asks that text can grow to 200% without loss. 1.4.10 asks that, at 400% zoom on a 1280px window, people can read the page by scrolling in one direction only.',
      },
    ],
  },
  {
    num: '1.4.2',
    name: 'Audio Control',
    level: 'A',
    since: '2.0',
    guideline: '1.4',
    labs: ['audio-control'],
    gist:
      'Sound that plays on its own for more than three seconds needs a control on the page to stop it.',
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
    procedure: [
      'Load each page with the sound on and wait. Note any audio that starts without you pressing anything, including background music and videos that play by themselves.',
      'Time each one. Audio that stops by itself within 3 seconds passes.',
      'For audio that runs longer, look for a control that pauses or stops it, or one that turns its volume down separately from your computer’s volume.',
      'Check the control is near the top of the page and you reach it early with the Tab key, so a screen reader user can find it while the audio plays over their screen reader.',
      'Use the control and check the audio stops or goes quiet.',
    ],
    questions: [
      {
        question: 'Is the computer’s own volume control enough for 1.4.2?',
        answer:
          'No. Turning the system volume down silences the screen reader too. The page needs its own way to pause, stop or quieten the audio.',
      },
      {
        question: 'Does 1.4.2 apply to a video the user starts?',
        answer:
          'No. It covers audio that plays by itself. Audio started by pressing a clearly labelled play button is the user’s choice.',
      },
      {
        question: 'Does a short notification sound fail 1.4.2?',
        answer:
          'No, when it lasts 3 seconds or less. Only audio that plays by itself for longer needs a control.',
      },
    ],
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
    procedure: [
      'List every text colour on the page against the background behind it, including links, buttons, placeholder text, error messages and text on images.',
      'Measure each pair with the colour picker in Chrome or Edge DevTools, which shows the contrast ratio, or with the free Colour Contrast Analyser.',
      'Check body text reaches at least 4.5:1. Large text, at least 24px, or about 18.5px when bold, needs at least 3:1.',
      'Check the states too: hover, focus, visited and selected. A link that turns paler on hover has to meet the ratio in that state as well.',
      'For text over a photo or a gradient, measure against the part of the background closest in colour to the text.',
    ],
    questions: [
      {
        question: 'Does disabled text need to meet 1.4.3?',
        answer:
          'No. Text in a control people cannot use, such as a disabled button, is exempt.',
      },
      {
        question: 'Does placeholder text need to meet 1.4.3?',
        answer:
          'Yes. Placeholder text is text, so it needs 4.5:1 against the field background, like any other text of its size.',
      },
      {
        question: 'Does a ratio of 4.49:1 round up to pass?',
        answer:
          'No. W3C says the ratio is not rounded, so anything below 4.5:1 fails for normal text, however close.',
      },
      {
        question: 'Does the text in a logo need to meet 1.4.3?',
        answer:
          'No. Text that is part of a logo or brand name is exempt. Text you made pale by choice, and not because the brand requires it, is not.',
      },
    ],
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
            Each box is held at the <span className="alt-code">width</span> and{' '}
            <span className="alt-code">height</span> its text had as designed, in px, with{' '}
            <span className="alt-code">overflow: hidden</span>. At 200% the sentence is cut off
            and the reader never learns there was more.
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
            No <span className="alt-code">width</span> or{' '}
            <span className="alt-code">height</span> of its own and no overflow clipping, so each
            box grows with its text. Sizing in
            <span className="alt-code"> rem</span> rather than <span className="alt-code">px</span>{' '}
            also makes text follow the reader’s own browser setting.
          </p>
        </>
      ),
    },
    diff: {
      title: 'notice.css',
      lines: [
        { kind: 'context', text: '.notice__body,' },
        { kind: 'context', text: '.notice__tag {' },
        { kind: 'del', text: '  width: var(--designed-width); /* px, as laid out at 100% */' },
        { kind: 'del', text: '  height: var(--designed-height);' },
        { kind: 'del', text: '  overflow: hidden;' },
        { kind: 'context', text: '}' },
      ],
      note: 'Each box was locked at the size its text had as designed. Take the lock off and the box grows with its text: almost every resize failure is a fixed size or clipped overflow.',
    },
    procedure: [
      'Set the browser window to about 1280px wide and zoom in (Ctrl and + on Windows, Cmd and + on a Mac) until the zoom level shows 200%.',
      'Read the whole page at 200%. Check no text is cut off, hidden behind other content or overlapping it.',
      'Use each control at 200%: open the menus, fill in the form fields, open any dialog. Check you can still reach and use everything, and that the text in form fields grew too.',
      'Check the steps on the way, such as 150%, for anything that breaks only at that size.',
      'In Firefox, try View > Zoom > Zoom Text Only at 200%. Text-only zoom is not required, but it shows up boxes with a fixed height that clip their text.',
    ],
    questions: [
      {
        question: 'Is browser zoom enough to pass 1.4.4?',
        answer:
          'Yes, when the page works at 200% with it. Text has to resize to 200% by one way browsers support, and full-page zoom is one. You do not need a text size control of your own.',
      },
      {
        question: 'Does horizontal scrolling at 200% fail 1.4.4?',
        answer:
          'No, not by itself. 1.4.4 fails when text or controls are lost. 1.4.10 Reflow is the criterion that limits scrolling in two directions, at 320 CSS pixels wide.',
      },
      {
        question: 'Do captions and images of text have to resize?',
        answer:
          'No. Both are exempt from 1.4.4, though real text is still the better choice, because images of text blur when they are enlarged.',
      },
    ],
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
    procedure: [
      'Find every image on the page that shows text: banners, buttons drawn as images, headings set in a special font, quotes, screenshots.',
      'Try to select the text with the mouse, or find it with the browser’s find in page (Ctrl+F or Cmd+F). Text you cannot select or find is probably an image.',
      'Zoom to 400% and look at the edges of the letters. Text in a bitmap image blurs or shows pixels; real text stays sharp.',
      'For each image of text, ask whether HTML and CSS could show the same thing. Most could, with a web font and styling.',
      'Treat as exempt only logos, text whose exact look is the point (such as a font sample or a scanned letter), and images people can restyle themselves, choosing the font, size and colours.',
    ],
    questions: [
      {
        question: 'Does alt text make an image of text pass 1.4.5?',
        answer:
          'No. Alt text meets 1.1.1 Non-text Content, but 1.4.5 asks for real text wherever real text can give the same look.',
      },
      {
        question: 'Is a logo an image of text?',
        answer:
          'Yes, but it is exempt. Text that is part of a logo or brand name counts as essential, so it can stay an image.',
      },
      {
        question: 'Is a screenshot of code an image of text?',
        answer:
          'Yes. If the point is the code, show it as text in a pre element, which people can resize, restyle and copy.',
      },
    ],
  },

  {
    num: '1.4.12',
    name: 'Text Spacing',
    level: 'AA',
    since: '2.1',
    guideline: '1.4',
    labs: ['text-spacing'],
    gist: 'Text must survive a reader loosening its line, paragraph, letter and word spacing.',
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
    procedure: [
      'Get a free way to override text spacing, such as a text spacing bookmarklet or a user style in the Stylus extension, set to line height 1.5 times the font size, paragraph spacing 2 times, letter spacing 0.12 times and word spacing 0.16 times.',
      'Apply the spacing to the page and read it through. Check no text is cut off, hidden by other content or overlapping it.',
      'Look closely at boxes with a fixed size: buttons, tabs, cards, badges, navigation bars and form fields. These are where text usually spills out or gets clipped.',
      'Open the menus, tooltips and dialogs with the spacing applied, and check their text too.',
      'Check each control still works and its label can still be read in full.',
    ],
    questions: [
      {
        question: 'Does my site have to use the 1.4.12 spacing values?',
        answer:
          'No. 1.4.12 asks that nothing breaks when a person applies them. Your own design can use any spacing.',
      },
      {
        question: 'Does 1.4.12 apply to captions burned into a video?',
        answer:
          'No. Text drawn into an image or a video frame cannot take new spacing. Captions sent as a separate text track can, so they are a different case.',
      },
      {
        question: 'Does 1.4.12 apply to a script that does not use one of these properties?',
        answer:
          'No, not for that property. A page in Japanese, which does not use paragraph spacing, is tested with the properties it does use.',
      },
    ],
  },

  {
    num: '1.4.13',
    name: 'Content on Hover or Focus',
    level: 'AA',
    since: '2.1',
    guideline: '1.4',
    gist: 'A tooltip shown on hover or focus must stay put until the reader dismisses it.',
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
    procedure: [
      'Find everything that appears when you hover over or focus something: tooltips, preview cards, submenus, hints beside form fields.',
      'Hover over each trigger, then press Escape without moving the mouse. Check the extra content closes. Do the same after moving focus to the trigger with the Tab key.',
      'Hover over each trigger and move the pointer slowly onto the content that appeared. Check it stays open while the pointer is on it.',
      'Show each one and wait without moving. Check it stays until you move the pointer or focus away, close it, or it stops being relevant, and does not vanish on a timer.',
      'Leave out tooltips the browser draws from a title attribute: the browser controls them, so they are exempt.',
    ],
    questions: [
      {
        question: 'Do title attribute tooltips have to meet 1.4.13?',
        answer:
          'No. The browser draws them and the author cannot change how they look, so they are exempt.',
      },
      {
        question: 'Does the extra content have to close with Escape?',
        answer:
          'No, not with that key in particular. People need a way to close it without moving the pointer or focus, and Escape is the usual one.',
      },
      {
        question: 'Does an error message shown on focus have to be dismissible?',
        answer:
          'No. Content that reports an input error, or that covers nothing else, is exempt from the dismissible part. It still has to stay open while the pointer is over it and until focus leaves the trigger.',
      },
    ],
  },
];