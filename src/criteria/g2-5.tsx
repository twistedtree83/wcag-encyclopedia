/**
 * Guideline 2.5 — Input Modalities.
 *
 * What connects these six is that each assumes a particular body: a steady hand, two working
 * fingers, the ability to shake a phone, the ability to hold a drag without slipping. Each
 * criterion names an alternative for a body that does not work that way.
 */

import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { didAction } from '../live/actions';
import { useShake } from '../live/motion';
import type { CriterionRecord, LiveExample } from './types';

/*
 * 2.5.3's live examples (#49): a Send button. The broken one's aria-label replaces the visible
 * text, so "click Send" matches nothing; the fixed one's name starts with it. "Say what you see"
 * speaks the button's visible text as a voice command.
 */

function SendButton({ label }: { label: string }) {
  return (
    <div className="live-send">
      <button type="button" className="namebox__visual" aria-label={label}>
        Send
      </button>
    </div>
  );
}

const MislabelledSend = () => <SendButton label="Submit form" />;
const LabelledSend = () => <SendButton label="Send message to support" />;

const SEND_KEYS: LiveExample['keys'] = ['tab', 'voice', 'read'];

/*
 * 2.5.8's live examples (#57): a post's toolbar, Like, Retweet and Delete. "Tap" is a fingertip
 * that aims at each in turn and lands 10px off, as fingers do. The broken icons are 16px and
 * touch, so it presses the wrong one or none; the fixed ones are 24px and it presses the one it
 * aimed at. The gesture pad draws where it aimed and where it landed.
 */

const TOOLBAR = [
  { glyph: '★', name: 'Like', did: 'Liked the post' },
  { glyph: '↻', name: 'Retweet', did: 'Retweeted the post' },
  { glyph: '✕', name: 'Delete', did: 'Deleted the post' },
] as const;

function Toolbar({ small }: { small: boolean }) {
  const [last, setLast] = useState<string | null>(null);
  return (
    <div className="live-taps">
      <div className={small ? 'tap-row tap-row--packed' : 'tap-row'}>
        {TOOLBAR.map((t) => (
          <button
            key={t.name}
            type="button"
            className={small ? 'tap-target tap-target--small' : 'tap-target'}
            aria-label={t.name}
            onClick={(e) => {
              didAction(e.currentTarget, t.did);
              setLast(t.did);
            }}
          >
            {t.glyph}
          </button>
        ))}
      </div>
      <p className="example-note">{last ? `${last}.` : 'Nothing pressed yet.'}</p>
    </div>
  );
}

const PackedToolbar = () => <Toolbar small />;
const SizedToolbar = () => <Toolbar small={false} />;

const TAP_KEYS: LiveExample['keys'] = ['tap'];
const TAP_INSTRUMENTS: LiveExample['instruments'] = ['gesture-pad'];

/*
 * 2.5.1's live examples (#58): a harbour map. Both zoom with a two-finger pinch (the bar's
 * "Pinch", or a real one on a touch screen). Only the fixed one also has + and − buttons, so a
 * single tap does anything: on the broken map, "Tap" lands on the map and nothing happens.
 */

const ZOOM_MAX = 4;

