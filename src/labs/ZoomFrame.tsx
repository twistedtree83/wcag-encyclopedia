import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { DESKTOP, scrollsOf, viewportAt, type Scrolls, type Viewport } from './zoom';

/**
 * The zoom frame (#53, CONTEXT.md "Instrument"): a browser window drawn inside a lab or a live
 * example. Its content is laid out in the window's own CSS pixels (1280 wide at 100%, 320 at
 * 400%), then the picture is scaled to fill the frame, so zooming in makes everything bigger
 * the way a browser does, and the real page is never resized.
 *
 *   zoom        percent; the window is `base` divided by it (`viewportAt`)
 *   textScale   text size, 1 = 100%; content sized in em follows it (1.4.4)
 *   spacing     1.4.12's text spacing on everything inside (`.zframe--spaced`)
 *   turned      portrait instead of landscape: width and height swap (1.3.4)
 *   focusable   the window is a real scroll box a keyboard can scroll. Off inside inert mocks.
 *
 * The window scrolls for real (overflow: auto). After every layout it measures what scrolls
 * and reports it through `onMeasure`, and as `data-scrolls` on the frame for tests. The outer
 * box clips the scaled picture, so the frame never widens the real page.
 */

type Props = {
  readonly zoom: number;
  readonly base?: Viewport;
  readonly textScale?: number;
  readonly spacing?: boolean;
  readonly turned?: boolean;
  readonly focusable?: boolean;
  readonly onMeasure?: (scrolls: Scrolls) => void;
  readonly children: ReactNode;
};

/** The frame's window, said: the scroll box's accessible name. */
export function windowName(zoom: number, { width, height }: Viewport): string {
  return `Browser window at ${zoom}% zoom, ${width} by ${height} CSS pixels`;
}

export function ZoomFrame({
  zoom,
  base = DESKTOP,
  textScale = 1,
  spacing = false,
  turned = false,
  focusable = true,
  onMeasure,
  children,
}: Props) {
  const outer = useRef<HTMLDivElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const win = viewportAt(zoom, base, turned);
  /** Frame width over window width; null until measured (the server can't know it). */
  const [scale, setScale] = useState<number | null>(null);
  const [scrolls, setScrolls] = useState<Scrolls | null>(null);
  const report = useRef(onMeasure);
  report.current = onMeasure;

  /**
   * Measure after every render (a new zoom, or new content such as a layout switch) and when
   * the frame or its first child resizes. State changes only when a value does, so this never loops.
   */
  const measure = useRef<() => void>(() => {});
  measure.current = () => {
    const box = outer.current;
    const scroller = view.current;
    if (!box || !scroller) return;
    const nextScale = box.clientWidth / win.width;
    setScale((s) => (s === nextScale ? s : nextScale));
    const now = scrollsOf(scroller);
    setScrolls((s) => (s && s.sideways === now.sideways && s.down === now.down ? s : now));
    report.current?.(now);
  };
  useLayoutEffect(() => measure.current());
  useLayoutEffect(() => {
    const box = outer.current;
    if (!box) return;
    const observer = new ResizeObserver(() => measure.current());
    observer.observe(box);
    // The content too, so a late web font that changes what scrolls is measured.
    const content = view.current?.firstElementChild;
    if (content) observer.observe(content);
    return () => observer.disconnect();
  }, []);

  const style = {
    width: `${win.width}px`,
    height: `${win.height}px`,
    fontSize: `${16 * textScale}px`,
    transform: scale === null ? undefined : `scale(${scale})`,
  } satisfies CSSProperties;

  return (
    <div
      className={spacing ? 'zframe zframe--spaced' : 'zframe'}
      ref={outer}
      style={{ aspectRatio: `${win.width} / ${win.height}` }}
      data-orientation={win.width >= win.height ? 'landscape' : 'portrait'}
      data-scrolls={scrolls ? [scrolls.down && 'down', scrolls.sideways && 'sideways'].filter(Boolean).join(' ') || 'none' : undefined}
    >
      {focusable ? (
        <div
          className="zframe__view"
          ref={view}
          style={style}
          tabIndex={0}
          role="region"
          aria-label={windowName(zoom, win)}
        >
          {children}
        </div>
      ) : (
        <div className="zframe__view" ref={view} style={style}>
          {children}
        </div>
      )}
    </div>
  );
}
