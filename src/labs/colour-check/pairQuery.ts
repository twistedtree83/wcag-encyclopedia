/**
 * The Colour check page takes a pair from the URL so a lab can hand its pair over:
 *
 *   ?fg=777777   the text colour (3 or 6 hex digits, `#` optional)
 *   ?bg=FFFFFF   the background
 *
 * Anything that is not a colour is ignored rather than rejected: a bad link still opens the page.
 */

import { normaliseHex } from '../../color/contrast';
import type { ColourPair } from './pairs';

/** The search string for a pair, with its leading `?`: `?fg=777777&bg=FFFFFF`. */
export function searchFromPair({ fg, bg }: ColourPair): string {
  return `?fg=${fg.replace(/^#/, '')}&bg=${bg.replace(/^#/, '')}`;
}

/**
 * The pair a search string asks for, or `null` when it names no colour. A colour that is
 * missing or unreadable keeps its value from `current`.
 */
export function pairFromSearch(search: string, current: ColourPair): ColourPair | null {
  const params = new URLSearchParams(search);
  const fg = normaliseHex(params.get('fg') ?? '');
  const bg = normaliseHex(params.get('bg') ?? '');
  if (!fg && !bg) return null;
  return { fg: fg ?? current.fg, bg: bg ?? current.bg };
}
