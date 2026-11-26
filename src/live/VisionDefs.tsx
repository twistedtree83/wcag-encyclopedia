import type { CSSProperties } from 'react';
import { CVD_MATRICES, type VisionFilter } from './vision';

/**
 * Draws the vision filter (#56). `VisionDefs` holds the three colour-vision SVG filters, built
 * from the same matrices `vision.ts` measures with; `visionStyle` puts one on an element.
 * Greyscale is the CSS function; every filter switches at once, since only opacity, transform
 * and colour animate (design guide §7).
 *
 * `prefix` comes from the caller's `useId`, so two filtered things on one page don't share ids.
 */

/** A `useId` value, made safe to use inside `url(#…)`. */
export const filterPrefix = (id: string) => `vis${id.replace(/[^A-Za-z0-9_-]/g, '')}`;

export function VisionDefs({ prefix }: { readonly prefix: string }) {
  return (
    <svg className="vis-defs" aria-hidden="true" focusable="false" width="0" height="0">
      <defs>
        {Object.entries(CVD_MATRICES).map(([name, m]) => (
          <filter key={name} id={`${prefix}-${name}`} colorInterpolationFilters="linearRGB">
            <feColorMatrix
              type="matrix"
              values={`${m.slice(0, 3).join(' ')} 0 0 ${m.slice(3, 6).join(' ')} 0 0 ${m.slice(6, 9).join(' ')} 0 0 0 0 0 1 0`}
            />
          </filter>
        ))}
      </defs>
    </svg>
  );
}

export function visionStyle(f: VisionFilter, prefix: string): CSSProperties | undefined {
  if (f === 'none') return undefined;
  if (f === 'greyscale') return { filter: 'grayscale(1)' };
  return { filter: `url(#${prefix}-${f})` };
}
