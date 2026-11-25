/**
 * Guideline 2.1 — Keyboard Accessible.
 *
 * The audience here is wider than it first looks: not only people who cannot use a mouse, but
 * switch users, voice-control users, screen reader users, and anyone whose trackpad has died.
 * Keyboard support is the substrate every other input method is built on.
 */

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { basketText } from '../labs/keyboard';
import { didAction } from '../live/actions';
import type { CriterionRecord, LiveExample } from './types';

/* --- Live examples (#45) --------------------------------------------------------------------- */

/**
 * 2.1.1: a quantity field and "Add to basket". Broken, the control is a div with a click handler
 * and no tabindex, so Tab never reaches it; fixed, it is a button. The basket is a status message.
 */
function Basket({ real }: { real: boolean }) {
  const [n, setN] = useState(0);
  const add = () => setN((x) => x + 1);
  return (
    <div className="kb-basket">
      <label className="kb-field">
        Quantity
        <input type="text" inputMode="numeric" defaultValue="1" autoComplete="off" />
      </label>
      {real ? (
        <button type="button" className="realbtn" onClick={add}>
          Add to basket
        </button>
      ) : (
        <div className="fakebtn" onClick={add}>
          Add to basket
        </div>
      )}
      <p className="kb-count" role="status">
        {basketText(n)}
      </p>
    </div>
  );
}

const BASKET_KEYS: LiveExample['keys'] = ['tab', 'shift-tab', 'enter', 'space'];

/**
 * 2.1.2: a newsletter panel that loops focus between its controls, as a modal does. Broken, it
 * binds no Escape and its Close is a mouse-only span: Tab cycles Email and Subscribe forever.
 * Fixed, Escape and a real Close button shut it and send focus back to the trigger. The fixed
 * loop is real, so its exit is written on the panel.
 */
function Newsletter({ exit }: { exit: boolean }) {
  const [open, setOpen] = useState(true);
  const trigger = useRef<HTMLButtonElement>(null);
  const email = useRef<HTMLInputElement>(null);
  /** Set once the reader opens or closes it, so the first render moves no focus. */
  const moved = useRef(false);
  useEffect(() => {
    if (!moved.current) return;
    (open ? email : trigger).current?.focus();
  }, [open]);
  const show = (next: boolean) => {
    moved.current = true;
    setOpen(next);
  };
  const keys = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && exit) {
      didAction(e.currentTarget, 'Closed the newsletter');
      show(false);
      return;
    }
    if (e.key !== 'Tab') return;
    const stops = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('input, button'));
    const [first, last] = [stops[0], stops[stops.length - 1]];
    const at = document.activeElement;
    if (!e.shiftKey && at === last) {
      e.preventDefault();
      first?.focus();
    } else if (e.shiftKey && at === first) {
      e.preventDefault();
      last?.focus();
    }
  };
  if (!open) {
    return (
      <button type="button" className="realbtn" ref={trigger} onClick={() => show(true)}>
        Sign up for the newsletter
      </button>
    );
  }
  return (
    <div className={exit ? 'trap trap--ok trap--live' : 'trap trap--live'} onKeyDown={keys}>
      <span className="trap__title">Newsletter</span>
      <label className="kb-field">
        Email
        <input type="email" autoComplete="email" ref={email} />
      </label>
      <div className="trap__row">
        <button type="button" className="realbtn">
          Subscribe
        </button>
        {exit ? (
          <button type="button" className="trap__close" onClick={() => show(false)}>
            Close
          </button>
        ) : (
          <span className="trap__close" onClick={() => show(false)}>
            Close
          </span>
        )}
      </div>
      <span className="trap__cycle">
        {exit
          ? 'Escape closes · focus returns to the trigger'
          : 'Tab ⟲ cycles between these two, forever'}
      </span>
    </div>
  );
}

const TRAP_KEYS: LiveExample['keys'] = ['tab', 'shift-tab', 'enter', 'escape'];

/**
 * 2.1.4: a message with a reply box. "s" stars and "e" archives. Broken, the shortcuts listen on
 * the whole mail view, so dictating into the reply box fires them; fixed, they listen only on the
 * focused message, so dictation types into the box.
 */
function Inbox({ scoped }: { scoped: boolean }) {
  const [starred, setStarred] = useState(false);
  const [archived, setArchived] = useState(false);
  /** The star as of the last key, since a dictated phrase arrives faster than a render. */
  const star = useRef(false);
  const shortcut = (e: KeyboardEvent<HTMLElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 's') {
      e.preventDefault();
      star.current = !star.current;
      didAction(e.currentTarget, star.current ? 'Starred the message' : 'Unstarred the message');
      setStarred(star.current);
    } else if (e.key === 'e') {
      e.preventDefault();
      didAction(e.currentTarget, 'Archived the message');
      setArchived(true);
    }
  };
  const where = archived ? 'Archived' : 'In the inbox';
  return (
    <div className="sc-mail" onKeyDown={scoped ? undefined : shortcut}>
      <button type="button" className="sc-msg" onKeyDown={scoped ? shortcut : undefined}>
        Quarterly report
      </button>
      <p className="sc-state" role="status">
        {starred ? `${where} · Starred` : where}
      </p>
      <label className="kb-field">
        Reply
        <input type="text" autoComplete="off" />
      </label>
    </div>
  );
}

const SHORTCUT_KEYS: LiveExample['keys'] = ['tab', 'shift-tab', 'dictate'];

