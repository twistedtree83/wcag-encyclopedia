/**
 * Guideline 2.1 — Keyboard Accessible.
 *
 * The audience here is wider than it first looks: not only people who cannot use a mouse, but
 * switch users, voice-control users, screen reader users, and anyone whose trackpad has died.
 * Keyboard support is the substrate every other input method is built on.
 */

import type { CriterionRecord } from './types';

export const G2_1: readonly CriterionRecord[] = [
  {
    num: '2.1.1',
    name: 'Keyboard',
    level: 'A',
    guideline: '2.1',
    plain:
      'Everything the interface can do must be doable from a keyboard. Not "most things", and ' +
      'not "there is an alternative path" — every control, every menu, every drag.',
    fail: {
      caption: 'A div pretending to be a button.',
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
    guideline: '2.1',
    plain:
      'If focus can get into something, it has to be able to get out using the keyboard alone. ' +
      'A trap does not merely inconvenience a keyboard user — it ends their session, because ' +
      'there is nothing else they can do.',
    fail: {
      caption: 'A hand-rolled focus trap with no way out.',
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
            <span className="alt-code">showModal()</span> provides one for free, which is why
            this page uses it for its own navigation drawer.
          </p>
        </>
      ),
    },
  },

  {
    num: '2.1.4',
    name: 'Character Key Shortcuts',
    level: 'A',
    guideline: '2.1',
    plain:
      'A shortcut bound to a single letter, number, or symbol must be switchable off, ' +
      'remappable, or active only while the relevant control has focus. Speech-input users ' +
      'trigger these constantly just by talking.',
    fail: {
      caption: 'Single-key shortcuts, always listening.',
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
