import { describe, it, expect } from 'vitest';
import { render, ROUTES } from '../src/entry-server';
import { criterionPath, PATHS } from '../src/site/routes';
import { initialPairModel, nextPairModel, resetPairModel } from '../src/labs/colour-check/ColourCheck';

/**
 * The colour check as the build writes it: the Colour check page and the lab on the contrast
 * criterion pages, as static HTML before any script runs. Every ratio comes from the engine;
 * the expected values below are the design guide's measured figures, not recomputed here.
 */

const main = (html: string) => html.slice(html.indexOf('<main'), html.indexOf('</main>'));
const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replaceAll('&#x27;', "'")
    .replaceAll('&amp;', '&')
    .replace(/\s+/g, ' ');
const h2s = (html: string) =>
  [...main(html).matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((m) => text(m[1]!).trim());

function pageAt(path: string) {
  const route = ROUTES.find((r) => r.path === path);
  if (!route) throw new Error(`no route ${path}`);
  return render(route);
}

describe('the Colour check page', () => {
  it('is a pre-rendered route', () => {
    expect(ROUTES.find((r) => r.path === PATHS.colourCheck)?.page).toBe('colour-check');
  });

  it('has its title, one h1 and the sections in the design order', () => {
    const { html, title } = pageAt(PATHS.colourCheck);
    expect(title).toBe('Colour check: WCAG Encyclopedia');
    expect(main(html).match(/<h1/g)).toHaveLength(1);
    expect(text(main(html))).toContain('Colour check. Will people read it?');
    expect(h2s(html)).toEqual([
      'Your colours',
      'Done well, done badly',
      'What the numbers mean',
      'What a ratio can’t tell you',
    ]);
  });

  it('marks Colour check as the current nav item', () => {
    const { html } = pageAt(PATHS.colourCheck);
    expect(html).toMatch(/<a href="\.\/"[^>]*aria-current="page"[^>]*>Colour check<\/a>/);
  });

  it('starts with ink on sun and shows its measured score and four results', () => {
    const m = main(pageAt(PATHS.colourCheck).html);
    expect(m).toContain('value="#1A1C1C"');
    expect(m).toContain('value="#F8D17D"');
    // Guide §3.4: on-a (#1A1C1C) on a2 (#F8D17D) measures 11.74:1.
    expect(text(m)).toContain('11.74 : 1');
    const results = [...m.matchAll(/<li class="(ok|bad)"/g)].map((r) => r[1]);
    expect(results).toEqual(['ok', 'ok', 'ok', 'ok']);
    for (const rule of [
      'Body text, AA · 1.4.3',
      'Large text, AA · 1.4.3',
      'Body text, AAA · 1.4.6',
      'Borders and icons, AA · 1.4.11',
    ]) {
      expect(text(m)).toContain(rule);
    }
  });

  it('offers six quick-start pairs', () => {
    const m = main(pageAt(PATHS.colourCheck).html);
    const presets = m.slice(m.indexOf('class="presets"'), m.indexOf('</ul>', m.indexOf('class="presets"')));
    expect(presets.match(/<button/g)).toHaveLength(6);
    expect(text(presets)).toContain('Ink on paper');
    expect(text(presets)).toContain('Grey on white');
  });

  it('shows six pairs, the bad sample hidden from assistive technology and described in its badge', () => {
    const m = main(pageAt(PATHS.colourCheck).html);
    const pairs = m.slice(m.indexOf('class="pairs"'));
    expect(pairs.match(/Try it in the checker/g)).toHaveLength(6);
    // The failing sample text is a pseudo-element: no text node, hidden from AT.
    expect(pairs.match(/<span class="sm"[^>]*data-t="Opening hours" aria-hidden="true"><\/span>/g))
      .toHaveLength(6);
    // Guide §8.5: pale grey on white is 2.05:1, its fix 6.48:1.
    expect(text(pairs)).toContain('Badly · 2.05 : 1 . #B5B5B5 text on #FFFFFF.');
    expect(text(pairs)).toContain('Well · 6.48 : 1');
  });

  it('explains the thresholds and the limits of a ratio', () => {
    const t = text(main(pageAt(PATHS.colourCheck).html));
    expect(t).toContain('4.5 : 1');
    expect(t).toContain('Colour as the only signal');
    // The AAA result is shown as a result, never as a link to 1.4.6.
    expect(main(pageAt(PATHS.colourCheck).html)).not.toContain(criterionPath('1.4.6'));
  });

  it('names 1.4.3 and 1.4.11 as its criteria, and 1.4.6 only as the AAA result', () => {
    const eyebrow = /<p class="eyebrow">(.*?)<\/p>/.exec(main(pageAt(PATHS.colourCheck).html))![1]!;
    expect(text(eyebrow)).toBe('Tool · Success criteria 1.4.3 and 1.4.11, plus the AAA result for 1.4.6');
  });
});

describe('the colour check lab', () => {
  for (const num of ['1.4.1', '1.4.3', '1.4.11']) {
    it(`${num} shows it under Try it yourself`, () => {
      const m = main(pageAt(criterionPath(num)).html);
      expect(h2s(m)).toContain('Try it yourself');
      expect(text(m)).toContain('Try it: check your own colours');
      expect(m).toContain('aria-label="Text colour hex code"');
      expect(text(m)).toContain('Open the full colour check');
    });
  }

  it('is not on criteria about something else', () => {
    expect(main(pageAt(criterionPath('2.4.7')).html)).not.toContain('Text colour hex code');
  });
});

describe('what the colour check announces', () => {
  const start = initialPairModel({ fg: '#1A1C1C', bg: '#F8D17D' });

  it('announces nothing before the reader changes anything', () => {
    expect(start.heard).toBeNull();
    expect(start.changes).toBe(0);
  });

  it('never announces a load the reader did not make (a ?fg=/?bg= preload), even after a change of theirs', () => {
    const mine = nextPairModel(start, '#999999', '#FFFFFF', true);
    expect(mine.changes).toBe(1);
    expect(mine.heard).toEqual({ fg: '#999999', bg: '#FFFFFF' });

    const preloaded = nextPairModel(mine, '#B5B5B5', '#FFFFFF', false);
    expect(preloaded.pair).toEqual({ fg: '#B5B5B5', bg: '#FFFFFF' });
    // Nothing the announcement keys on has moved, so no new verdict is spoken.
    expect(preloaded.changes).toBe(1);
    expect(preloaded.heard).toBe(mine.heard);
  });

  it('announces each change the reader makes', () => {
    const preloaded = nextPairModel(start, '#B5B5B5', '#FFFFFF', false);
    expect(preloaded.heard).toBeNull();
    const mine = nextPairModel(preloaded, '#777777', '#FFFFFF', true);
    expect(mine.changes).toBe(1);
    expect(mine.heard).toEqual({ fg: '#777777', bg: '#FFFFFF' });
  });
  it('Reset returns to the starting pair and announces nothing, even after a preload', () => {
    const preloaded = nextPairModel(start, '#B5B5B5', '#FFFFFF', false);
    const mine = nextPairModel(preloaded, '#777777', '#FFFFFF', true);
    const reset = resetPairModel(mine);
    expect(reset.pair).toEqual({ fg: '#1A1C1C', bg: '#F8D17D' });
    expect(reset.heard).toBeNull();
    // The next change of the reader's is still announced.
    expect(nextPairModel(reset, '#999999', '#FFFFFF', true).heard).toEqual({
      fg: '#999999',
      bg: '#FFFFFF',
    });
  });
});
