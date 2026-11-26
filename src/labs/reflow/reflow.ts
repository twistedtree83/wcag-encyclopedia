/**
 * The 1.4.10 flagship lab's model (#53): a catalogue page in the zoom frame, at one of three
 * zoom levels, laid out either at a fixed width or reflowing. The verdict fails when the page
 * has to scroll sideways as well as down.
 *
 * The page is always taller than the window, so it always scrolls down; it scrolls sideways
 * only when its fixed width is wider than the window. e2e checks the frame measures the same.
 */

import type { Verdict } from '../shared/LabShell';
import { viewportAt, scrollLine, type Zoom } from '../shared/zoom';

export type Layout = 'fixed' | 'reflow';

export const LAYOUTS: readonly { readonly value: Layout; readonly label: string }[] = [
  { value: 'fixed', label: 'Fixed width' },
  { value: 'reflow', label: 'Reflows' },
];

/** The fixed-width page's width in CSS pixels (60em at 16px): wider than 200% and 400%. */
export const FIXED_WIDTH = 960;

export type Reflow = { readonly zoom: Zoom; readonly layout: Layout };

export const REFLOW_START: Reflow = { zoom: 100, layout: 'fixed' };

export function sideways({ zoom, layout }: Reflow): boolean {
  return layout === 'fixed' && FIXED_WIDTH > viewportAt(zoom).width;
}

export function reflowVerdict(state: Reflow): Verdict {
  return { criterion: '1.4.10', passes: !sideways(state) };
}

const layoutName = (layout: Layout) => LAYOUTS.find((l) => l.value === layout)!.label;

export function reflowSaid(state: Reflow): string {
  const { width } = viewportAt(state.zoom);
  const scrolls = scrollLine({ sideways: sideways(state), down: true })
    .replace(': two directions', '')
    .toLowerCase();
  return `${state.zoom}% zoom, ${width} CSS pixels wide. ${layoutName(state.layout)}: ${scrolls}.`;
}
