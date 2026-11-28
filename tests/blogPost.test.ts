import { describe, it, expect } from 'vitest';
import { parsePost } from '../src/blog/parse';
import { FIXTURE, FIXTURE_SLUG } from './fixturePost';

/**
 * A post's Markdown file (S-07, ADR 0007) parsed at build time into its frontmatter and a body
 * tree, on the fixture post (tests/fixturePost.ts).
 */

/** The fixture with its frontmatter replaced, keeping the body. */
const withFrontmatter = (front: string, body = FIXTURE.split(/^---$/m)[2]!) => `---\n${front}\n---\n${body}`;
const FRONT = FIXTURE.split(/^---$/m)[1]!.trim();
const withBody = (body: string, criteria = '[1.4.3, 1.4.11]') =>
  withFrontmatter(FRONT.replace(/^criteria: .*$/m, `criteria: ${criteria}`), body);
const LINKS = '[a](/criteria/1.4.3/) and [b](/criteria/1.4.11/).\n\n';

const problemOf = (source: string) => {
  try {
    parsePost(source, FIXTURE_SLUG);
  } catch (e) {
    return (e as Error).message;
  }
  throw new Error('parsePost accepted it');
};

describe('a post file', () => {
  it('reads its frontmatter', () => {
    const post = parsePost(FIXTURE, FIXTURE_SLUG);
    expect(post).toMatchObject({
      slug: 'fixture-contrast-thresholds',
      title: 'Two contrast thresholds, for text and for everything else',
      published: '2026-11-02',
      updated: '2026-11-20',
      criteria: ['1.4.3', '1.4.11'],
    });
    expect(post.description).toMatch(/^How the contrast of text/);
  });

  it('leaves `updated` out when the post has not been updated', () => {
    const post = parsePost(withFrontmatter(FRONT.replace(/^updated: .*\n/m, '')), FIXTURE_SLUG);
    expect('updated' in post).toBe(false);
  });

  it('turns a criterion link into a link to its criterion page', () => {
    const { body } = parsePost(FIXTURE, FIXTURE_SLUG);
    expect(body[0]).toEqual({
      tag: 'p',
      children: [
        'Text and the parts of a control are measured with the same contrast ratio, but\n',
        { tag: 'a', to: 'criteria/1.4.3/', children: ['Contrast (Minimum)'] },
        ' and ',
        { tag: 'a', to: 'criteria/1.4.11/', children: ['Non-text Contrast'] },
        '\nask for different amounts of it.',
      ],
    });
  });

  it('keeps headings at the level written, h2 first', () => {
    const { body } = parsePost(FIXTURE, FIXTURE_SLUG);
    const headings = body.filter((n) => typeof n !== 'string' && /^h\d$/.test(n.tag));
    expect(headings.map((h) => typeof h !== 'string' && [h.tag, h.children])).toEqual([
      ['h2', ['Two thresholds, one formula']],
      ['h3', ['Where the line falls']],
      ['h2', ['Sources']],
    ]);
  });

  it('keeps lists, emphasis, code, quotes and external links', () => {
    const { body } = parsePost(FIXTURE, FIXTURE_SLUG);
    expect(body).toContainEqual({
      tag: 'p',
      children: [
        'Body text needs ',
        { tag: 'strong', children: ['4.5:1'] },
        ' against its background. A field border or an icon needs ',
        { tag: 'em', children: ['3:1'] },
        '.',
      ],
    });
    expect(body).toContainEqual({
      tag: 'ol',
      children: [
        { tag: 'li', children: ['Measure the colours.'] },
        { tag: 'li', children: ['Compare them with ', { tag: 'code', children: ['4.5:1'] }, ' or ', { tag: 'code', children: ['3:1'] }, '.'] },
      ],
    });
    expect(body).toContainEqual({ tag: 'blockquote', children: [{ tag: 'p', children: ['The ratio runs from 1:1, no difference, to 21:1, black on white.'] }] });
    expect(body).toContainEqual({ tag: 'pre', children: [{ tag: 'code', children: ['.field { border-color: #767676; }'] }] });
    expect(body.at(-1)).toEqual({
      tag: 'ul',
      children: [
        {
          tag: 'li',
          children: [
            { tag: 'a', href: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html', children: ['Understanding Non-text Contrast'] },
            ', W3C',
          ],
        },
      ],
    });
  });

  it('turns ::example and ::lab into embeds of an existing example pair and lab', () => {
    const { body } = parsePost(
      withBody(`${LINKS}## Shown\n\n::example{num="1.4.11"}\n\n::lab{id="fade-text" num="1.4.3"}\n`),
      FIXTURE_SLUG,
    );
    expect(body.slice(-2)).toEqual([
      { tag: 'example', num: '1.4.11', children: [] },
      { tag: 'lab', lab: 'fade-text', num: '1.4.3', children: [] },
    ]);
  });

  it('counts an embed as linking its criterion, since the embed links its page', () => {
    const post = parsePost(withBody('## Shown\n\n::example{num="1.4.11"}\n\n::lab{id="fade-text" num="1.4.3"}\n'), FIXTURE_SLUG);
    expect(post.criteria).toEqual(['1.4.3', '1.4.11']);
  });

  it('leaves a colon in running text alone: there are no inline directives', () => {
    const { body } = parsePost(withBody(`${LINKS}Note:this stays text, as does 10:30.\n`), FIXTURE_SLUG);
    expect(body.at(-1)).toEqual({ tag: 'p', children: ['Note:this stays text, as does 10:30.'] });
  });

  it('gives a JSON-safe body, so the build can hand it to the browser', () => {
    const post = parsePost(FIXTURE, FIXTURE_SLUG);
    expect(JSON.parse(JSON.stringify(post))).toEqual(post);
  });
});

describe('a post the build refuses', () => {
  it('links a criterion its `criteria` does not list', () => {
    expect(problemOf(withBody(`${LINKS}See [focus](/criteria/2.4.7/).\n`))).toMatch(
      /links criterion 2\.4\.7, which its criteria \[1\.4\.3, 1\.4\.11\] do not list/,
    );
  });

  it('links a criterion that does not exist', () => {
    expect(problemOf(withBody(`${LINKS}See [parsing](/criteria/4.1.1/).\n`))).toMatch(/links \/criteria\/4\.1\.1\/, which is no page on the site/);
  });

  it('links a criterion any other way than by its criterion page', () => {
    expect(problemOf(withBody(`${LINKS}See [a](criteria/1.4.3/).\n`))).toMatch(/links "criteria\/1\.4\.3\/"/);
    expect(problemOf(withBody(`${LINKS}See [a](/criteria/1.4.3).\n`))).toMatch(/links "\/criteria\/1\.4\.3"/);
  });

  it('lists a criterion it never links', () => {
    expect(problemOf(withBody(LINKS, '[1.4.3, 1.4.11, 2.4.7]'))).toMatch(/lists criterion 2\.4\.7 but never links its page/);
  });

  it('lists a criterion that does not exist', () => {
    expect(problemOf(withBody(LINKS, '[1.4.3, 1.4.11, 4.1.1]'))).toMatch(/criteria: 4\.1\.1 is not a WCAG 2\.2 A or AA criterion/);
  });

  it('starts its headings at h1, or skips a level', () => {
    expect(problemOf(withBody(`${LINKS}# Again\n`))).toMatch(/heading "Again" is h1: a post's headings start at h2/);
    expect(problemOf(withBody(`${LINKS}## One\n\n#### Three\n`))).toMatch(/heading "Three" is h4 after h2/);
    expect(problemOf(withBody(`${LINKS}### Low\n`))).toMatch(/heading "Low" is h3 after h1/);
  });

  it('has missing or malformed frontmatter', () => {
    expect(problemOf(withFrontmatter(FRONT.replace(/^title: .*\n/m, '')))).toMatch(/title is missing/);
    expect(problemOf(withFrontmatter(FRONT.replace(/^published: .*$/m, 'published: 2 November')))).toMatch(/published "2 November" is not a date/);
    expect(problemOf(withFrontmatter(FRONT.replace(/^updated: .*$/m, 'updated: 2026-10-01')))).toMatch(/updated 2026-10-01 is before published 2026-11-02/);
    expect(problemOf(withFrontmatter(`${FRONT}\nauthor: Someone`))).toMatch(/author is not a post field/);
    expect(problemOf(withFrontmatter(FRONT.replace(/^criteria: .*$/m, 'criteria: []'), LINKS))).toMatch(/criteria is empty/);
    expect(problemOf(FIXTURE.replace(/^---[\s\S]*?---\n/, ''))).toMatch(/has no frontmatter/);
  });

  it('is named by a slug that is not lowercase words and hyphens', () => {
    expect(() => parsePost(FIXTURE, 'Contrast_Beyond')).toThrow(/slug "Contrast_Beyond"/);
  });

  it('holds raw HTML or an image, which a post cannot define', () => {
    expect(problemOf(withBody(`${LINKS}<div>hi</div>\n`))).toMatch(/raw HTML/);
    expect(problemOf(withBody(`${LINKS}![a chart](chart.png)\n`))).toMatch(/image/);
  });

  it('embeds a criterion that is not in its `criteria`, or does not exist', () => {
    expect(problemOf(withBody(`${LINKS}## Focus\n\n::example{num="2.4.7"}\n`))).toMatch(
      /line \d+: ::example 2\.4\.7 is a criterion its criteria \[1\.4\.3, 1\.4\.11\] do not list/,
    );
    expect(problemOf(withBody(`${LINKS}## Parsing\n\n::example{num="4.1.1"}\n`))).toMatch(/::example 4\.1\.1 is not a WCAG 2\.2 A or AA criterion/);
    expect(problemOf(withBody(`${LINKS}## Lab\n\n::lab{id="fade-text" num="4.1.1"}\n`))).toMatch(/::lab fade-text 4\.1\.1 is not a WCAG 2\.2 A or AA criterion/);
  });

  it('writes an embed without the attributes it takes, or with others', () => {
    expect(problemOf(withBody(`${LINKS}## A\n\n::example\n`))).toMatch(/::example takes num="…", the criterion's number/);
    expect(problemOf(withBody(`${LINKS}## A\n\n::lab{num="1.4.3"}\n`))).toMatch(/::lab takes id="…", the lab's id/);
    expect(problemOf(withBody(`${LINKS}## A\n\n::lab{id="fade-text"}\n`))).toMatch(/::lab takes num="…", the criterion its verdict judges/);
    expect(problemOf(withBody(`${LINKS}## A\n\n::example{num="1.4.3" caption="Mine"}\n`))).toMatch(/::example has caption, which it does not take/);
    expect(problemOf(withBody(`${LINKS}## A\n\n::example[My own]{num="1.4.3"}\n`))).toMatch(/::example has a label \[My own\], which it does not take/);
  });

  it('defines its own example or lab: there is no directive for it', () => {
    expect(problemOf(withBody(`${LINKS}## A\n\n::demo{num="1.4.3"}\n`))).toMatch(/::demo is no embed a post can use \(::example, ::lab\)/);
    expect(problemOf(withBody(`${LINKS}## A\n\n:::example{num="1.4.3"}\nA broken button\n:::\n`))).toMatch(
      /:::example is a block of the post's own content, which a post can't hold: embed an existing example with ::example/,
    );
  });

  it('embeds the same example or lab twice', () => {
    expect(problemOf(withBody(`${LINKS}## A\n\n::example{num="1.4.3"}\n\n::example{num="1.4.3"}\n`))).toMatch(/::example 1\.4\.3 is embedded twice/);
    expect(problemOf(withBody(`${LINKS}## A\n\n::lab{id="fade-text" num="1.4.3"}\n\n::lab{id="fade-text" num="1.4.3"}\n`))).toMatch(/::lab fade-text is embedded twice/);
  });

  it('embeds before its first heading, where the embed would skip a heading level', () => {
    expect(problemOf(withBody(`${LINKS}::example{num="1.4.3"}\n`))).toMatch(/::example 1\.4\.3 comes before the first heading: put it under an h2/);
  });

  it('says which post and line is wrong', () => {
    expect(problemOf(withBody(`${LINKS}See [focus](/criteria/2.4.7/).\n`))).toMatch(/^post fixture-contrast-thresholds: .*line \d+/);
  });
});