export const G2_1: readonly CriterionRecord[] = [
  {
    num: '2.1.1',
    name: 'Keyboard',
    level: 'A',
    since: '2.0',
    guideline: '2.1',
    labs: ['keyboard-control'],
    plain:
      'Everything the interface can do must be doable from a keyboard. Not "most things", and ' +
      'not "there is an alternative path" — every control, every menu, every drag.',
    fail: {
      caption: 'A div pretending to be a button.',
      live: {
        Example: () => <Basket real={false} />,
        keys: BASKET_KEYS,
        instruments: ['focus-tracker', 'announcement-log'],
      },
      render: () => (
        <>
          <span aria-hidden="true" className="fakebtn">
            Add to basket
          </span>
          <p className="example-note">
            <span className="alt-code">&lt;div class="btn" onclick="…"&gt;</span>. It looks
            right and it works with a mouse. It takes no focus, Enter and Space do nothing, and
            a screen reader announces it as text.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'A real button element.',
      live: {
        Example: () => <Basket real />,
        keys: BASKET_KEYS,
        instruments: ['focus-tracker', 'announcement-log'],
      },
      render: () => (
        <>
          <button type="button" className="realbtn" onClick={(e) => e.preventDefault()}>
            Add to basket
          </button>
          <p className="example-note">
            Focusable, activated by Enter and Space, announced as a button, and it inherits the
            focus ring. Every one of those behaviours would otherwise be hand-written — and
            three of them are usually forgotten.
          </p>
        </>
      ),
    },
    diff: {
      title: 'basket.html',
      lines: [
        { kind: 'del', text: '<div class="btn" onclick="addToBasket()">Add to basket</div>' },
        { kind: 'add', text: '<button type="button" class="btn">Add to basket</button>' },
      ],
      note:
        'If a div genuinely cannot be replaced, it needs role="button", tabindex="0", and key ' +
        'handlers for both Enter and Space. Four things to get right instead of none.',
    },
  },

  {
    num: '2.1.2',
    name: 'No Keyboard Trap',
    level: 'A',
    since: '2.0',
    guideline: '2.1',
    labs: ['keyboard-trap'],
    plain:
      'If focus can get into something, it has to be able to get out using the keyboard alone. ' +
      'A trap does not merely inconvenience a keyboard user — it ends their session, because ' +
      'there is nothing else they can do.',
    fail: {
      caption: 'A hand-rolled focus trap with no way out.',
      live: {
        Example: () => <Newsletter exit={false} />,
        keys: TRAP_KEYS,
        instruments: ['focus-tracker', 'key-log'],
      },
      render: () => (
        <>
          <div className="trap">
            <span className="trap__title">Newsletter</span>
            <span aria-hidden="true" className="swatch-field border--strong">
              you@example.com
            </span>
            <span className="trap__cycle">Tab ⟲ cycles between these two, forever</span>
          </div>
          <p className="example-note">
            The modal loops focus correctly but binds no Escape and its close button is
            mouse-only. A mouse user closes it without noticing; a keyboard user is finished.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'The loop has an exit.',
      live: {
        Example: () => <Newsletter exit />,
        keys: TRAP_KEYS,
        instruments: ['focus-tracker', 'key-log'],
      },
      render: () => (
        <>
          <div className="trap trap--ok">
            <span className="trap__title">Newsletter</span>
            <span aria-hidden="true" className="swatch-field border--strong">
              you@example.com
            </span>
            <span className="trap__cycle">Escape closes · focus returns to the trigger</span>
          </div>
          <p className="example-note">
            Trapping focus inside a modal is correct — the requirement is that the trap has a
            documented exit. Native <span className="alt-code">&lt;dialog&gt;</span> with{' '}
            <span className="alt-code">showModal()</span> provides one for free.
          </p>
        </>
      ),
    },
  },

  {
    num: '2.1.4',
    name: 'Character Key Shortcuts',
    level: 'A',
    since: '2.1',
    guideline: '2.1',
    labs: ['character-shortcuts'],
    plain:
      'A shortcut bound to a single letter, number, or symbol must be switchable off, ' +
      'remappable, or active only while the relevant control has focus. Speech-input users ' +
      'trigger these constantly just by talking.',
    fail: {
      caption: 'Single-key shortcuts, always listening.',
      live: {
        Example: () => <Inbox scoped={false} />,
        keys: SHORTCUT_KEYS,
        instruments: ['focus-tracker', 'key-log'],
      },
      render: () => (
        <>
          <div className="keys">
            <kbd>s</kbd> star · <kbd>e</kbd> archive · <kbd>#</kbd> delete
          </div>
          <p className="example-note">
            Bound at the document level with no way to disable them. A voice-control user
            dictating "send this" fires several of these mid-sentence, and one of them deletes
            something.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'Scoped to focus, or remappable, or off.',
      live: {
        Example: () => <Inbox scoped />,
        keys: SHORTCUT_KEYS,
        instruments: ['focus-tracker', 'key-log'],
      },
      render: () => (
        <>
          <div className="keys">
            <kbd>g</kbd> then <kbd>i</kbd> · or <kbd>⌘</kbd>+<kbd>k</kbd>
          </div>
          <p className="example-note">
            Any one of the three remedies satisfies this: add a modifier, require a sequence,
            scope the binding to the focused component, or offer a setting to turn shortcuts
            off. The last is the only one that also helps someone whose disability makes
            accidental keypresses likely.
          </p>
        </>
      ),
    },
  },
];
