/**
 * The focus model under a live example's stage (#43): which elements Tab stops at, and where
 * Tab and Shift+Tab go next. The fail stage runs it over inert markup and draws the ring; the
 * pass stage runs it over real markup and moves real focus. Judged from tag and attributes, not
 * from the browser's own focusability, because an inert example can't be focused at all.
 */

import type { AxNode } from '../labs/announce';
import type { FocusMap } from './focusTrack';

const NATIVE = new Set(['button', 'select', 'textarea', 'summary', 'iframe']);

/** Whether Tab stops at an element with this tag and these attributes. */
export function isTabbable(tag: string, attrs: Readonly<Record<string, string>>): boolean {
  if ('disabled' in attrs || 'hidden' in attrs) return false;
  const tabindex = attrs.tabindex;
  if (tabindex !== undefined && tabindex.trim() !== '') return Number(tabindex) >= 0;
  if (NATIVE.has(tag)) return true;
  if (tag === 'a' || tag === 'area') return 'href' in attrs;
  if (tag === 'input') return (attrs.type ?? '').toLowerCase() !== 'hidden';
  return 'contenteditable' in attrs && attrs.contenteditable !== 'false';
}

/**
 * The next Tab stop: `current` is an index into the stops, or -1 when focus is not in the example
 * yet. Tab from outside goes to the first stop, Shift+Tab to the last; both wrap at the ends.
 */
export function step(total: number, current: number, back: boolean): number {
  if (total === 0) return -1;
  if (current < 0) return back ? total - 1 : 0;
  return (current + (back ? total - 1 : 1)) % total;
}

/**
 * The node at `path` (element-child indices, text skipped) below `root`. `fromDom` copies every
 * element child in order, so a path taken in the DOM (`pathTo`) finds the same element's copy.
 */
export function nodeAt(root: AxNode, path: readonly number[]): AxNode {
  let node = root;
  for (const i of path) {
    const next = node.children.filter((c): c is AxNode => typeof c !== 'string')[i];
    if (!next) throw new Error(`no element at ${path.join('/')}`);
    node = next;
  }
  return node;
}

/** The element-child indices from `root` down to `el`. Browser only. */
export function pathTo(root: Element, el: Element): number[] {
  const path: number[] = [];
  for (let at: Element | null = el; at && at !== root; at = at.parentElement) {
    if (!at.parentElement) break;
    path.unshift(Array.from(at.parentElement.children).indexOf(at));
  }
  return path;
}

/**
 * Where each of `stops` sits inside `root`, for the focus tracker (#44): boxes relative to the
 * root's top left, in Tab order, labelled by `label`. Works on inert markup too. Browser only.
 */
export function mapOf(
  root: Element,
  stops: readonly Element[],
  label: (el: Element) => string,
): FocusMap {
  const r = root.getBoundingClientRect();
  return {
    width: r.width,
    height: r.height,
    stops: stops.map((el) => {
      const b = el.getBoundingClientRect();
      return { x: b.left - r.left, y: b.top - r.top, w: b.width, h: b.height, label: label(el) };
    }),
  };
}

/** The Tab stops inside `root`, in document order. Browser only. */
export function tabStops(root: Element): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('*')).filter((el) => {
    if (el.closest('[hidden]')) return false;
    const attrs: Record<string, string> = {};
    for (const a of Array.from(el.attributes)) attrs[a.name] = a.value;
    return isTabbable(el.tagName.toLowerCase(), attrs);
  });
}
