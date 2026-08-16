/**
 * Guideline 2.5 — Input Modalities.
 *
 * What connects these six is that each assumes a particular body: a steady hand, two working
 * fingers, the ability to shake a phone, the ability to hold a drag without slipping. Each
 * criterion names an alternative for a body that does not work that way.
 */

import type { CriterionRecord } from './types';

export const G2_5: readonly CriterionRecord[] = [
  {
    num: '2.5.1',
    name: 'Pointer Gestures',
    level: 'A',
    guideline: '2.5',
    plain:
      'Anything driven by a multi-finger or path-based gesture — pinch, two-finger rotate, ' +
      'swipe along a track — needs a single-pointer alternative, unless the path itself is the ' +
      'point. A pinch-to-zoom map still needs plus and minus buttons.',
    fail: {
      caption: 'Zoom and rotate are gesture-only.',
      render: () => (
        <>
          <div className="gesture">
            <span className="gesture__stage">Map</span>
            <span className="gesture__hint">pinch to zoom · two fingers to rotate</span>
          </div>
          <p className="example-note">
            Someone using a head pointer, a switch, or one finger has no way to zoom. Nor does
            anyone with a tremor, for whom a controlled pinch is not reliable.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'Buttons do everything the gestures do.',
      render: () => (
        <>
          <div className="gesture">
            <span className="gesture__stage">Map</span>
            <span className="gesture__hint">
              <span className="pill">+</span> <span className="pill">−</span>{' '}
              <span className="pill">Reset north</span> · pinch still works
            </span>
          </div>
          <p className="example-note">
            The gestures stay for people who like them. What changed is that they are no
            longer the only way in.
          </p>
        </>
      ),
    },
  },

  {
    num: '2.5.2',
    name: 'Pointer Cancellation',
    level: 'A',
    guideline: '2.5',
    plain:
      'Actions should fire on release, not on press — so someone who lands on the wrong control ' +
      'can slide off it and nothing happens. Firing on down-press removes the chance to change ' +
      'your mind, which matters most to people with tremors or imprecise pointing.',
    fail: {
      caption: 'Deleting fires the moment the pointer goes down.',
      render: () => (
        <>
          <div className="press">
            <span className="press__btn press__btn--bad">Delete account</span>
            <span className="press__note">fires on pointerdown</span>
          </div>
          <p className="example-note">
            A slipped tap is irreversible. There is no moment between touching the control and
            the action happening in which to escape.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'It fires on release, over the control.',
      render: () => (
        <>
          <div className="press">
            <span className="press__btn">Delete account</span>
            <span className="press__note">fires on click · slide off to abort</span>
          </div>
          <p className="example-note">
            The default behaviour of a real <span className="alt-code">click</span> handler on a
            real button. Most violations of this criterion come from reimplementing buttons with
            <span className="alt-code"> pointerdown</span> to feel snappier.
          </p>
        </>
      ),
    },
  },

  {
    num: '2.5.3',
    name: 'Label in Name',
    level: 'A',
    guideline: '2.5',
    plain:
      'A control’s accessible name must contain the text shown on it. Voice-control users say ' +
      'what they see — "click Send" — and if the accessible name is something else, nothing ' +
      'happens.',
    fail: {
      caption: 'The visible text and the accessible name disagree.',
      render: () => (
        <>
          <div className="namebox">
            <span className="namebox__visual">Send</span>
            <span className="namebox__aria">aria-label="Submit form"</span>
          </div>
          <p className="example-note">
            "Click Send" matches nothing. The label was probably added to be helpful, and it
            silently broke voice control for that button.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'The accessible name starts with the visible text.',
      render: () => (
        <>
          <div className="namebox">
            <span className="namebox__visual">Send</span>
            <span className="namebox__aria">aria-label="Send message to support"</span>
          </div>
          <p className="example-note">
            Extra context is fine as long as the visible text is in there, and best at the
            start. Usually the right fix is no <span className="alt-code">aria-label</span> at
            all — let the visible text be the name.
          </p>
        </>
      ),
    },
  },

  {
    num: '2.5.4',
    name: 'Motion Actuation',
    level: 'A',
    guideline: '2.5',
    plain:
      'If moving the device does something — shake to undo, tilt to steer — there has to be a ' +
      'normal control that does it too, and a way to switch the motion trigger off. Someone ' +
      'whose phone is mounted to a wheelchair cannot shake it; someone with a tremor shakes it ' +
      'constantly.',
    fail: {
      caption: 'Shake to undo, and no other way.',
      render: () => (
        <>
          <div className="notice notice--bad">
            <span className="notice__title">Shake to undo</span>
            <span>No undo button anywhere in the interface.</span>
          </div>
          <p className="example-note">
            Unavailable to a mounted device, and constantly triggered by an involuntary one.
            The same gesture is both impossible and unavoidable, depending on the body.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'A button too, and a setting to disable the gesture.',
      render: () => (
        <>
          <div className="notice">
            <span className="notice__title">Undo</span>
            <span className="notice__actions">
              <span className="pill">↺ Undo</span>
              <span className="pill">Shake to undo: off</span>
            </span>
          </div>
          <p className="example-note">
            Both halves are required: an equivalent control, and the ability to turn the motion
            trigger off.
          </p>
        </>
      ),
    },
  },

  {
    num: '2.5.7',
    name: 'Dragging Movements',
    level: 'AA',
    guideline: '2.5',
    plain:
      'Anything you drag needs a way to do the same thing without dragging. New in WCAG 2.2. ' +
      'Dragging demands sustained precise pressure along a path — hard with a tremor, a head ' +
      'pointer, or a switch.',
    fail: {
      caption: 'Reordering works by drag and drop only.',
      render: () => (
        <>
          <div className="dragdemo">
            <span className="dragdemo__row">⠿ Collect from store</span>
            <span className="dragdemo__row">⠿ Standard delivery</span>
            <span className="dragdemo__row">⠿ Next day</span>
          </div>
          <p className="example-note">
            The handles are the entire interface. Nothing here can be operated by a click, a
            key, or a voice command.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'Move up and move down, alongside the drag.',
      render: () => (
        <>
          <div className="dragdemo">
            <span className="dragdemo__row">
              ⠿ Collect from store <span className="pill">↑</span> <span className="pill">↓</span>
            </span>
            <span className="dragdemo__row">
              ⠿ Standard delivery <span className="pill">↑</span> <span className="pill">↓</span>
            </span>
          </div>
          <p className="example-note">
            Buttons, a "move to position" field, or cut-and-paste all satisfy it. Dragging
            stays for those who prefer it — this criterion never asks you to remove it.
          </p>
        </>
      ),
    },
  },

  {
    num: '2.5.8',
    name: 'Target Size (Minimum)',
    level: 'AA',
    guideline: '2.5',
    plain:
      'Targets need to be at least 24 by 24 CSS pixels, or spaced so that a 24px circle centred ' +
      'on each does not overlap its neighbours. New in WCAG 2.2. Inline links in a sentence are ' +
      'exempt.',
    fail: {
      caption: 'Sixteen-pixel icons, packed edge to edge.',
      render: () => (
        <>
          <div className="targets">
            <span className="target target--small">★</span>
            <span className="target target--small">↻</span>
            <span className="target target--small">✕</span>
          </div>
          <p className="example-note">
            Delete sits four pixels from retweet. Everyone mis-taps these; for someone with a
            tremor it is most of their taps, and one of the three is destructive.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'The same icons in 24px targets.',
      render: () => (
        <>
          <div className="targets">
            <span className="target">★</span>
            <span className="target">↻</span>
            <span className="target">✕</span>
          </div>
          <p className="example-note">
            The icon can stay small — it is the <em>target</em> that has to grow, via padding.
            Spacing counts too: leave 24px of clearance between centres and the criterion is met
            without changing the visual density much.
          </p>
        </>
      ),
    },
    diff: {
      title: 'toolbar.css',
      lines: [
        { kind: 'context', text: '.icon-button {' },
        { kind: 'del', text: '  padding: 0;' },
        { kind: 'add', text: '  min-width: 24px;' },
        { kind: 'add', text: '  min-height: 24px;' },
        { kind: 'add', text: '  padding: 4px;' },
        { kind: 'context', text: '}' },
      ],
      note:
        '24px is the floor, not the goal. Platform guidance asks for 44–48px, which is what ' +
        'this page uses for its own controls.',
    },
  },
];
