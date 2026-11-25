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
const TAP_INSTRUMENTS = ['gesture-pad'];

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
  },

  {
    num: '2.5.2',
    name: 'Pointer Cancellation',
    level: 'A',
    since: '2.1',
    guideline: '2.5',
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
  },

  {
    num: '2.5.4',
    name: 'Motion Actuation',
    level: 'A',
    since: '2.1',
    guideline: '2.5',
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
  },

  {
    num: '2.5.8',
    name: 'Target Size (Minimum)',
    level: 'AA',
    since: '2.2',
    guideline: '2.5',
    demos: ['targets-2-5-8'],
    labs: ['target-size'],
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
  },
];
