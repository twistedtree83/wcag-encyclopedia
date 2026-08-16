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
import {
  focusVisibleTimeline,
  focusLostTimeline,
  obscuredTimeline,
  renderFocus,
  renderObscured,
} from './demos/focus';
import {
  nameTimeline,
  errorTimeline,
  liveTimeline,
  targetTimeline,
  carouselTimeline,
  renderName,
  renderError,
  renderLive,
  renderTarget,
  renderCarousel,
} from './demos/announce';

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
  {
    id: focusVisibleTimeline.id,
    title: focusVisibleTimeline.title,
    criterion: '2.4.7',
    duration: focusVisibleTimeline.duration,
    Player: () => <DemoPlayer timeline={focusVisibleTimeline} render={renderFocus} />,
  },
  {
    id: focusLostTimeline.id,
    title: focusLostTimeline.title,
    criterion: '2.4.7',
    duration: focusLostTimeline.duration,
    Player: () => <DemoPlayer timeline={focusLostTimeline} render={renderFocus} />,
  },
  {
    id: obscuredTimeline.id,
    title: obscuredTimeline.title,
    criterion: '2.4.11',
    duration: obscuredTimeline.duration,
    Player: () => <DemoPlayer timeline={obscuredTimeline} render={renderObscured} />,
  },
  {
    id: nameTimeline.id,
    title: nameTimeline.title,
    criterion: '4.1.2',
    duration: nameTimeline.duration,
    Player: () => <DemoPlayer timeline={nameTimeline} render={renderName} />,
  },
  {
    id: errorTimeline.id,
    title: errorTimeline.title,
    criterion: '3.3.1',
    duration: errorTimeline.duration,
    Player: () => <DemoPlayer timeline={errorTimeline} render={renderError} />,
  },
  {
    id: liveTimeline.id,
    title: liveTimeline.title,
    criterion: '4.1.3',
    duration: liveTimeline.duration,
    Player: () => <DemoPlayer timeline={liveTimeline} render={renderLive} />,
  },
  {
    id: targetTimeline.id,
    title: targetTimeline.title,
    criterion: '2.5.8',
    duration: targetTimeline.duration,
    Player: () => <DemoPlayer timeline={targetTimeline} render={renderTarget} />,
  },
  {
    id: carouselTimeline.id,
    title: carouselTimeline.title,
    criterion: '2.2.2',
    duration: carouselTimeline.duration,
    Player: () => <DemoPlayer timeline={carouselTimeline} render={renderCarousel} />,
  },
];
export function demoById(id: string): DemoEntry | undefined {
  return DEMOS.find((d) => d.id === id);
}
