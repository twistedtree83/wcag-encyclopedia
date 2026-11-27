import { describe, it, expect } from 'vitest';
import { render, ROUTES } from '../src/entry-server';
import { routeFor } from '../src/site/routes';
import { FEEDBACK_FORM_URL } from '../src/site/config';

/**
 * Problems with the site are reported through one feedback form, set in src/site/config.ts.
 * Until it exists the address is unset and no page links to it. No page points readers at the
 * source repository, which is private.
 */

const html = (path: string) => render(routeFor(path)!).html;
const links = (s: string) =>
  [...s.matchAll(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g)].map((m) => ({
    href: m[1]!,
    text: m[2]!.replace(/<[^>]+>/g, ''),
  }));
const reportLinks = (s: string) =>
  links(s).filter((l) => l.text === 'Report a problem with this site');

describe('reporting a problem', () => {
  it('is a full https address when set', () => {
    if (FEEDBACK_FORM_URL !== undefined) expect(FEEDBACK_FORM_URL).toMatch(/^https:\/\//);
  });

  it('is linked from the accessibility statement only when the form is set', () => {
    const about = html('about/');
    const statement = about.slice(about.indexOf('id="accessibility-statement"'));
    expect(reportLinks(statement)).toEqual(
      FEEDBACK_FORM_URL ? [{ href: FEEDBACK_FORM_URL, text: 'Report a problem with this site' }] : [],
    );
    expect(about).not.toContain('linked below');
  });

  it('is linked from the footer only when the form is set', () => {
    const page = html('criteria/1.4.3/');
    expect(reportLinks(page.slice(page.indexOf('<footer')))).toEqual(
      FEEDBACK_FORM_URL ? [{ href: FEEDBACK_FORM_URL, text: 'Report a problem with this site' }] : [],
    );
  });

  // Renders every route, which can pass vitest's 5 s default on a loaded machine. Placeholder
  // addresses (TODO-…, example.com links) are caught on the built pages by e2e/placeholders.spec.ts.
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
