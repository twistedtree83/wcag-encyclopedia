import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { LiveExample, SimKey } from '../criteria/types';
import { announce, focusLine, fromDom, spoken } from '../labs/announce';
import type { StageEvent } from './events';
import { nodeAt, pathTo, step, tabStops } from './focus';
import { INSTRUMENTS } from './instruments';
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

const KEY_LABEL: Readonly<Record<SimKey, string>> = {
  tab: 'Press Tab',
  'shift-tab': 'Shift+Tab',
  enter: 'Enter',
  space: 'Space',
  read: 'Read it aloud',
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
  const [ring, setRing] = useState<Ring | null>(null);
  const [said, setSaid] = useState('');

  const push = useCallback((e: StageEvent) => {
    setEvents((es) => [...es, e].slice(-KEEP));
    // Real focus is spoken by the reader's own screen reader; say only what it wouldn't.
    if (e.simulated || e.kind === 'read') {
      const lines = e.kind === 'read' ? e.lines : [e.line];
      setSaid(`Screen reader says: ${lines.map((l) => spoken(l) || 'blank').join('; ')}`);
    }
  }, []);

  const lineFor = (el: Element) => {
    const root = example.current!;
    const ax = fromDom(root);
    return focusLine(nodeAt(ax, pathTo(root, el)), ax);
  };

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
    const stops = tabStops(root);
    if (key === 'tab' || key === 'shift-tab') {
      const back = key === 'shift-tab';
      if (simulated) {
        const next = step(stops.length, simAt, back);
        setSimAt(next);
        if (next >= 0) {
          push({ kind: 'focus', simulated, line: lineFor(stops[next]!), index: next, total: stops.length });
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
      push({ kind: 'focus', simulated: false, line: lineFor(el), index, total: stops.length });
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
        {simulated ? (
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
