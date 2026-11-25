import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { LiveExample, SimKey } from '../criteria/types';
import { announce, focusLine, fromDom, spoken } from '../labs/announce';
import { autofillValue } from '../labs/inputPurpose';
import { voiceMatches } from '../labs/labelInName';
import { autofillSaid, voiceSaid, type StageEvent } from './events';
import { mapOf, nodeAt, pathTo, step, tabStops } from './focus';
import { INSTRUMENTS } from './instruments';

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

const KEY_LABEL: Readonly<Record<SimKey, string>> = {
  tab: 'Press Tab',
  'shift-tab': 'Shift+Tab',
  enter: 'Enter',
  space: 'Space',
  read: 'Read it aloud',
  autofill: 'Autofill',
  voice: 'Say what you see',
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
  const [ring, setRing] = useState<Ring | null>(null);
  const [said, setSaid] = useState('');

  const push = useCallback((e: StageEvent) => {
    setEvents((es) => [...es, e].slice(-KEEP));
    // Real focus is spoken by the reader's own screen reader; say only what it wouldn't.
    // An autofill or a voice command is the bar's own doing, on either stage: say its outcome.
    if (e.kind === 'autofill') setSaid(autofillSaid(e));
    else if (e.kind === 'voice') setSaid(voiceSaid(e));
    else if (e.simulated || e.kind === 'read') {
      const lines = e.kind === 'read' ? e.lines : [e.line];
      setSaid(`Screen reader says: ${lines.map((l) => spoken(l) || 'blank').join('; ')}`);
    }
  }, []);

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
    const stops = tabStops(root);
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
      if (simulated) {
        const next = step(stops.length, simAt, back);
        setSimAt(next);
        if (next >= 0) {
          push({
            kind: 'focus',
            simulated,
            line: lineFor(stops[next]!),
            index: next,
            total: stops.length,
            map: mapFor(stops),
          });
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
    target.click();
    if (simulated) push({ kind: 'change', simulated, line: lineFor(target) });
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
    root.addEventListener('focusin', onFocus);
    root.addEventListener('change', onChange);
    return () => {
      root.removeEventListener('focusin', onFocus);
      root.removeEventListener('change', onChange);
    };
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