function HarbourMap({ buttons }: { buttons: boolean }) {
  const [zoom, setZoom] = useState(1);
  const zoomNow = useRef(1);
  /** Fingers on the map, and how far apart the first two started. */
  const fingers = useRef(new Map<number, { x: number; y: number }>());
  const startGap = useRef<number | null>(null);
  const gap = () => {
    const [a, b] = [...fingers.current.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  };
  const zoomTo = (el: Element, next: number) => {
    const to = Math.min(ZOOM_MAX, Math.max(1, next));
    if (to === zoomNow.current) return;
    zoomNow.current = to;
    setZoom(to);
    didAction(el, `Zoomed the map to ${to}×`);
  };
  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    fingers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (fingers.current.size === 2) startGap.current = gap();
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (fingers.current.has(e.pointerId)) fingers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };
  const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = startGap.current;
    if (start !== null && fingers.current.size === 2) {
      const ratio = gap() / start;
      if (ratio > 1.25) zoomTo(e.currentTarget, zoomNow.current + 1);
      else if (ratio < 0.8) zoomTo(e.currentTarget, zoomNow.current - 1);
      startGap.current = null;
    }
    fingers.current.delete(e.pointerId);
  };
  const onCancel = () => {
    fingers.current.clear();
    startGap.current = null;
  };
  return (
    <div className="live-map">
      <div
        className="hmap"
        data-pinch
        role="img"
        aria-label={`Map of the harbour at ${zoom}×`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onCancel}
      >
        <span className="hmap__land" style={{ transform: `scale(${1 + (zoom - 1) * 0.35})` }} />
        <span className="hmap__pin" />
      </div>
      {buttons ? (
        <div className="hmap__zoom">
          <button type="button" aria-label="Zoom in" onClick={(e) => zoomTo(e.currentTarget, zoomNow.current + 1)}>
            +
          </button>
          <button type="button" aria-label="Zoom out" onClick={(e) => zoomTo(e.currentTarget, zoomNow.current - 1)}>
            −
          </button>
        </div>
      ) : null}
      <p className="example-note">
        At {zoom}×. {buttons ? 'Pinch, or press + and −.' : 'Pinch to zoom; there is no other way.'}
      </p>
    </div>
  );
}

const PinchOnlyMap = () => <HarbourMap buttons={false} />;
const ButtonedMap = () => <HarbourMap buttons />;
const MAP_KEYS: LiveExample['keys'] = ['pinch', 'tap'];

/*
 * 2.5.2's live examples (#58): Delete draft. The broken button deletes on pointer down, so
 * "Press and slide off" deletes it anyway; the fixed one is a plain click, which fires only when
 * the pointer comes up over it, so sliding off cancels.
 */

function DeleteDraft({ onDown }: { onDown: boolean }) {
  const [note, setNote] = useState<string | null>(null);
  const remove = (el: Element) => {
    didAction(el, 'Deleted the draft');
    setNote('Deleted the draft.');
  };
  return (
    <div className="live-press">
      <p className="live-press__draft">Draft: notes for Monday</p>
      <button
        type="button"
        className="live-press__btn"
        onPointerDown={onDown ? (e) => remove(e.currentTarget) : undefined}
        onClick={onDown ? undefined : (e) => remove(e.currentTarget)}
      >
        Delete draft
      </button>
      <p className="example-note">{note ?? 'Nothing deleted yet.'}</p>
    </div>
  );
}

const DeleteOnDown = () => <DeleteDraft onDown />;
const DeleteOnUp = () => <DeleteDraft onDown={false} />;
const PRESS_KEYS: LiveExample['keys'] = ['tap', 'slide-off'];

/*
 * 2.5.4's live examples (#58): an inbox row with Archive. On both, shaking the phone undoes the
 * archive (the bar's "Shake the phone"; no motion sensor is read). The fixed one also has an
 * Undo button and a switch that turns shaking off.
 */

