/**
 * Guideline 4.1 — Compatible.
 *
 * Two criteria, and the whole of principle 4. 4.1.1 Parsing was removed in WCAG 2.2 — browsers
 * recover from malformed markup consistently now, and the criterion was failing sites for
 * problems no assistive technology actually had.
 */

import type { CriterionRecord } from './types';

export const G4_1: readonly CriterionRecord[] = [
  {
    num: '4.1.2',
    name: 'Name, Role, Value',
    level: 'A',
    guideline: '4.1',
    demos: ['name-4-1-2'],
    plain:
      'Every control has to expose three things programmatically: what it is called, what kind ' +
      'of thing it is, and what state it is in — and it has to update as that state changes. ' +
      'This is the criterion that custom components fail.',
    fail: {
      caption: 'A custom toggle that exposes nothing.',
      render: () => (
        <>
          <div className="a11ytree">
            <span className="a11ytree__ui">
              <span className="toggle toggle--on" aria-hidden="true">
                <span className="toggle__knob" />
              </span>
              Email notifications
            </span>
            <span className="a11ytree__label">announced as</span>
            <span className="a11ytree__out a11ytree__out--bad">"" — group</span>
          </div>
          <p className="example-note">
            Two <span className="alt-code">div</span>s and a click handler. No name, no role, no
            state — a screen reader user cannot tell it exists, let alone whether it is on.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'Name, role, and state, all present and live.',
      render: () => (
        <>
          <div className="a11ytree">
            <span className="a11ytree__ui">
              <span className="toggle toggle--on" aria-hidden="true">
                <span className="toggle__knob" />
              </span>
              Email notifications
            </span>
            <span className="a11ytree__label">announced as</span>
            <span className="a11ytree__out">"Email notifications, switch, on"</span>
          </div>
          <p className="example-note">
            A native <span className="alt-code">&lt;input type="checkbox" role="switch"&gt;</span>{' '}
            gets all three for nothing and updates itself. Where a custom element is
            unavoidable, <span className="alt-code">role</span>,{' '}
            <span className="alt-code">aria-checked</span>, and a real label have to be written
            and kept in sync by hand.
          </p>
        </>
      ),
    },
    diff: {
      title: 'settings.html',
      lines: [
        { kind: 'del', text: '<div class="toggle" onclick="toggle()"></div>' },
        { kind: 'del', text: '<div class="toggle-text">Email notifications</div>' },
        { kind: 'add', text: '<label>' },
        { kind: 'add', text: '  <input type="checkbox" role="switch" checked>' },
        { kind: 'add', text: '  Email notifications' },
        { kind: 'add', text: '</label>' },
      ],
      note:
        'The state changes are the part hand-rolled components forget. A native control cannot ' +
        'fall out of sync with itself.',
    },
  },

  {
    num: '4.1.3',
    name: 'Status Messages',
    level: 'AA',
    guideline: '4.1',
    demos: ['live-4-1-3'],
    plain:
      'When something important changes without moving focus — a result count, a saved ' +
      'confirmation, an error appearing — it has to be announced. Moving focus to it would be a ' +
      'change of context; this is how you tell people without interrupting them.',
    fail: {
      caption: 'The basket updates silently.',
      render: () => (
        <>
          <div className="a11ytree">
            <span className="a11ytree__ui">Basket (3) → Basket (4)</span>
            <span className="a11ytree__label">announced as</span>
            <span className="a11ytree__out a11ytree__out--bad">— nothing —</span>
          </div>
          <p className="example-note">
            The number changed in the corner of the screen. A screen reader user pressed Add
            and heard silence; they have no way to know whether it worked.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'A live region announces it, without stealing focus.',
      render: () => (
        <>
          <div className="a11ytree">
            <span className="a11ytree__ui">Basket (3) → Basket (4)</span>
            <span className="a11ytree__label">announced as</span>
            <span className="a11ytree__out">"Added. 4 items in basket."</span>
          </div>
          <p className="example-note">
            <span className="alt-code">role="status"</span> for routine updates,{' '}
            <span className="alt-code">role="alert"</span> for problems that need interrupting.
            The container has to exist in the DOM <em>before</em> the text is put into it, or
            many screen readers announce nothing. This page uses exactly this for its filter
            result count.
          </p>
        </>
      ),
    },
    diff: {
      title: 'basket.js',
      lines: [
        { kind: 'del', text: 'counter.textContent = `Basket (${n})`;' },
        { kind: 'context', text: '// <p id="status" role="status"></p> already in the DOM' },
        { kind: 'add', text: 'counter.textContent = `Basket (${n})`;' },
        { kind: 'add', text: 'status.textContent = `Added. ${n} items in basket.`;' },
      ],
      note:
        'Announce sparingly. A live region that fires on every keystroke is as unusable as one ' +
        'that never fires at all — which is why this page’s scroll position indicator is not one.',
    },
  },
];
