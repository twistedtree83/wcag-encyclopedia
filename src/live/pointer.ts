/**
 * The simulated pointer and what a live example shows (#47): the input bar's "Hover" key, and the
 * readings the stage takes of the example after anything changes.
 *
 *   hover targets  elements marked `data-hover="<what the pointer is on>"`, in document order.
 *                  "Hover" moves the pointer to the next one that is showing, then away.
 *   moves          dispatched as `mouseout` / `mouseover` pairs with `relatedTarget`, the way a
 *                  real pointer fires them, so an example's own onMouseEnter / onMouseLeave run.
 *                  This works on the inert fail stage too: inert stops real input, not script.
 *   tooltips       open ones are `role="tooltip"` elements not inside `[hidden]`.
 *   context        the example's own page: the text of its `[data-context]` element, if any.
 *
 * `nextHover` is pure and unit-tested; the rest is browser only.
 */

/**
 * The next hover target: `current` is an index into the targets, or -1 for away. `hidden` says
 * which targets are not showing; they are skipped. After the last showing target, the pointer
 * moves away (-1).
 */
export function nextHover(hidden: readonly boolean[], current: number): number {
  for (let i = current + 1; i < hidden.length; i++) if (!hidden[i]) return i;
  return -1;
}

const isHidden = (el: Element) => el.closest('[hidden]') !== null;

/** Every hover target in the example, in document order, showing or not. */
export function hoverTargets(root: Element): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-hover]'));
}

/** Where "Hover" goes next from `current` (an element, or null for away). */
export function hoverStep(root: Element, current: Element | null): HTMLElement | null {
  const targets = hoverTargets(root);
  const at = current ? targets.indexOf(current as HTMLElement) : -1;
  const next = nextHover(targets.map(isHidden), at);
  return next < 0 ? null : targets[next]!;
}

/** Fire the events a real pointer fires moving from `from` to `to` (either may be null). */
export function movePointer(from: Element | null, to: Element | null): void {
  const opts = (relatedTarget: Element | null) => ({ bubbles: true, cancelable: true, relatedTarget });
  if (from) from.dispatchEvent(new MouseEvent('mouseout', opts(to)));
  if (to) to.dispatchEvent(new MouseEvent('mouseover', opts(from)));
}

/** What the open tooltips in the example say, or null when none is open. */
export function popupText(root: Element): string | null {
  const open = Array.from(root.querySelectorAll('[role="tooltip"]')).filter((el) => !isHidden(el));
  const text = open.map((el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim()).join(' ');
  return text === '' ? null : text;
}

/** The example's own page, from its `[data-context]` element, or null when it has none. */
export function contextOf(root: Element): string | null {
  const el = root.querySelector('[data-context]');
  return el ? (el.textContent ?? '').trim() : null;
}
