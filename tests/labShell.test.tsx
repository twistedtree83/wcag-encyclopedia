import { describe, it, expect } from 'vitest';
import { render, ROUTES } from '../src/entry-server';
import { criterionPath, PATHS } from '../src/site/routes';
import { fadeState } from '../src/labs/fade';
import { pairVerdict } from '../src/labs/ColourCheck';
import { verdictText } from '../src/labs/LabShell';

/**
 * The lab shell (#41) as the build writes it: every lab has exactly one verdict line naming a
 * criterion, a Reset button and one polite live region, before any script runs. Expected
 * verdicts come from the design guide's measured ratios (#777 on white is 4.47 : 1), not from
 * the contrast formula.
 */

const main = (html: string) => html.slice(html.indexOf('<main'), html.indexOf('</main>'));
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

function pageAt(path: string) {
  const route = ROUTES.find((r) => r.path === path);
  if (!route) throw new Error(`no route ${path}`);
  return main(render(route).html);
}

const count = (html: string, re: RegExp) => [...html.matchAll(re)].length;

describe('the verdict', () => {
  it('names the criterion and says passes or fails', () => {
    expect(verdictText({ criterion: '1.4.3', passes: false })).toBe('1.4.3 fails');
    expect(verdictText({ criterion: '2.5.8', passes: true })).toBe('2.5.8 passes');
  });

  it('judges fade-the-text on 1.4.3 body text', () => {
    expect(fadeState(18).verdict).toEqual({ criterion: '1.4.3', passes: true });
    expect(fadeState(75).verdict).toEqual({ criterion: '1.4.3', passes: false });
  });

  it('judges the colour check by the criterion of the page it is on', () => {
    const grey = { fg: '#777777', bg: '#FFFFFF' };
    expect(pairVerdict(grey, '1.4.3')).toEqual({ criterion: '1.4.3', passes: false });
    // Non-text contrast needs 3 : 1, which 4.47 : 1 clears.
    expect(pairVerdict(grey, '1.4.11')).toEqual({ criterion: '1.4.11', passes: true });
    // Use of colour has no ratio of its own: the check reports text contrast there.
    expect(pairVerdict(grey, '1.4.1')).toEqual({ criterion: '1.4.3', passes: false });
  });
});

describe('every lab in the shell, before any script runs', () => {
  const pages = [
    { path: criterionPath('1.4.1'), labs: 2, verdicts: ['1.4.3 passes', '1.4.1 fails'] },
    { path: criterionPath('1.4.3'), labs: 2, verdicts: ['1.4.3 passes', '1.4.3 passes'] },
    { path: criterionPath('1.4.11'), labs: 2, verdicts: ['1.4.11 passes', '1.4.11 passes'] },
    { path: PATHS.colourCheck, labs: 1, verdicts: ['1.4.3 passes'] },
    { path: PATHS.home, labs: 2, verdicts: ['1.4.3 passes', '1.4.3 passes'] },
  ];

  for (const { path, labs, verdicts } of pages) {
    it(`/${path} shows ${labs} verdict line(s), Reset button(s) and polite region(s)`, () => {
      const html = pageAt(path);
      const lines = [...html.matchAll(/<p class="lab-verdict[^"]*"[^>]*>(.*?)<\/p>/g)].map((m) =>
        text(m[1]!).trim(),
      );
      expect(lines).toEqual(verdicts);
      expect(count(html, /<button[^>]*>Reset<\/button>/g)).toBe(labs);
      // Home's index has its own results count; lab regions are the visually hidden ones.
      expect(count(html, /<p class="sr" aria-live="polite">/g)).toBe(labs);
    });
  }
});
