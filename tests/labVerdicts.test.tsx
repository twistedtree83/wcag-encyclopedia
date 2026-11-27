import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { LABS } from '../src/labs/registry';
import { RouteProvider } from '../src/site/RouteContext';
import { ROUTES } from '../src/site/routes';

/**
 * A lab's verdict line names the criterion of the page it is shown on. A lab registered for
 * several criteria (the colour check is on 1.4.1, 1.4.3 and 1.4.11) judges each page's own
 * criterion, never a neighbour's: "1.4.3 passes" on the 1.4.1 page answers a question the page
 * didn't ask.
 */

const verdictOn = (lab: (typeof LABS)[number], criterion: string) => {
  const html = renderToStaticMarkup(
    createElement(
      RouteProvider,
      { value: ROUTES.find((r) => r.num === criterion)! },
      createElement(lab.Lab, { criterion }),
    ),
  );
  const line = /<p class="lab-verdict[^"]*">(.*?)<\/p>/.exec(html);
  return line ? line[1]!.replace(/<[^>]+>/g, '').trim() : null;
};

const cases = LABS.flatMap((lab) => lab.criteria.map((num) => [lab.id, num, lab] as const));

describe('the verdict line', () => {
  it.each(cases)('%s on %s names that criterion', (_id, num, lab) => {
    expect(verdictOn(lab, num)).toMatch(new RegExp(`^${num.replace(/\./g, '\\.')} (passes|fails)$`));
  });
});
