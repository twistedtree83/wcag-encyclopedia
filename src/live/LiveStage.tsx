import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { LiveExample, SimKey } from '../criteria/types';
import { announce, focusLine, fromDom, liveRegionLines, spoken } from '../labs/announce';
import { autofillValue } from '../labs/inputPurpose';
import { voiceMatches } from '../labs/labelInName';
import { ACTION_EVENT } from './actions';
import {
  autofillSaid,
  contextSaid,
  keysSaid,
  pointerSaid,
  voiceSaid,
  type ContextCause,
  type StageEvent,
} from './events';
import { mapOf, nodeAt, pathTo, revealWithin, step, tabStops } from './focus';
import { INSTRUMENTS } from './instruments';
import { contextOf, hoverStep, movePointer, popupText } from './pointer';
import { listOf, tabSwitchLine } from './lists';

/**
 * A live example on its stage (#43, ADR 0002): the example, the input bar, then the instruments.
 *
 *   fail stage  the example is inert and aria-hidden. The bar drives a model of focus over it
 *               and draws the ring; nothing in it can take real focus or real events.
 *   pass stage  the example is real. Real keys and pointer work, and the same bar moves real
 *               focus, so a touch reader can operate it too.
 *
 * Both stages turn what happens into `StageEvent`s, and every instrument reads those, so one
 * instrument sits under both. Rendered only after hydration; the page pre-renders the static
 * example in its place.
 */

/** What "Dictate" says (#45). Speech input reaches the page as key presses, one per letter. */
const DICTATION = 'send this';

const KEY_LABEL: Readonly<Record<SimKey, string>> = {
  tab: 'Press Tab',
  'shift-tab': 'Shift+Tab',
  enter: 'Enter',
  space: 'Space',
  read: 'Read it aloud',
  autofill: 'Autofill',
  voice: 'Say what you see',
  escape: 'Escape',
  dictate: `Dictate “${DICTATION}”`,
  hover: 'Hover',
  'switch-tab': 'Switch tab',
  links: 'List the links',
  headings: 'List the headings',
};

/** Which keys activate which elements: Enter buttons and links, Space buttons and checkboxes. */
function activates(key: 'enter' | 'space', el: Element): boolean {
  const tag = el.tagName.toLowerCase();
  const type = (el.getAttribute('type') ?? '').toLowerCase();
  if (tag === 'button') return true;
  if (key === 'enter') return tag === 'a' && el.hasAttribute('href');
  return tag === 'input' && (type === 'checkbox' || type === 'radio');
}

/** How many events a stage keeps; instruments show fewer. */
const KEEP = 40;

type Ring = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };

