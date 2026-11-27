import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { LABS } from '../src/labs/registry';
import { RouteProvider } from '../src/site/RouteContext';
import { ROUTES } from '../src/site/routes';
import { parseMarkup } from './markup';
import type { AxNode } from '../src/labs/shared/announce';

/**
 * A lab's steps quote its controls by name in curly quotes: “Captions on this clip”, “Live
 * captions”. Each quoted phrase must be something the lab really shows when it opens: a
 * control's name, label or option text, or visible text. A step that names a control the lab
 * doesn't have sends the reader looking for something that isn't there. The one other use of
 * quotes is a value the reader types (type “#999999”, change it to “Send form”), which the lab
 * can't show before they type it.
 */

const norm = (s: string) => s.replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();

/** Words before a quote that make it a value to type rather than something shown. */
const TYPED = /\b(?:type|enter|change (?:it|this|that) to)\s*$/i;

/** Every “quoted” phrase a step says the lab shows, without punctuation closing the sentence. */
const quoted = (step: string) =>
  [...step.matchAll(/“([^”]+)”/g)]
    .filter((m) => !TYPED.test(step.slice(0, m.index)))
    .map((m) => m[1]!.replace(/[.,;:]$/, ''));

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** The phrase as whole words in any of the lab's text. */
const showsPhrase = (words: readonly string[], phrase: string) => {
  const re = new RegExp(`(^|[^a-z0-9])${escape(norm(phrase))}($|[^a-z0-9])`);
  return words.some((w) => re.test(w));
};

type Node = AxNode | string;
const kids = (n: Node): readonly Node[] => (typeof n === 'string' ? [] : n.children);
const attrs = (n: Node): Readonly<Record<string, string>> => (typeof n === 'string' ? {} : n.attrs);

/** All the words the lab shows or names: its text, and each element's naming attributes. */
function shown(html: string): string[] {
  const out: string[] = [];
  const textOf = (n: Node): string => (typeof n === 'string' ? n : kids(n).map(textOf).join(' '));
  const walk = (n: Node) => {
    if (typeof n === 'string') return;
    const a = attrs(n);
    for (const key of ['aria-label', 'title', 'placeholder', 'alt', 'value', 'label', 'aria-valuetext']) {
      if (a[key]) out.push(a[key]!);
    }
    out.push(textOf(n));
    kids(n).forEach(walk);
  };
  walk(parseMarkup(html));
  return out.map(norm);
}

/** The lab as it opens on each criterion page that shows it. */
const markupFor = (lab: (typeof LABS)[number]) =>
  lab.criteria
    .map((criterion) =>
      renderToStaticMarkup(
        createElement(
          RouteProvider,
          { value: ROUTES.find((r) => r.num === criterion)! },
          createElement(lab.Lab, { criterion }),
        ),
      ),
    )
    .join('');

describe('the controls a lab’s steps name', () => {
  it('finds each quoted phrase', () => {
    expect(quoted('Press “Swap colours”, then “Use #767676.”')).toEqual(['Swap colours', 'Use #767676']);
    expect(quoted('Type “#999999” in the field, or change it to “Send form”.')).toEqual([]);
    expect(showsPhrase(['added. 1 item in basket.'], 'Add')).toBe(false);
    expect(showsPhrase(['add to basket'], 'Add')).toBe(true);
  });

  it('has quoted names to check across the labs', () => {
    const count = LABS.flatMap((lab) => quoted(Object.values(lab.steps).join(' '))).length;
    expect(count).toBeGreaterThan(100);
  });

  it.each(LABS.map((l) => [l.id, l] as const))('%s quotes only what it shows', (_id, lab) => {
    const words = shown(markupFor(lab));
    const steps = Object.values(lab.steps).join(' ');
    const missing = quoted(steps).filter((phrase) => !showsPhrase(words, phrase));
    expect(missing, `${lab.id} steps quote these, but the lab shows none of them`).toEqual([]);
  });
});
