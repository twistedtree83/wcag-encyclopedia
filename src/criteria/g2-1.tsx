/**
 * Guideline 2.1 — Keyboard Accessible.
 *
 * The audience here is wider than it first looks: not only people who cannot use a mouse, but
 * switch users, voice-control users, screen reader users, and anyone whose trackpad has died.
 * Keyboard support is the substrate every other input method is built on.
 */

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { basketText } from '../labs/keyboard-control/keyboard';
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
    procedure: [
      'Put the mouse aside and click once in the browser address bar, so the page starts with no element focused.',
      'Press Tab to move through the page. Check that every link, button, field and custom control receives focus at some point.',
      'Activate each control from the keyboard: Enter for links and buttons, Space for buttons and checkboxes, arrow keys inside menus, tabs, radio groups and sliders. Check that it does what a click does.',
      'Find every function that a pointer reaches through hover, drag or right-click, such as a hover menu, a tooltip or a sortable list. Check that the same function can be reached from the keyboard.',
      'Check that no function needs a key held down or pressed in quick succession. A keystroke may take as long as the person needs.',
    ],
    questions: [
      {
        question: 'Does 2.1.1 require a visible focus indicator?',
        answer:
          'No. 2.1.1 asks only that everything can be operated from the keyboard. Seeing where focus is belongs to 2.4.7 Focus Visible, so a page can pass one and fail the other.',
      },
      {
        question: 'Does a drawing or signature tool have to work from the keyboard?',
        answer:
          'Only when the function does not depend on the path the pointer takes. Freehand drawing, where the speed and shape of each stroke are the result, is exempt. Placing a shape or drawing a straight line between two points is not, because the start and end points can be given from the keyboard.',
      },
      {
        question: 'Does a menu that opens only on mouse hover fail 2.1.1?',
        answer:
          'Yes, if its links cannot be reached any other way from the keyboard. Open it on focus or on Enter as well as on hover, or make every item in it reachable by Tab.',
      },
    ],
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
    procedure: [
      'Start at the top of the page and press Tab repeatedly. Check that focus moves forward through every part of the page and on to the browser address bar.',
      'Press Shift+Tab from the end of the page. Check that focus moves back through every part of the page.',
      'Open each widget that takes focus, such as a dialog, a date picker, a video player, an embedded map or an iframe. Check that Tab, Shift+Tab or Escape moves focus out of it again.',
      'Where a widget needs some other key to leave, check that the page tells the person which key, before or inside the widget.',
      'Check content that loads later, such as a chat widget or an advert, the same way. A trap in a third-party embed fails the page it sits on.',
    ],
    questions: [
      {
        question: 'Is a modal dialog that keeps focus inside it a keyboard trap?',
        answer:
          'No, as long as the person can leave it. Holding focus inside an open dialog is expected; it passes when Escape, a close button or a cancel button returns focus to the page.',
      },
      {
        question: 'Do embedded players and third-party widgets count for 2.1.2?',
        answer:
          'Yes. Every part of the page has to let focus out, even content that you did not write and that does not help the page meet any other criterion. One trapped iframe stops a keyboard user from reaching anything after it.',
      },
      {
        question: 'Can a widget use an unusual key to let focus out?',
        answer:
          'Only when the page tells the person what that key is. Tab, Shift+Tab, the arrow keys and Escape need no explanation; anything else needs an instruction they can find before they get stuck.',
      },
    ],
  },

  {
    num: '2.1.4',
    name: 'Character Key Shortcuts',
    level: 'A',
    since: '2.1',
    guideline: '2.1',
    labs: ['character-shortcuts'],
    gist:
      'Single-key shortcuts must be possible to turn off, remap, or limit to when their control has focus.',
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
    procedure: [
      'Look for keyboard shortcuts in the page’s help, its settings and its code: search the scripts for keydown or keypress handlers that act on a single character.',
      'Click on an empty part of the page so that no field has focus. Press each letter, number, punctuation mark and symbol key in turn, and note any that does something.',
      'For each shortcut found, check that at least one of these holds: a setting turns it off, a setting changes it to include Ctrl, Alt or another modifier key, or it works only while its own control has focus.',
      'Turn on speech recognition (Voice Control on a Mac, Voice access on Windows 11) and dictate a sentence with the page open. Check that no word sets off a shortcut.',
    ],
    questions: [
      {
        question: 'Do shortcuts that use Ctrl or Alt fall under 2.1.4?',
        answer:
          'No. 2.1.4 covers shortcuts made only of printable characters: letters, numbers, punctuation and symbols. A shortcut that needs Ctrl, Alt or Cmd is not set off by speech input or by a stray key press, so it is out of scope.',
      },
      {
        question: 'Do I have to offer a way to turn off and a way to remap each shortcut?',
        answer:
          'No. One is enough for each shortcut. It can be turned off, or remapped to include a modifier key, or it can work only while its own control has focus.',
      },
      {
        question: 'Does typing a letter to jump to an option in a listbox fail 2.1.4?',
        answer:
          'No. A listbox or a drop-down menu responds to letters only while it has focus, which is one of the ways to pass. The risk is a shortcut that listens to the whole page.',
      },
    ],
  },
];
