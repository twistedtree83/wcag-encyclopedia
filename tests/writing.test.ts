import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { CORPUS, criteriaInPrinciple } from '../src/criteria/corpus';
import { RULES, postProblems, proseProblems, recordProse, WORDS } from './writing';

/**
 * The writing test (S-10, ADR 0007): every post in src/blog/posts/, and every test procedure
 * and common question on a criterion record, held to docs/WRITING.md. The rules are data in
 * tests/writing.ts; each one carries an example sentence that must fail it.
 */

const POSTS_DIR = join(__dirname, '../src/blog/posts');
const WRITING = readFileSync(join(__dirname, '../docs/WRITING.md'), 'utf8');

/** A clean paragraph of about 60 words, with no rule in it. */
const FILLER =
  'A field border that is too pale is hard to find for anyone with low vision. Measure the ' +
  'border colour against the background next to it, and compare the ratio with 3 : 1, the ' +
  'contrast a control needs. A ratio below that fails, whatever the colour of the text inside ' +
  'the field, because the reader has to see the edge first.';

const SOURCES =
  '## Sources\n\n' +
  '- [Understanding Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), W3C\n';

const FRONT = [
  'title: Two contrast thresholds, for text and for everything else',
  'description: How the contrast of text and of borders, icons and focus rings is measured the same way but held to different thresholds.',
  'published: 2026-11-02',
  'criteria: [1.4.11]',
].join('\n');

/** A post that meets the standard: about 1,000 words, one criterion linked, one W3C source. */
const post = ({ front = FRONT, intro = '', paragraphs = 16, sources = SOURCES } = {}) =>
  `---\n${front}\n---\n\n` +
  `${intro}\n\n` +
  '[1.4.11 Non-text Contrast](/criteria/1.4.11/) holds the parts of a control to their own threshold.\n\n' +
  '## Measuring a border\n\n' +
  Array.from({ length: paragraphs }, () => FILLER).join('\n\n') +
  '\n\n' +
  sources;

const rulesOf = (source: string) => postProblems(source, 'sample-post').map((p) => p.rule);

describe('the writing rules', () => {
  it('pass a post that meets the standard', () => {
    expect(postProblems(post(), 'sample-post')).toEqual([]);
  });

  it.each(RULES.map((r) => [r.id, r] as const))('fail the example for %s', (_, rule) => {
    expect(proseProblems(rule.example).map((p) => p.rule)).toContain(rule.id);
    expect(rulesOf(post({ intro: rule.example }))).toContain(rule.id);
  });

  it.each(RULES.map((r) => [r.id, r] as const))('give a reason for %s, and WRITING.md names it', (_, rule) => {
    expect(rule.reason.length).toBeGreaterThan(20);
    expect(WRITING).toContain(rule.name);
  });

  it('allow Robust as the name of principle 4', () => {
    expect(proseProblems('Principle 4, Robust, asks that code parse the same way in every browser.')).toEqual([]);
    expect(proseProblems('The Robust principle has two criteria at Level A and AA.')).toEqual([]);
    expect(proseProblems('Write robust markup.').map((p) => p.rule)).toEqual(['robust']);
  });

  it('fail two em dashes in a paragraph, and allow one in each of two paragraphs', () => {
    expect(proseProblems('The ratio — 4.5 : 1 for body text — is the same everywhere.').map((p) => p.rule)).toEqual([
      'em-dashes',
    ]);
    expect(proseProblems('One aside — here.\n\nAnother aside — there.')).toEqual([]);
  });

  it('allow a three-item list of nouns', () => {
    expect(proseProblems('Check the colour, size and position of the focus ring.')).toEqual([]);
    expect(proseProblems('Borders, icons and focus rings need 3 : 1.')).toEqual([]);
  });

  it('do not read code', () => {
    expect(rulesOf(post({ intro: 'Set `--seamless: robust` in the stylesheet.' }))).toEqual([]);
  });

  it('read the title and description', () => {
    const front = FRONT.replace(/^title: .*$/m, 'title: Unlock contrast for borders, icons and focus rings');
    expect(rulesOf(post({ front }))).toContain('unlock');
  });
});

