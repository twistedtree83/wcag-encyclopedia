/**
 * The vision filter (#56, CONTEXT.md "Instrument"): the example seen in greyscale or through a
 * colour-vision simulation, and whether each cue that carries meaning still stands out.
 *
 * The same matrices drive what is drawn (`VisionDefs.tsx`: CSS `grayscale(1)` for greyscale, SVG
 * `feColorMatrix` in linear RGB for the rest) and what is measured here, so a ratio the
 * instrument shows is the ratio of the colours on screen. Ratios come from the contrast engine.
 *
 *   greyscale      CSS grayscale(1): each channel becomes 0.2126 R + 0.7152 G + 0.0722 B, in sRGB
 *   protanopia     no long-wavelength (red) cones   } Machado, Oliveira and Fernandes (2009),
 *   deuteranopia   no medium-wavelength (green)     } severity 1.0, applied to linear RGB
 *   tritanopia     no short-wavelength (blue)       }
 *
 * Pure: no DOM. `LiveStage` reads the rendered colours and hands them over as hex.
 */

import { contrastRatio, formatScore, parseHex, passesThreshold } from '../color/contrast';

export type VisionFilter = 'none' | 'greyscale' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export const VISION_FILTERS: readonly { readonly id: VisionFilter; readonly name: string }[] = [
  { id: 'none', name: 'Full colour' },
  { id: 'greyscale', name: 'Greyscale' },
  { id: 'protanopia', name: 'No red cones (protanopia)' },
  { id: 'deuteranopia', name: 'No green cones (deuteranopia)' },
  { id: 'tritanopia', name: 'No blue cones (tritanopia)' },
];

type Matrix = readonly [number, number, number, number, number, number, number, number, number];

const GREY: Matrix = [0.2126, 0.7152, 0.0722, 0.2126, 0.7152, 0.0722, 0.2126, 0.7152, 0.0722];

/** The colour-vision matrices, row by row (R', G', B'), for linear RGB. */
export const CVD_MATRICES: Readonly<Record<'protanopia' | 'deuteranopia' | 'tritanopia', Matrix>> = {
  protanopia: [
    0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998,
  ],
  deuteranopia: [
    0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182, 0.04294, 0.968881,
  ],
  tritanopia: [
    1.255528, -0.076749, -0.178779, -0.078411, 0.930809, 0.147602, 0.004733, 0.691367, 0.3039,
  ],
};

/** The filter after `f` on the input bar: greyscale first, then the three colour-vision views. */
export function nextFilter(f: VisionFilter): VisionFilter {
  const i = VISION_FILTERS.findIndex((v) => v.id === f);
  return VISION_FILTERS[(i + 1) % VISION_FILTERS.length]!.id;
}

export function filterName(f: VisionFilter): string {
  return VISION_FILTERS.find((v) => v.id === f)!.name;
}

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);
const hex2 = (c: number) => Math.round(clamp(c) * 255).toString(16).padStart(2, '0');

function apply(m: Matrix, [r, g, b]: readonly number[]): [number, number, number] {
  return [
    m[0] * r! + m[1] * g! + m[2] * b!,
    m[3] * r! + m[4] * g! + m[5] * b!,
    m[6] * r! + m[7] * g! + m[8] * b!,
  ];
}

/** `hex` as it looks through filter `f`, as `#RRGGBB`. */
export function seen(hex: string, f: VisionFilter): string {
  const { r, g, b } = parseHex(hex);
  const rgb = [r / 255, g / 255, b / 255];
  let out: readonly number[];
  if (f === 'none') out = rgb;
  else if (f === 'greyscale') out = apply(GREY, rgb);
  else out = apply(CVD_MATRICES[f], rgb.map(toLinear)).map((c) => toGamma(clamp(c)));
  return `#${out.map(hex2).join('')}`.toUpperCase();
}

/** A colour as `getComputedStyle` writes it ("rgb(22, 104, 196)"), as hex; null if transparent. */
export function cssColourToHex(css: string): string | null {
  const m = /^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/.exec(css.trim());
  if (!m || (m[4] !== undefined && Number(m[4]) === 0)) return null;
  return `#${[m[1], m[2], m[3]].map((c) => hex2(Number(c) / 255)).join('')}`.toUpperCase();
}

/**
 * A cue: something whose colour carries meaning (a link's text, a field's edge, a green button),
 * the colour it has to stand out against, and anything other than colour that also marks it.
 */
export type Cue = {
  /** What the cue is, as the instrument says it: "the field’s edge". */
  readonly label: string;
  readonly colour: string;
  readonly against: string;
  /** What `against` is: "the text around it", "the background". */
  readonly vs: string;
  /** The ratio it needs to stand out by colour alone: 3 for links and edges, 4.5 for body text. */
  readonly need: number;
  /** A mark that is not colour ("underlined"), or null when colour is all there is. */
  readonly also: string | null;
};

export type CueSeen = {
  readonly label: string;
  readonly ratioText: string;
  /** It stands out through the filter: by lightness against `against`, or by its other mark. */
  readonly found: boolean;
  readonly line: string;
};

export function seeCue(cue: Cue, f: VisionFilter): CueSeen {
  const ratio = contrastRatio(seen(cue.colour, f), seen(cue.against, f));
  const ratioText = `${formatScore(ratio)} : 1`;
  const bright = passesThreshold(ratio, cue.need);
  const found = bright || cue.also !== null;
  const how = cue.also ? `, and ${cue.also}` : bright ? '' : `, needs ${cue.need} : 1`;
  return {
    label: cue.label,
    ratioText,
    found,
    line: `${cue.label[0]!.toUpperCase()}${cue.label.slice(1)}: ${ratioText} against ${cue.vs}${how}. ${found ? 'Stands out.' : 'Lost.'}`,
  };
}

/** What is said when the filter changes: the filter, then what stands out. */
export function visionSaid({
  filter,
  cues,
}: {
  readonly filter: VisionFilter;
  readonly cues: readonly CueSeen[];
}): string {
  return [`Vision filter: ${filterName(filter).toLowerCase()}.`, ...cues.map((c) => c.line)].join(' ');
}
