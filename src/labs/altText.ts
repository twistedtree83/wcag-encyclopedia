/**
 * The 1.1.1 flagship lab's model (#48): the reader writes the alt text for one mock image, either
 * a product photo (it carries information) or a decorative divider (it carries none). The log
 * reads the mock's markup; the verdict passes when the photo is named by what it shows, or the
 * divider is marked decorative with an empty alt.
 *
 * "Named by what it shows" cannot be judged in general. The lab fails the two empty namings
 * readers actually ship, a file name and a word for the kind of thing ("image"), and trusts
 * anything else the reader writes.
 */

import { spoken, type Announcement } from './announce';
import type { Verdict } from './LabShell';

export type Purpose = 'photo' | 'divider';

export type AltModel = {
  readonly purpose: Purpose;
  /** The alt attribute's value, or `null` when the img has no alt attribute at all. */
  readonly alt: string | null;
};

export const ALT_START: AltModel = { purpose: 'photo', alt: null };

/** The longest alt the lab keeps (and the URL carries). */
export const ALT_MAX = 150;

export type Preset = 'none' | 'filename' | 'decorative' | 'descriptive';

type Option<T> = { readonly value: T; readonly label: string };

export const PURPOSES: readonly Option<Purpose>[] = [
  { value: 'photo', label: 'A product photo: it shows what is for sale' },
  { value: 'divider', label: 'A divider: decoration only' },
];

export const PRESETS: readonly Option<Preset>[] = [
  { value: 'none', label: 'Leave it out' },
  { value: 'filename', label: 'The file name' },
  { value: 'decorative', label: 'Decorative: alt=""' },
  { value: 'descriptive', label: 'Describe it' },
];

/** Each image's file, and what "describe it" writes for it. */
export const FILE: Readonly<Record<Purpose, string>> = {
  photo: 'overshirt-401.jpg',
  divider: 'swirl-divider.svg',
};
const DESCRIPTION: Readonly<Record<Purpose, string>> = {
  photo: 'Wool overshirt in rust, worn open',
  divider: 'Decorative gold swirl',
};

/** The alt a preset writes for an image. */
export function presetAlt(preset: Preset, purpose: Purpose): string | null {
  if (preset === 'none') return null;
  if (preset === 'decorative') return '';
  return preset === 'filename' ? FILE[purpose] : DESCRIPTION[purpose];
}

/** The preset the alt matches for its image, or `null` for the reader's own words. */
export function presetOf({ purpose, alt }: AltModel): Preset | null {
  return PRESETS.find((p) => presetAlt(p.value, purpose) === alt)?.value ?? null;
}

const FILENAME = /^\S+\.(jpe?g|png|gif|svg|webp|avif)$/i;
const KIND_WORDS = new Set(['image', 'img', 'photo', 'picture', 'pic', 'graphic', 'icon']);

type Judged = { readonly passes: boolean; readonly why: string };

function judge({ purpose, alt }: AltModel): Judged {
  const text = alt?.trim() ?? '';
  if (purpose === 'divider') {
    if (alt === '') return { passes: true, why: 'Decoration, correctly skipped.' };
    if (alt === null) return { passes: false, why: 'No alt attribute, so the decoration is still said as an image.' };
    return { passes: false, why: 'Decoration with a name is noise.' };
  }
  if (alt === '') return { passes: false, why: 'Marked decorative, so what the photo shows is lost.' };
  if (alt === null) return { passes: false, why: 'No alt attribute, so the photo is only "image".' };
  if (!text) return { passes: false, why: 'A blank alt names nothing, so the photo is only "image".' };
  if (FILENAME.test(text)) return { passes: false, why: 'A file name says nothing about the photo.' };
  if (KIND_WORDS.has(text.toLowerCase())) {
    return { passes: false, why: 'That names the kind of thing, not what it shows.' };
  }
  return { passes: true, why: 'The photo is named.' };
}

export function altVerdict(model: AltModel): Verdict {
  return { criterion: '1.1.1', passes: judge(model).passes };
}

/** The live region's sentence after a change: the log, then why it passes or fails. */
export function altSaid(model: AltModel, lines: readonly Announcement[]): string {
  const log = lines.length
    ? `Screen reader says: ${lines.map(spoken).join('; ')}.`
    : 'Screen reader says nothing: the image is skipped.';
  return `${log} ${judge(model).why}`;
}

const attr = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/** The img tag as the author wrote it, for the readout. */
export function markupOfAlt({ purpose, alt }: AltModel): string {
  const altAttr = alt === null ? '' : ` alt="${attr(alt)}"`;
  return `<img src="${FILE[purpose]}"${altAttr}>`;
}