describe('a post', () => {
  it('fails without frontmatter', () => {
    expect(rulesOf(post().replace(/^---[\s\S]*?---\n/, ''))).toContain('frontmatter');
  });

  it('fails with a frontmatter field missing', () => {
    expect(rulesOf(post({ front: FRONT.replace(/^published: .*\n/m, '') }))).toContain('frontmatter');
  });

  it('fails when it links no criterion page', () => {
    const source = post({
      front: FRONT.replace(/^criteria: .*$/m, 'criteria: []'),
    }).replace('(/criteria/1.4.11/)', '(/criteria/)');
    expect(rulesOf(source)).toContain('criterion-link');
  });

  it('counts an embed as a criterion link, as the parser does, and adds no prose for it', () => {
    const embedOnly = post()
      .replace('[1.4.11 Non-text Contrast](/criteria/1.4.11/) holds', 'A control is held')
      .replace('## Measuring a border\n\n', '## Measuring a border\n\n::example{num="1.4.11"}\n\n');
    expect(embedOnly).not.toContain('(/criteria/');
    expect(rulesOf(embedOnly)).toEqual([]);
    const withLab = post().replace('## Measuring a border\n\n', '## Measuring a border\n\n::lab{id="non-text-contrast" num="1.4.11"}\n\n');
    expect(rulesOf(withLab)).toEqual([]);
  });

  it('fails when a criterion link does not name the criterion', () => {
    expect(rulesOf(post().replace('[1.4.11 Non-text Contrast]', '[the border rule]'))).toContain('criterion-name');
  });

  it('fails with no Sources section', () => {
    expect(rulesOf(post({ sources: '' }))).toContain('sources');
  });

  it('fails when no source is on an allowed domain', () => {
    const sources = '## Sources\n\n- [A blog about contrast](https://example.com/contrast/)\n';
    expect(rulesOf(post({ sources }))).toContain('sources');
  });

  it('fails when a source is off the allowed domains', () => {
    const sources = `${SOURCES}- [A blog about contrast](https://example.com/contrast/)\n`;
    expect(rulesOf(post({ sources }))).toContain('sources');
  });

  it('accepts a source on a subdomain of an allowed domain', () => {
    const sources = `${SOURCES}- [The European Accessibility Act](https://eur-lex.europa.eu/eli/dir/2019/882/oj), EUR-Lex\n`;
    expect(rulesOf(post({ sources }))).toEqual([]);
  });

  it(`fails under ${WORDS.min} words and over ${WORDS.max}`, () => {
    expect(rulesOf(post({ paragraphs: 10 }))).toContain('length');
    expect(rulesOf(post({ paragraphs: 45 }))).toContain('length');
  });
});

describe('every post', () => {
  const files = existsSync(POSTS_DIR) ? readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md')) : [];
  it.each(files.length ? files : ['(no posts yet)'])('%s meets docs/WRITING.md', (file) => {
    if (!files.length) return;
    const problems = postProblems(readFileSync(join(POSTS_DIR, file), 'utf8'), file.replace(/\.md$/, ''));
    expect(problems.map((p) => `${p.rule}: ${p.detail}`)).toEqual([]);
  });
});

describe('every test procedure and common question', () => {
  it('reads the procedure and questions of a record, whatever their shape', () => {
    const record = {
      num: '9.9.9',
      procedure: ['Open the page.', 'Tab to the field.'],
      questions: [{ q: 'Is it?', a: 'It is.' }],
    };
    expect(recordProse(record)).toEqual(['Open the page.', 'Tab to the field.', 'Is it?', 'It is.']);
  });

  it.each(['4.1.2', '4.1.3'])('reach the test procedure and common questions of %s', (num) => {
    const record = CORPUS.find((r) => r.num === num)!;
    expect(record.procedure?.length).toBeGreaterThanOrEqual(3);
    expect(record.questions?.length).toBeGreaterThanOrEqual(1);
    const rules = (r: object) => recordProse(r).flatMap((text) => proseProblems(text).map((p) => p.rule));
    expect(rules(record)).toEqual([]);
    const step = { ...record, procedure: [...record.procedure!, 'Check the toggle is seamless.'] };
    expect(rules(step)).toEqual(['seamless']);
    const [first, ...rest] = record.questions!;
    const answer = { ...record, questions: [{ ...first!, answer: `${first!.answer} Delve into it.` }, ...rest] };
    expect(rules(answer)).toEqual(['delve']);
    const question = { ...record, questions: [{ ...first!, question: 'Can I leverage ARIA?' }, ...rest] };
    expect(rules(question)).toEqual(['leverage']);
  });

  // S-18: every Perceivable criterion carries both, at the minimum S-21 will require of all.
  it.each(criteriaInPrinciple(1).map((r) => [r.num, r] as const))(
    '%s (principle 1, Perceivable) has at least 3 distinct steps and 1 question',
    (_, record) => {
      const steps = record.procedure ?? [];
      const questions = (record.questions ?? []).map((q) => q.question);
      expect(steps.length).toBeGreaterThanOrEqual(3);
      expect(questions.length).toBeGreaterThanOrEqual(1);
      expect(new Set(steps).size).toBe(steps.length);
      expect(new Set(questions).size).toBe(questions.length);
    },
  );

  it.each(CORPUS.map((r) => [r.num, r] as const))('%s meets docs/WRITING.md', (_, record) => {
    const problems = recordProse(record).flatMap((text) => proseProblems(text));
    expect(problems.map((p) => `${p.rule}: ${p.detail}`)).toEqual([]);
  });
});
