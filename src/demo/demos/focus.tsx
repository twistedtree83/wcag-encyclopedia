/**
 * Demos — 2.4.7 Focus Visible (×2) and 2.4.11 Focus Not Obscured.
 *
 * Three timelines, no player changes. The two 2.4.7 demos share a layout and a keyframe
 * schedule and differ in exactly one authored value — whether the ring is drawn — so the
 * reader is comparing one variable rather than two scenes.
 */

import type { Frame, Timeline } from '../timeline';

const FIELDS = ['Name on card', 'Card number', 'Expiry', 'Security code', 'Pay £48.00'] as const;

export type FocusState = {
  /** Index into FIELDS, or -1 before the traversal starts. */
  readonly at: number;
  readonly ring: boolean;
};

/** Both 2.4.7 demos walk the same form on the same schedule; only `ring` differs. */
function traversal(ring: boolean): readonly { t: number; state: FocusState; caption: string }[] {
  const arrive = (i: number, caption: string) => ({ t: 2 + i * 2.4, state: { at: i, ring }, caption });
  return [
    {
      t: 0,
      state: { at: -1, ring },
      caption: ring
        ? 'A checkout form, nothing focused yet.'
        : 'The same form, with focus styles removed in CSS.',
    },
    arrive(
      0,
      ring
        ? 'Tab — focus lands on Name on card, ringed.'
        : 'Tab — focus lands somewhere. Nothing on screen says where.',
    ),
    arrive(
      1,
      ring
        ? 'Tab — the ring follows to Card number.'
        : 'Tab again. Typing now would go into a field the reader cannot identify.',
    ),
    arrive(2, ring ? 'Tab — Expiry.' : 'Tab. Still no indication of position.'),
    arrive(
      3,
      ring ? 'Tab — Security code.' : 'Tab. The reader is counting keystrokes to keep track.',
    ),
    arrive(
      4,
      ring
        ? 'Tab — the Pay button, clearly the next thing Enter will press.'
        : 'Tab — this is the Pay button. There is no way to know that before pressing Enter.',
    ),
  ];
}

export const focusVisibleTimeline: Timeline<FocusState> = {
  id: 'focus-visible-2-4-7',
  title: 'Keyboard traversal of a checkout form with a visible focus ring',
  duration: 14,
  keyframes: traversal(true),
};

export const focusLostTimeline: Timeline<FocusState> = {
  id: 'focus-lost-2-4-7',
  title: 'The same traversal with focus styles removed',
  duration: 14,
  keyframes: traversal(false),
};

export function renderFocus(frame: Frame<FocusState>): React.ReactNode {
  const { at, ring } = frame.state;
  return (
    <div className="fdemo">
      <div className="fdemo__form">
        {FIELDS.map((label, i) => {
          const isButton = i === FIELDS.length - 1;
          const focused = i === at;
          return (
            <span
              key={label}
              className={[
                isButton ? 'fdemo__button' : 'fdemo__field',
                focused && ring ? 'fdemo__focused' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {label}
            </span>
          );
        })}
      </div>
      <p className="fdemo__status">
        {at < 0 ? 'Tab order not started' : `Focus is on: ${FIELDS[at]}`}
        {ring ? '' : ' — invisible'}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------- */

export type ObscuredState = { readonly scrolled: number; readonly padded: boolean };

export const obscuredTimeline: Timeline<ObscuredState> = {
  id: 'obscured-2-4-11',
  title: 'A sticky header obscuring the focused element, then scroll-padding fixing it',
  duration: 12,
  keyframes: [
    { t: 0, state: { scrolled: 0, padded: false }, caption: 'A long form under a sticky header.' },
    {
      t: 2.5,
      state: { scrolled: 1, padded: false },
      caption: 'Tabbing down. The browser scrolls the next field into view.',
    },
    {
      t: 5,
      state: { scrolled: 2, padded: false },
      caption: 'Into view — but underneath the header. The focused field is hidden.',
    },
    {
      t: 7.5,
      state: { scrolled: 2, padded: true },
      caption: 'Now with scroll-padding-top set to the header height.',
    },
    {
      t: 10,
      state: { scrolled: 3, padded: true },
      caption: 'The browser stops short of the header, and the focused field stays visible.',
    },
  ],
};

export function renderObscured(frame: Frame<ObscuredState>): React.ReactNode {
  const { scrolled, padded } = frame.state;
  const rows = ['Email', 'Address line 1', 'Address line 2', 'City', 'Postcode'];
  const focusedRow = Math.min(scrolled + 1, rows.length - 1);

  return (
    <div className="odemo">
      <div className="odemo__viewport">
        <span className="odemo__header">Sticky header</span>
        <div
          className="odemo__scroller"
          style={{ transform: `translateY(-${scrolled * 2.25}rem)` }}
        >
          {rows.map((label, i) => (
            <span
              key={label}
              className={`odemo__row${
                i === focusedRow ? ' odemo__row--focused' : ''
              }${i === focusedRow && padded ? ' odemo__row--clear' : ''}`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
      <p className="fdemo__status">
        {padded ? 'scroll-padding-top: 3rem' : 'scroll-padding-top: none'}
      </p>
    </div>
  );
}
