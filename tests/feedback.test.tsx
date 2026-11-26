import { describe, it, expect } from 'vitest';
import { render, ROUTES } from '../src/entry-server';
import { routeFor } from '../src/site/routes';
import { FEEDBACK_FORM_URL } from '../src/site/config';

/**
 * Problems with the site are reported through one feedback form, and no page points readers at
 * the source repository, which is private.
 */

const html = (path: string) => render(routeFor(path)!).html;
const links = (s: string) =>
  [...s.matchAll(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g)].map((m) => ({
    href: m[1]!,
    text: m[2]!.replace(/<[^>]+>/g, ''),
  }));

describe('reporting a problem', () => {
  it('has one place to set the form address, and it is a full URL', () => {
    expect(FEEDBACK_FORM_URL).toMatch(/^https:\/\//);
  });

  it('is linked from the accessibility statement, saying what the link is', () => {
    const about = html('about/');
    const statement = about.slice(about.indexOf('id="accessibility-statement"'));
    expect(links(statement)).toContainEqual({
      href: FEEDBACK_FORM_URL,
      text: 'Report a problem with this site',
    });
    expect(about).not.toContain('linked below');
  });

  it('is linked from the footer on every page', () => {
    const footer = html('criteria/1.4.3/');
    expect(links(footer.slice(footer.indexOf('<footer')))).toContainEqual({
      href: FEEDBACK_FORM_URL,
      text: 'Report a problem with this site',
    });
  });

  // Renders every route, which can pass vitest's 5 s default on a loaded machine.
  it(
    'leaves no page pointing at GitHub or a source code section',
    () => {
      for (const route of ROUTES) {
        const page = render(route).html;
        expect(page, route.path).not.toMatch(/github/i);
        expect(page, route.path).not.toContain('source-code');
      }
    },
    30_000,
  );
});