function ShakeToUndo({ fixed }: { fixed: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [archived, setArchived] = useState(false);
  const archivedNow = useRef(false);
  const [shaking, setShaking] = useState(true);
  const shakingNow = useRef(true);
  const undo = (el: Element) => {
    if (!archivedNow.current) return;
    archivedNow.current = false;
    setArchived(false);
    didAction(el, 'Undid the archive');
  };
  const onShake = useCallback(() => {
    if (box.current && shakingNow.current) undo(box.current);
  }, []);
  useShake(box, onShake);
  return (
    <div className="live-shake" ref={box} data-shake>
      <p className="live-shake__msg">
        {archived ? 'Archived “Lunch on Friday”.' : '“Lunch on Friday” is in the inbox.'}
      </p>
      <div className="live-shake__row">
        <button
          type="button"
          onClick={(e) => {
            if (archivedNow.current) return;
            archivedNow.current = true;
            setArchived(true);
            didAction(e.currentTarget, 'Archived “Lunch on Friday”');
          }}
        >
          Archive
        </button>
        {fixed ? (
          <>
            <button type="button" onClick={(e) => undo(e.currentTarget)}>
              Undo
            </button>
            <button
              type="button"
              role="switch"
              aria-checked={shaking}
              onClick={(e) => {
                shakingNow.current = !shakingNow.current;
                setShaking(shakingNow.current);
                didAction(e.currentTarget, `Turned shake to undo ${shakingNow.current ? 'on' : 'off'}`);
              }}
            >
              Shake to undo
            </button>
          </>
        ) : null}
      </div>
      <p className="example-note">
        {fixed
          ? `Shake to undo is ${shaking ? 'on' : 'off'}. Undo does the same.`
          : 'Shake to undo. There is no other way.'}
      </p>
    </div>
  );
}

const ShakeOnly = () => <ShakeToUndo fixed={false} />;
const ShakeOrButton = () => <ShakeToUndo fixed />;
const SHAKE_KEYS: LiveExample['keys'] = ['tap', 'shake'];

/*
 * 2.5.7's live examples (#58): delivery options to put in order. Both reorder by dragging a row's
 * handle (the bar's "Drag the top row down", or a real drag). Only the fixed rows have move up
 * and move down buttons, so on the broken list "Tap" finds nothing to press.
 */

const DELIVERY = ['Collect from store', 'Standard delivery', 'Next day'] as const;

function DeliveryOrder({ buttons }: { buttons: boolean }) {
  const list = useRef<HTMLOListElement>(null);
  const [order, setOrder] = useState<readonly string[]>(DELIVERY);
  const orderNow = useRef<readonly string[]>(DELIVERY);
  const dragging = useRef<number | null>(null);
  const move = (el: Element, from: number, to: number) => {
    const now = orderNow.current;
    if (to < 0 || to >= now.length || to === from) return;
    const next = [...now];
    const [name] = next.splice(from, 1);
    next.splice(to, 0, name!);
    orderNow.current = next;
    setOrder(next);
    didAction(el, `Moved ${name} ${to > from ? 'down' : 'up'}`);
  };
  /** The row under a pointer's height, or the nearest end. */
  const rowAt = (y: number) => {
    const rows = Array.from(list.current?.querySelectorAll('[data-drop]') ?? []);
    const i = rows.findIndex((r) => y < r.getBoundingClientRect().bottom);
    return i < 0 ? rows.length - 1 : i;
  };
  return (
    <ol className="sortl" ref={list}>
      {order.map((name, i) => (
        <li key={name} className="sortl__row" data-drop={name}>
          <span
            className="sortl__handle"
            data-drag
            aria-hidden="true"
            onPointerDown={(e) => {
              dragging.current = i;
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {
                // A simulated pointer from the bar can't be captured; it is sent here anyway.
              }
            }}
            onPointerUp={(e) => {
              const from = dragging.current;
              dragging.current = null;
              if (from !== null) move(e.currentTarget, from, rowAt(e.clientY));
            }}
            onPointerCancel={() => {
              dragging.current = null;
            }}
          >
            ⠿
          </span>
          <span className="sortl__name">{name}</span>
          {buttons ? (
            <span className="sortl__moves">
              {i > 0 ? (
                <button type="button" aria-label={`Move ${name} up`} onClick={(e) => move(e.currentTarget, i, i - 1)}>
                  ↑
                </button>
              ) : null}
              {i < order.length - 1 ? (
                <button type="button" aria-label={`Move ${name} down`} onClick={(e) => move(e.currentTarget, i, i + 1)}>
                  ↓
                </button>
              ) : null}
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

const DragOnlyList = () => <DeliveryOrder buttons={false} />;
const MovableList = () => <DeliveryOrder buttons />;
const DRAG_KEYS: LiveExample['keys'] = ['drag', 'tap'];

export const G2_5: readonly CriterionRecord[] = [
  {
    num: '2.5.1',
    name: 'Pointer Gestures',
    level: 'A',
    since: '2.1',
    guideline: '2.5',
    gist:
      'Pinches, swipes and other path or multi-finger gestures need a single-pointer alternative.',
    plain:
      'Anything driven by a multi-finger or path-based gesture — pinch, two-finger rotate, ' +
      'swipe along a track — needs a single-pointer alternative, unless the path itself is the ' +
      'point. A pinch-to-zoom map still needs plus and minus buttons.',
    labs: ['pointer-gestures'],
    fail: {
      caption: 'Zooming is gesture-only.',
      live: { Example: PinchOnlyMap, keys: MAP_KEYS, instruments: TAP_INSTRUMENTS },
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
      live: { Example: ButtonedMap, keys: MAP_KEYS, instruments: TAP_INSTRUMENTS },
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
    procedure: [
      'List every function the page operates with a gesture: a swipe through a carousel, a pinch to zoom a map, a two-finger rotate, a shape traced on a pattern lock.',
      'Leave out the gestures the browser or the operating system provides, such as pinch to zoom the whole page. Only gestures the page itself handles count.',
      'For each gesture, look for a way to do the same thing with single taps or clicks: next and previous buttons, zoom in and zoom out buttons, a menu option.',
      'Use that alternative with one finger on a phone, or with a mouse click on a computer. Check that it does everything the gesture does.',
    ],
    questions: [
      {
        question: 'Does a keyboard alternative satisfy 2.5.1?',
        answer:
          'No. A person with a head pointer or one finger may have no keyboard to hand. The gesture needs an alternative they can work with single taps or clicks, such as a button.',
      },
      {
        question: 'Is dragging a path-based gesture?',
        answer:
          'No, when only the start and the end of the movement matter, as in drag and drop. That is a dragging movement, which 2.5.7 Dragging Movements covers. A gesture is path-based when the route the pointer takes is part of the input, such as a swipe in one direction or a traced shape.',
      },
      {
        question: 'Does the browser’s pinch to zoom count for 2.5.1?',
        answer:
          'No. 2.5.1 covers gestures the page provides, not ones built into the browser or the operating system. A map that handles its own pinch gesture is covered, and needs zoom buttons too.',
      },
    ],
  },

  {
    num: '2.5.2',
    name: 'Pointer Cancellation',
    level: 'A',
    since: '2.1',
    guideline: '2.5',
    gist:
      'Actions should fire when the pointer is released, so a reader can slide off a wrong target.',
    plain:
      'Actions should fire on release, not on press — so someone who lands on the wrong control ' +
      'can slide off it and nothing happens. Firing on down-press removes the chance to change ' +
      'your mind, which matters most to people with tremors or imprecise pointing.',
    labs: ['pointer-cancellation'],
    fail: {
      caption: 'Deleting fires the moment the pointer goes down.',
      live: { Example: DeleteOnDown, keys: PRESS_KEYS, instruments: TAP_INSTRUMENTS },
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
      live: { Example: DeleteOnUp, keys: PRESS_KEYS, instruments: TAP_INSTRUMENTS },
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
    procedure: [
      'Press down on each button, link and control with the mouse, and hold the button down. Check that nothing happens yet.',
      'Still holding it down, move the pointer off the control and let go. Check that the action does not happen.',
      'Search the scripts for mousedown, pointerdown and touchstart handlers. For each one that runs an action, check that the action can be undone, or that releasing reverses it, as a press-and-hold button that shows something only while held does.',
      'Drag any item that can be dragged and drop it outside every drop target. Check that it goes back to where it started.',
      'For any action left that does run on the press, check that the press is essential, as it is for an on-screen piano key.',
    ],
    questions: [
      {
        question: 'Does a click handler pass 2.5.2?',
        answer:
          'Yes. The click event fires when the pointer is released over the same element it was pressed on, so moving off before letting go cancels it. Most failures come from handlers on mousedown, pointerdown or touchstart.',
      },
      {
        question: 'Does drag and drop pass 2.5.2?',
        answer:
          'Yes, when the person can cancel the drop. Dropping the item outside a target, or back where it started, should leave everything as it was; an undo step after the drop works too.',
      },
      {
        question: 'Can an on-screen keyboard act on the press?',
        answer:
          'Yes. A control that stands in for a physical key, such as a keyboard or a piano key, is expected to act on the press, so that is essential and is exempt.',
      },
    ],
  },

  {
    num: '2.5.3',
    name: 'Label in Name',
    level: 'A',
    since: '2.1',
    guideline: '2.5',
    labs: ['label-in-name'],
    plain:
      'A control’s accessible name must contain the text shown on it. Voice-control users say ' +
      'what they see — "click Send" — and if the accessible name is something else, nothing ' +
      'happens.',
    fail: {
      caption: 'The visible text and the accessible name disagree.',
      live: {
        Example: MislabelledSend,
        keys: SEND_KEYS,
        instruments: ['voice-control', 'announcement-log'],
      },
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
      live: {
        Example: LabelledSend,
        keys: SEND_KEYS,
        instruments: ['voice-control', 'announcement-log'],
      },
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
    procedure: [
      'List every control on the page that shows text on screen: buttons, links, and form fields with a label beside them.',
      'Open the accessibility inspector in your browser (the Accessibility pane in Chrome or Edge DevTools, or the Accessibility tab in Firefox) and read the name of each one.',
      'Check that the name contains the visible text, in the same order. Differences of capital letters and punctuation do not matter.',
      'Where the name adds words, check that the visible text comes first: a button showing "Send" named "Send message" is better than one named "Message: send".',
      'Turn on speech recognition (Voice Control on a Mac, Voice access on Windows 11) and say "Click" followed by the visible text of each control. Check that it activates the right one.',
    ],
    questions: [
      {
        question: 'Must the accessible name match the visible label exactly?',
        answer:
          'No. The name has to contain the visible text, and it can add to it. Putting the visible words at the start of the name is the safe choice, because that is what voice control users will say.',
      },
      {
        question: 'Does 2.5.3 apply to an icon button with no visible text?',
        answer:
          'No. 2.5.3 applies only where there is visible text to match. An icon button still needs a name that says what it does, which 4.1.2 Name, Role, Value covers.',
      },
      {
        question: 'Does a close button shown as "X" need the name "X"?',
        answer:
          'No. A symbol is not treated as a text label, so name the button for what it does, such as "Close".',
      },
    ],
  },

  {
    num: '2.5.4',
    name: 'Motion Actuation',
    level: 'A',
    since: '2.1',
    guideline: '2.5',
    gist:
      'Anything done by shaking or tilting the device needs an ordinary control too, and a way to turn the motion off.',
    plain:
      'If moving the device does something — shake to undo, tilt to steer — there has to be a ' +
      'normal control that does it too, and a way to switch the motion trigger off. Someone ' +
      'whose phone is mounted to a wheelchair cannot shake it; someone with a tremor shakes it ' +
      'constantly.',
    labs: ['motion-actuation'],
    fail: {
      caption: 'Shake to undo, and no other way.',
      live: { Example: ShakeOnly, keys: SHAKE_KEYS, instruments: TAP_INSTRUMENTS },
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
      live: { Example: ShakeOrButton, keys: SHAKE_KEYS, instruments: TAP_INSTRUMENTS },
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
    procedure: [
      'List every function the page runs from device motion or from gestures picked up by a camera: shake to undo, tilt to scroll, wave to go to the next page.',
      'Open the page on a phone or tablet and try each movement, to confirm which functions respond.',
      'For each one, find a button or another control on screen that does the same thing. Check that it works without moving the device.',
      'Look for a setting that turns off the response to motion. Turn it off, then shake and tilt the device and check that nothing happens.',
      'For any function left without both, check that the motion is essential to it, as counting steps is for a pedometer.',
    ],
    questions: [
      {
        question: 'Does shake to undo fail 2.5.4?',
        answer:
          'Only when it is the only way to undo or cannot be turned off. Give an undo button on screen, and a setting that stops shaking from doing anything.',
      },
      {
        question: 'Does 2.5.4 cover gestures picked up by a camera?',
        answer:
          'Yes, when a gesture of the hand, face or eyes is the input. Pointing the camera at a QR code or a document is not a gesture, so it is outside 2.5.4.',
      },
      {
        question: 'Does a game controlled by tilting the device fail 2.5.4?',
        answer:
          'Only when tilting is not essential to the game. Where the game exists to be steered by tilting, the motion is essential and is exempt. Where it is one way to move among others, it needs an on-screen control and a way to turn it off.',
      },
    ],
  },

  {
    num: '2.5.7',
    name: 'Dragging Movements',
    level: 'AA',
    since: '2.2',
    guideline: '2.5',
    plain:
      'Anything you drag needs a way to do the same thing without dragging. New in WCAG 2.2. ' +
      'Dragging demands sustained precise pressure along a path — hard with a tremor, a head ' +
      'pointer, or a switch.',
    labs: ['dragging-movements'],
    fail: {
      caption: 'Reordering works by drag and drop only.',
      live: { Example: DragOnlyList, keys: DRAG_KEYS, instruments: TAP_INSTRUMENTS },
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
      live: { Example: MovableList, keys: DRAG_KEYS, instruments: TAP_INSTRUMENTS },
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
    procedure: [
      'List every function the page operates by dragging: sliders, sortable lists, kanban cards, map panning, file drop zones, image croppers.',
      'Leave out dragging the browser provides, such as its own scrollbars and touch scrolling. Content that builds its own scrolling is not left out.',
      'For each drag, look for a way to do the same thing with single taps or clicks: up and down buttons on a list item, a click on a slider track, a menu that moves a card, arrow buttons on a map.',
      'Use that alternative with a mouse, clicking without holding the button down. Check that it reaches every result the drag can reach.',
    ],
    questions: [
      {
        question: 'Does a keyboard alternative satisfy 2.5.7?',
        answer:
          'No. Someone using a pointer who cannot hold and move it needs an alternative they can work by tapping or clicking. A sortable list that works with the arrow keys still needs buttons that move an item.',
      },
      {
        question: 'Does a range slider pass 2.5.7?',
        answer:
          'Yes, when clicking or tapping any point on the track moves the thumb there. Buttons beside the slider that step the value up and down work too.',
      },
      {
        question: 'Does dragging the browser’s scrollbar count for 2.5.7?',
        answer:
          'No. Scrollbars and touch scrolling that the browser provides are out of scope. A page that turns off native scrolling and drags its own content is in scope again.',
      },
    ],
  },

  {
    num: '2.5.8',
    name: 'Target Size (Minimum)',
    level: 'AA',
    since: '2.2',
    guideline: '2.5',
    demos: ['targets-2-5-8'],
    labs: ['target-size'],
    gist:
      'Targets need to be at least 24 by 24 CSS pixels, or spaced so a 24px circle on each overlaps none.',
    plain:
      'Targets need to be at least 24 by 24 CSS pixels, or spaced so that a 24px circle centred ' +
      'on each does not overlap its neighbours. New in WCAG 2.2. Inline links in a sentence are ' +
      'exempt.',
    fail: {
      caption: 'Sixteen-pixel icons, packed edge to edge.',
      live: { Example: PackedToolbar, keys: TAP_KEYS, instruments: TAP_INSTRUMENTS },
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
      live: { Example: SizedToolbar, keys: TAP_KEYS, instruments: TAP_INSTRUMENTS },
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
    procedure: [
      'List every target on the page that a pointer can activate: buttons, links outside sentences, icons, checkboxes, the close button of a dialog.',
      'Open your browser’s developer tools (Chrome, Edge or Firefox) and inspect each small target. Read its width and height in CSS pixels from the box model.',
      'Check that each target is at least 24 by 24 CSS pixels.',
      'For each smaller one, draw an imaginary circle 24 pixels across centred on it. Check that the circle does not touch another target, or the circle of another small target. A row of 20-pixel icons needs a gap of at least 4 pixels between them.',
      'For any target that still fails, check the exceptions: a link inside a sentence, a control the browser draws and the page has not restyled, another control on the page that does the same thing and is big enough, or a size that is essential, such as pins on a map.',
    ],
    questions: [
      {
        question: 'Do links inside a paragraph have to be 24 by 24 pixels?',
        answer:
          'No. Targets inside a sentence, or held to the line height of the text around them, are exempt. Making them taller would change how the text reads.',
      },
      {
        question: 'Does a 16-pixel icon button fail 2.5.8?',
        answer:
          'Only when it is too close to another target. It passes if a circle 24 pixels across, centred on it, touches no other target and no other small target’s circle.',
      },
      {
        question: 'Is 24 pixels the size to design for?',
        answer:
          'No, it is the minimum. 2.5.5 Target Size (Enhanced), at Level AAA, asks for 44 by 44 CSS pixels, and that is the better aim for the controls people use most.',
      },
    ],
  },
];
