/**
 * The demo registry: id → a self-contained player.
 *
 * Each entry wraps its own timeline and frame renderer, which erases the timeline's state type
 * at the boundary — so the registry stays a flat list while `frameAt` stays generic and
 * type-safe inside each demo.
 *
 * A criterion card looks its demo up by the `demo` field on its record; the demo library (T-10)
 * indexes the same list. One source, two consumers.
 */

import type { ReactNode } from 'react';
import { DemoPlayer } from './DemoPlayer';
import { reflowTimeline, renderReflow } from './demos/reflow';

export type DemoEntry = {
  readonly id: string;
  readonly title: string;
  /** The criterion this demo illustrates. */
  readonly criterion: string;
  readonly duration: number;
  readonly Player: () => ReactNode;
};

export const DEMOS: readonly DemoEntry[] = [
  {
    id: reflowTimeline.id,
    title: reflowTimeline.title,
    criterion: '1.4.10',
    duration: reflowTimeline.duration,
    Player: () => <DemoPlayer timeline={reflowTimeline} render={renderReflow} />,
  },
];

export function demoById(id: string): DemoEntry | undefined {
  return DEMOS.find((d) => d.id === id);
}