export function LiveStage({ kind, live }: { kind: 'bad' | 'good'; live: LiveExample }) {
  const id = useId();
  const simulated = kind === 'bad';
  const frame = useRef<HTMLDivElement>(null);
  const example = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<readonly StageEvent[]>([]);
  /** Fail stage: the Tab stop the drawn focus is on, or -1. */
  const [simAt, setSimAt] = useState(-1);
  /** Pass stage: the last Tab stop that had real focus. */
  const realAt = useRef<HTMLElement | null>(null);
  /** True while the bar is sending keys, so the real-key listener leaves them to `press`. */
  const fromBar = useRef(false);
  const [ring, setRing] = useState<Ring | null>(null);
  const [said, setSaid] = useState('');
  /** Fail stage: the element the drawn focus is on, so the next Tab can blur it (#47). */
  const simEl = useRef<HTMLElement | null>(null);
  /** Both stages: the hover target the pointer is on, or null for away (#47). */
  const hoverEl = useRef<HTMLElement | null>(null);
  /** The bar's drawn pointer, on either stage, or null when it is away (#47). */
  const [cursor, setCursor] = useState<Ring | null>(null);
  /** What the reader last did, so a change of page in the example can say what caused it. */
  const cause = useRef<ContextCause | null>(null);
  /** A stage with "Hover" (#47) says keys with the pointer and tooltip, not with `keysSaid`. */
  const pointerStage = live.keys.includes('hover');

  const push = useCallback((e: StageEvent) => {
    setEvents((es) => [...es, e].slice(-KEEP));
    // Real focus is spoken by the reader's own screen reader; say only what it wouldn't.
    // An autofill or a voice command is the bar's own doing, on either stage: say its outcome.
    if (e.kind === 'autofill') setSaid(autofillSaid(e));
    else if (e.kind === 'voice') setSaid(voiceSaid(e));
    else if (e.kind === 'keys') {
      if (!pointerStage) setSaid(keysSaid(e));
    }
    // A change of page in a mock reaches no screen reader on its own: say it on both stages.
    else if (e.kind === 'context') {
      if (e.cause) setSaid(contextSaid(e));
    } else if (
      e.kind === 'read' ||
      ((e.kind === 'focus' || e.kind === 'change' || e.kind === 'status') && e.simulated)
    ) {
      const lines = e.kind === 'read' ? e.lines : [e.line];
      setSaid(`Screen reader says: ${lines.map((l) => spoken(l) || 'blank').join('; ')}`);
    }
  }, [pointerStage]);

  // The pointer and its tooltip (#47) are said on both stages, the move or key with what the
  // tooltip did after it: a tooltip drawn for the eye reaches no screen reader on its own.
  useEffect(() => {
    if (!pointerStage) return;
    const text = pointerSaid(events);
    if (text) setSaid(text);
  }, [events, pointerStage]);

  /** A box relative to the frame, for the drawn ring and pointer. */
  const boxOf = (el: Element): Ring => {
    const a = el.getBoundingClientRect();
    const b = frame.current!.getBoundingClientRect();
    return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height };
  };

  const lineFor = (el: Element) => {
    const root = example.current!;
    const ax = fromDom(root);
    return focusLine(nodeAt(ax, pathTo(root, el)), ax);
  };

  /** Where every Tab stop is now, for the focus tracker. */
  const mapFor = (stops: readonly Element[]) =>
    mapOf(example.current!, stops, (el) => spoken(lineFor(el)) || 'blank');

  const press = (key: SimKey) => {
    const root = example.current;
    if (!root) return;
    if (key === 'read') {
      push({ kind: 'read', simulated, lines: announce(fromDom(root)) });
      return;
    }
    // A screen reader's own lists (#50): the example's links or headings, out of context.
    if (key === 'links' || key === 'headings') {
      push({ kind: 'read', simulated, lines: listOf(announce(fromDom(root)), key) });
      return;
    }
    // A simulated switch to the next browser tab drawn in the example (`[data-sim-tab]`), on
    // either stage: the drawn cursor is `data-sim-on` on that tab, and its title is said.
    if (key === 'switch-tab') {
      const tabs = Array.from(root.querySelectorAll<HTMLElement>('[data-sim-tab]'));
      const next = step(tabs.length, tabs.findIndex((t) => t.hasAttribute('data-sim-on')), false);
      tabs.forEach((t, i) => t.toggleAttribute('data-sim-on', i === next));
      if (next >= 0) {
        push({ kind: 'read', simulated, lines: [tabSwitchLine(tabs[next]!.textContent ?? '', '')] });
      }
      return;
    }
    if (key === 'autofill') {
      // A browser fills each field whose autocomplete names a purpose it has saved (#49).
      const fields = Array.from(root.querySelectorAll<HTMLInputElement>('input, textarea')).map(
        (el) => {
          const value = autofillValue(el.getAttribute('autocomplete') ?? undefined);
          if (value) el.value = value;
          return { name: lineFor(el).name, value };
        },
      );
      push({ kind: 'autofill', simulated, fields });
      return;
    }
    if (key === 'hover') {
      // The pointer moves to the next hover target that is showing, or away (#47). On both
      // stages: a touch reader has no pointer to hover with.
      const from = hoverEl.current;
      const to = hoverStep(root, from);
      hoverEl.current = to;
      cause.current = 'pointer';
      setCursor(to ? boxOf(to) : null);
      push({ kind: 'pointer', simulated, on: to ? (to.dataset.hover ?? '') : null });
      movePointer(from, to);
      return;
    }
    const stops = tabStops(root);
    if (key === 'escape' || key === 'dictate') {
      // Keys sent to whatever has focus (#45): Escape, or a dictated phrase letter by letter.
      // With no control focused they go to what the pointer is on (#47), else to the example
      // itself, as keys go to the page body. A letter the example doesn't cancel is typed into
      // the field it lands on.
      const at = simulated ? stops[simAt] : realAt.current;
      const focused = at && at.isConnected && root.contains(at) ? at : null;
      const target = focused ?? hoverEl.current ?? root.firstElementChild ?? root;
      const where = focused ? lineFor(focused) : null;
      const actions: string[] = [];
      const hear = (e: Event) => actions.push((e as CustomEvent<string>).detail);
      root.addEventListener(ACTION_EVENT, hear);
      fromBar.current = true;
      for (const k of key === 'escape' ? ['Escape'] : [...DICTATION]) {
        const typed = target.dispatchEvent(
          new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }),
        );
        const field = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
        if (typed && field && k.length === 1) target.value += k;
      }
      fromBar.current = false;
      root.removeEventListener(ACTION_EVENT, hear);
      push({
        kind: 'keys',
        simulated,
        keys: key === 'escape' ? 'Escape' : DICTATION,
        dictated: key === 'dictate',
        target: where,
        actions,
      });
      return;
    }
    if (key === 'voice') {
      // The reader says "click" and the text they see on the first control (#49). Voice
      // control clicks the control whose accessible name contains those words.
      const first = stops[0];
      if (!first) return;
      const phrase = (first.textContent ?? '').replace(/\s+/g, ' ').trim();
      const target = stops.find((el) => voiceMatches(phrase, lineFor(el).name));
      if (target) target.click();
      const clicked = target ? lineFor(target) : null;
      push({ kind: 'voice', simulated, phrase: `click ${phrase}`, clicked });
      return;
    }
    if (key === 'tab' || key === 'shift-tab') {
      const back = key === 'shift-tab';
      cause.current = 'focus';
      if (simulated) {
        const next = step(stops.length, simAt, back);
        setSimAt(next);
        // Simulated focus scrolls a scrolling box in the example as real focus would (#46).
        if (next >= 0) revealWithin(root, stops[next]!);
        if (next >= 0) {
          const el = stops[next]!;
          push({
            kind: 'focus',
            simulated,
            line: lineFor(el),
            index: next,
            total: stops.length,
            map: mapFor(stops),
          });
          // The example's own focus handlers run as they would for real focus (#47): a broken
          // one that changes the page on focus does so here, inside the inert example.
          const prev = simEl.current;
          simEl.current = el;
          if (prev && prev !== el) {
            prev.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: el }));
          }
          if (prev !== el) {
            el.dispatchEvent(new FocusEvent('focusin', { bubbles: true, relatedTarget: prev }));
          }
        }
      } else {
        const next = step(stops.length, realAt.current ? stops.indexOf(realAt.current) : -1, back);
        // Real focus: the focus handler below records the event.
        if (next >= 0) stops[next]!.focus({ focusVisible: true } as FocusOptions);
      }
      return;
    }
    const target = simulated ? stops[simAt] : realAt.current;
    if (!target || !activates(key, target)) return;
    cause.current = 'action';
    const before = spoken(lineFor(target));
    target.click();
    // A control whose name, role and states didn't change (a plain button) says nothing new.
    // One that went with its page (#47) says nothing either.
    if (!target.isConnected) return;
    const after = lineFor(target);
    if (simulated && spoken(after) !== before) push({ kind: 'change', simulated, line: after });
  };

  // The drawn ring follows the simulated focus, and the layout on resize.
  useLayoutEffect(() => {
    if (!simulated) return;
    const place = () => {
      const root = example.current;
      const box = frame.current;
      const el = root && simAt >= 0 ? tabStops(root)[simAt] : undefined;
      if (!el || !box) return setRing(null);
      const a = el.getBoundingClientRect();
      const b = box.getBoundingClientRect();
      setRing({ x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height });
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [simulated, simAt]);

  // Real input on the pass stage.
  useEffect(() => {
    const root = example.current;
    if (simulated || !root) return;
    const onFocus = (e: FocusEvent) => {
      const stops = tabStops(root);
      const el = e.target as HTMLElement;
      const index = stops.indexOf(el);
      if (index < 0) return;
      realAt.current = el;
      push({
        kind: 'focus',
        simulated: false,
        line: lineFor(el),
        index,
        total: stops.length,
        map: mapFor(stops),
      });
    };
    const onChange = (e: Event) => {
      push({ kind: 'change', simulated: false, line: lineFor(e.target as Element) });
    };
    // A real key that made the example do something (#45): Escape closing a dialog, or a
    // focus-scoped shortcut. Keys that did nothing are the reader's own business, except Escape
    // on a stage with "Hover" (#47), whose pointer log shows it with what the tooltip did.
    // A Tab key also marks focus as the reader's doing, for a change of page (#47): focus the
    // example moves itself (after Go, say) is not.
    let lastKey = '';
    const onKey = (e: KeyboardEvent) => {
      if (fromBar.current) return;
      lastKey = e.key;
      if (!e.isTrusted) return;
      if (e.key === 'Tab') cause.current = 'focus';
      if (e.key === 'Escape' && pointerStage) {
        const el = document.activeElement;
        push({
          kind: 'keys',
          simulated: false,
          keys: 'Escape',
          dictated: false,
          target: el && el !== root && root.contains(el) ? lineFor(el) : null,
          actions: [],
        });
      }
    };
    const onAction = (e: Event) => {
      if (fromBar.current) return;
      const el = document.activeElement;
      push({
        kind: 'keys',
        simulated: false,
        keys: lastKey,
        dictated: false,
        target: el && el !== root && root.contains(el) ? lineFor(el) : null,
        actions: [(e as CustomEvent<string>).detail],
      });
    };
    const onClick = () => {
      cause.current = 'action';
    };
    // A real pointer: onto a hover target, between them, or out of the example (#47). The bar's
    // own moves are untrusted events and are pushed by `press`.
    const onOver = (e: MouseEvent) => {
      if (!e.isTrusted) return;
      const to = (e.target as Element).closest<HTMLElement>('[data-hover]');
      if (to === hoverEl.current || (to && !root.contains(to))) return;
      hoverEl.current = to;
      cause.current = 'pointer';
      setCursor(null);
      push({ kind: 'pointer', simulated: false, on: to ? (to.dataset.hover ?? '') : null });
    };
    const onLeave = (e: MouseEvent) => {
      if (!e.isTrusted || hoverEl.current === null) return;
      hoverEl.current = null;
      push({ kind: 'pointer', simulated: false, on: null });
    };
    root.addEventListener('focusin', onFocus);
    root.addEventListener('change', onChange);
    root.addEventListener('keydown', onKey, true);
    root.addEventListener(ACTION_EVENT, onAction);
    root.addEventListener('click', onClick);
    root.addEventListener('mouseover', onOver);
    root.addEventListener('mouseleave', onLeave);
    return () => {
      root.removeEventListener('focusin', onFocus);
      root.removeEventListener('change', onChange);
      root.removeEventListener('keydown', onKey, true);
      root.removeEventListener(ACTION_EVENT, onAction);
      root.removeEventListener('click', onClick);
      root.removeEventListener('mouseover', onOver);
      root.removeEventListener('mouseleave', onLeave);
    };
  }, [simulated, push, pointerStage]);

  // What the example shows (#47), on both stages: its tooltips and its own page. Read after any
  // change in it, whatever caused the change, so instruments see the outcome, not the intent.
  const started = useRef(false);
  useEffect(() => {
    const root = example.current;
    if (!root) return;
    let address = contextOf(root);
    let popup = popupText(root);
    if (address !== null && !started.current) {
      push({ kind: 'context', simulated, address, cause: null });
    }
    started.current = true;
    const observer = new MutationObserver(() => {
      const nextAddress = contextOf(root);
      if (nextAddress !== null && nextAddress !== address) {
        address = nextAddress;
        push({ kind: 'context', simulated, address, cause: cause.current });
        // A new page restarts the focus tracker; where real focus is now goes back on it.
        const active = document.activeElement;
        const stops = tabStops(root);
        if (!simulated && active instanceof HTMLElement && stops.includes(active)) {
          push({
            kind: 'focus',
            simulated: false,
            line: lineFor(active),
            index: stops.indexOf(active),
            total: stops.length,
            map: mapFor(stops),
          });
        }
      }
      const nextPopup = popupText(root);
      if (nextPopup !== popup) {
        popup = nextPopup;
        push({ kind: 'popup', simulated, text: popup });
      }
      // Simulated focus on something that went away goes nowhere, as real focus would.
      const el = simEl.current;
      if (simulated && el && (!el.isConnected || el.closest('[hidden]'))) {
        simEl.current = null;
        setSimAt(-1);
      }
    });
    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['hidden'],
    });
    return () => observer.disconnect();
    // lineFor and mapFor read refs only.
  }, [simulated, push]);

  // Status messages (4.1.3), on both stages: when a live region's text changes, it is announced
  // wherever focus is. Read from attributes, so the inert fail stage is judged the same way.
  useEffect(() => {
    const root = example.current;
    if (!root) return;
    let heard = liveRegionLines(fromDom(root)).map(spoken);
    const observer = new MutationObserver(() => {
      const lines = liveRegionLines(fromDom(root));
      lines.forEach((line, i) => {
        if (line.name && spoken(line) !== heard[i]) push({ kind: 'status', simulated, line });
      });
      heard = lines.map(spoken);
    });
    observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true });
    return () => observer.disconnect();
  }, [simulated, push]);

  const { Example } = live;
  return (
    <>
      <div className="stage__example live__frame" ref={frame}>
        {simulated ? (
          <div className="live__example" ref={example} aria-hidden="true" inert>
            <Example />
          </div>
        ) : (
          <div className="live__example" ref={example}>
            <Example />
          </div>
        )}
        {simulated && !live.hideRing ? (
          <span
            className="sim-ring"
            aria-hidden="true"
            data-on={ring ? 'true' : 'false'}
            style={
              ring
                ? {
                    width: `${ring.w}px`,
                    height: `${ring.h}px`,
                    transform: `translate(${ring.x}px, ${ring.y}px)`,
                  }
                : undefined
            }
          />
        ) : null}
        {live.keys.includes('hover') ? (
          // The bar's pointer, drawn on either stage (#47): it moves by transform only.
          <span
            className="sim-cursor"
            aria-hidden="true"
            data-on={cursor ? 'true' : 'false'}
            style={
              cursor
                ? {
                    transform: `translate(${cursor.x + Math.min(cursor.w / 2, 24)}px, ${cursor.y + cursor.h / 2}px)`,
                  }
                : undefined
            }
          >
            <svg viewBox="0 0 16 22" width="16" height="22" focusable="false">
              <path d="M1 1 L1 17 L5 13 L8 20 L11 19 L8 12 L14 12 Z" />
            </svg>
          </span>
        ) : null}
      </div>
      <div
        className="inbar"
        role="group"
        aria-label={simulated ? 'Simulated input for the broken example' : 'Input for the fixed example'}
      >
        {live.keys.map((key) => (
          <button key={key} type="button" className="btn o sm" onClick={() => press(key)}>
            {KEY_LABEL[key]}
          </button>
        ))}
      </div>
      <div className="stage__instruments">
        {live.instruments.map((name) => {
          const Instrument = INSTRUMENTS[name]!;
          return <Instrument key={name} id={`${id}-${name}`} events={events} />;
        })}
        <p className="sr" aria-live="polite">
          {said}
        </p>
      </div>
    </>
  );
}
