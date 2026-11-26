import { cssColourToHex, type Cue } from './vision';

/**
 * The cues in a live example, read from the colours the browser rendered (#56). Browser only.
 * An example marks each element whose colour carries meaning:
 *
 *   data-cue="the link “returns policy”"   what the vision filter calls it (required)
 *   data-cue-part="text|border|fill"        which of its colours: text (default), its top border, or its background
 *   data-cue-vs="text|surface|peer"         against: the text around it (its parent's colour, the default),
 *                                           the background behind it, or the same part of the
 *                                           example's `[data-cue-peer]` element (named by that attribute)
 *   data-cue-need="4.5"                     the ratio it needs by colour alone (default 3)
 *   data-cue-also="named in the instruction"  a mark that is not colour; an underline is found by itself
 */

function partColour(el: Element, part: string): string | null {
  const s = getComputedStyle(el);
  if (part === 'border') return cssColourToHex(s.borderTopColor);
  if (part === 'fill') return cssColourToHex(s.backgroundColor);
  return cssColourToHex(s.color);
}

/** The first opaque background at or above `el`. */
function backgroundOf(el: Element | null): string {
  for (let at = el; at; at = at.parentElement) {
    const bg = cssColourToHex(getComputedStyle(at).backgroundColor);
    if (bg) return bg;
  }
  return '#FFFFFF';
}

export function cuesIn(root: Element): Cue[] {
  return Array.from(root.querySelectorAll('[data-cue]')).flatMap((el) => {
    const part = el.getAttribute('data-cue-part') ?? 'text';
    const vs = el.getAttribute('data-cue-vs') ?? 'text';
    const colour = partColour(el, part);
    const peer = root.querySelector('[data-cue-peer]');
    const against =
      vs === 'peer' && peer
        ? partColour(peer, part)
        : vs === 'surface'
          ? backgroundOf(part === 'text' ? el : el.parentElement)
          : partColour(el.parentElement ?? el, 'text');
    if (!colour || !against) return [];
    const underlined = getComputedStyle(el).textDecorationLine.includes('underline');
    return [
      {
        label: el.getAttribute('data-cue')!,
        colour,
        against,
        vs:
          vs === 'peer' && peer
            ? peer.getAttribute('data-cue-peer')!
            : vs === 'surface'
              ? 'the background'
              : 'the text around it',
        need: Number(el.getAttribute('data-cue-need') ?? 3),
        also: el.getAttribute('data-cue-also') ?? (underlined ? 'underlined' : null),
      },
    ];
  });
}
