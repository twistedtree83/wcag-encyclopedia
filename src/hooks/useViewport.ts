import { useCallback, useEffect, useState } from 'react';

/**
 * The viewport preview: desktop / tablet / 320px.
 *
 * A production teaching device, not a design-tool leftover. On a page documenting reflow,
 * letting the reader shrink the page in place is the demonstration. It is also why layout uses
 * container queries rather than media queries — content has to size against the preview frame,
 * not the browser window, or the preview would lie.
 */
export const VIEWPORTS = {
  desktop: { label: 'Desktop', width: null },
  tablet: { label: 'Tablet', width: 834 },
  mobile: { label: '320px', width: 320 },
} as const;

export type ViewportName = keyof typeof VIEWPORTS;

/** Below this container width the rail is replaced by the drawer. */
export const RAIL_BREAKPOINT = 960;

export function useViewport(): {
  viewport: ViewportName;
  width: number | null;
  setViewport: (next: ViewportName) => void;
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
} {
  const [viewport, setViewportState] = useState<ViewportName>('desktop');
  const [navOpen, setNavOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window === 'undefined' ? 1280 : window.innerWidth,
  );

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const setViewport = useCallback((next: ViewportName) => {
    setViewportState(next);
    // Selecting 320px puts the reader in the narrow layout, where the drawer is the
    // navigation — so it opens, the same as it would on a real phone.
    setNavOpen(next === 'mobile');
  }, []);

  // The effective width is whichever is narrower: the preview frame or the real window.
  const previewWidth = VIEWPORTS[viewport].width;
  const effective = previewWidth === null ? windowWidth : Math.min(previewWidth, windowWidth);

  return {
    viewport,
    width: previewWidth,
    setViewport,
    navOpen: navOpen && effective < RAIL_BREAKPOINT,
    setNavOpen,
  };
}
