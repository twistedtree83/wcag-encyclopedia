import { parsePost } from '../src/blog/parse';
import type { Post, PostNode } from '../src/blog/post';
import { EXPECTED } from '../src/criteria/manifest';

/**
 * The writing test's rules (S-10, ADR 0007), as data. `docs/WRITING.md` is the standard and
 * gives the reason for each; `tests/writing.test.ts` runs them over every post and every test
 * procedure and common question.
 *
 * Adding a banned phrase or pattern is one entry in `RULES`, with the reason and an example
 * sentence that fails it, and a line in WRITING.md under the same name. The test then runs it
 * over every existing post, so a new rule can fail an old one.
 */

export type Problem = { readonly rule: string; readonly detail: string };

export type Rule = {
  readonly id: string;
  /** How WRITING.md names it, word for word. */
  readonly name: string;
  readonly reason: string;
  /** A sentence that must fail the rule. */
  readonly example: string;
  /** The offending text in one paragraph, if any. */
  readonly find: (paragraph: string) => string[];
};

/** Posts are 900 to 2,500 words, code left out. */
export const WORDS = { min: 900, max: 2500 } as const;

/**
 * Where a source may come from: W3C and other standards bodies, legal texts and regulators,
 * and browser and assistive-technology vendors' own documentation. A subdomain counts.
 */
export const SOURCE_DOMAINS = [
  // Standards
  'w3.org',
  'whatwg.org',
  'etsi.org',
  // Law and regulators
  'europa.eu',
  'gov.uk',
  'ada.gov',
  'access-board.gov',
  'section508.gov',
  'ecfr.gov',
  'federalregister.gov',
  'justice.gc.ca',
  'canada.ca',
  // Browser and assistive-technology vendors
  'mozilla.org',
  'apple.com',
  'microsoft.com',
  'chromium.org',
  'chrome.com',
  'webkit.org',
  'support.google.com',
  'developer.android.com',
  'nvaccess.org',
  'freedomscientific.com',
] as const;

const all = (pattern: RegExp) => (text: string) => [...text.matchAll(pattern)].map((m) => m[0]);

const phrase = (id: string, name: string, pattern: RegExp, reason: string, example: string): Rule => ({
  id,
  name,
  reason,
  example,
  find: all(new RegExp(pattern.source, 'gi')),
});

/** Common adjectives the suffix test below misses. */
const ADJECTIVES = new Set(
  (
    'fast quick simple easy clear clean modern smart new bold rich safe secure strong fair open free plain sleek slick friendly ' +
    'elegant efficient consistent relevant compliant transparent intelligent innovative inclusive accessible reliable ' +
    'scalable flexible powerful intuitive beautiful seamless robust usable'
  ).split(' '),
);
const ADJECTIVE_ENDING = /(?:ive|ous|ful|less|able|ible|ic|al|ary|ish)$/;
const adjective = (word: string) => ADJECTIVES.has(word.toLowerCase()) || ADJECTIVE_ENDING.test(word.toLowerCase());

export const RULES: readonly Rule[] = [
  phrase(
    'delve',
    '"delve"',
    /\bdelv(?:e|es|ed|ing)\b/,
    'A word almost no one uses in speech. It marks text as generated and says nothing "look at" or "explain" does not.',
    'This post will delve into focus order.',
  ),
  phrase(
    'todays-landscape',
    '"in today\'s digital landscape"',
    /\bin today['’]s (?:digital )?(?:landscape|world|age|era)\b/,
    'An opening that could start any article on any subject. Start with the fact the reader came for.',
    "In today's digital landscape, contrast matters.",
  ),
  phrase(
    'important-to-note',
    '"it\'s important to note"',
    /\bit(?:['’]s| is) (?:important|worth|crucial|essential) (?:to note|noting|to remember)\b/,
    'It announces a point instead of making it. If it matters, say it; the reader can tell it is important.',
    "It's important to note that 1.4.3 covers images of text.",
  ),
  phrase(
    'not-just-but',
    '"not just X, but Y"',
    /\bnot (?:just|only|merely|simply)\b[^.!?;:]{1,80}?\bbut\b/,
    'A sales construction that inflates the second half. Say the thing it does.',
    'Contrast helps not just people with low vision, but everyone outdoors.',
  ),
  phrase(
    'not-x-its-y',
    '"it\'s not X, it\'s Y"',
    /\b(?:it|this|that)(?:['’]s not| is not| isn['’]t)\b[^.!?]{1,60}?[,;—–]\s*(?:it|this|that)(?:['’]s| is)\b/,
    'It argues with a claim nobody made in order to sound decisive. State what is true.',
    "It's not about colour, it's about contrast.",
  ),
  phrase(
    'navigate-complexities',
    '"navigate the complexities"',
    /\bnavigat(?:e|es|ed|ing) the (?:complexities|complexity|intricacies|maze)\b/,
    'Filler that makes a subject sound harder than it is. Name the part that is hard.',
    'Teams must navigate the complexities of the law.',
  ),
  phrase(
    'unlock',
    '"unlock"',
    /\bunlock(?:s|ed|ing)?\b/,
    'Marketing for "allow" or "make possible". Say what becomes possible, and for whom.',
    'Good labels unlock a better form.',
  ),
  phrase(
    'seamless',
    '"seamless"',
    /\bseamless(?:ly)?\b/,
    'A claim no reader can check. Describe what works and how you know.',
    'Keyboard users get a seamless experience.',
  ),
  {
    id: 'robust',
    name: '"robust" (outside principle 4, Robust)',
    reason: 'Vague praise, and confusing on a site where Robust is the name of principle 4. Use it only as that name.',
    example: 'Use robust markup for every control.',
    find: (text) =>
      [...text.matchAll(/\brobust(?:ly|ness)?\b/gi)]
        .filter(
          (m) => m[0] !== 'Robust' || !/\bprinciple\b|\b4(?:\.x)?\b/i.test(text.slice(Math.max(0, m.index - 30), m.index + 40)),
        )
        .map((m) => m[0]),
  },
  phrase(
    'game-changer',
    '"game-changer"',
    /\bgame[- ]?chang(?:er|ers|ing)\b/,
    'Hype. No criterion changes a game; say what changes for the reader.',
    'Focus Appearance is a game-changer.',
  ),
  phrase(
    'in-conclusion',
    '"in conclusion"',
    /\bin (?:conclusion|summary)\b/,
    'A school-essay signpost. The last section is the conclusion; let its heading say what it holds.',
    'In conclusion, test with a keyboard.',
  ),
  phrase(
    'ever-evolving',
    '"ever-evolving"',
    /\bever[- ](?:evolving|changing|growing)\b/,
    'Filler that dates nothing. Give the version or the date that changed.',
    'Accessibility is an ever-evolving field.',
  ),
  phrase(
    'leverage',
    '"leverage"',
    /\bleverag(?:e|es|ed|ing)\b/,
    'Business jargon for "use".',
    'Leverage ARIA to name the button.',
  ),
  phrase(
    'empower',
    '"empower"',
    /\bempower(?:s|ed|ing|ment)?\b/,
    'It promises a feeling instead of naming what a person can now do.',
    'Captions empower deaf viewers.',
  ),
  phrase(
    'realm',
    '"realm"',
    /\brealms?\b/,
    'Grand wording for "area" or "subject", or for nothing at all.',
    'In the realm of forms, labels come first.',
  ),
  phrase(
    'tapestry',
    '"tapestry"',
    /\btapestr(?:y|ies)\b/,
    'A metaphor that stands in for the actual list of things.',
    'A rich tapestry of assistive technology.',
  ),
  phrase(
    'testament',
    '"a testament to"',
    /\b(?:a |is )testament to\b/,
    'Praise in place of evidence.',
    'The new criteria are a testament to progress.',
  ),
  phrase(
    'crucial-role',
    '"plays a crucial role"',
    /\bplays? an? (?:crucial|vital|key|pivotal|important) role\b/,
    'It says something matters without saying what it does. Say what it does.',
    'Contrast plays a crucial role in reading.',
  ),
  {
    id: 'em-dashes',
    name: 'more than one em dash in a paragraph',
    reason:
      'A run of dashes reads as breathless and hides the structure of the sentence. Use one, or a comma, a colon or a new sentence.',
    example: 'The ratio — 4.5 : 1 for body text — is the same everywhere.',
    find: (text) => {
      const dashes = text.match(/—/g) ?? [];
      return dashes.length > 1 ? [`${dashes.length} em dashes`] : [];
    },
  },
  {
    id: 'adjective-triplet',
    name: 'three-item lists of adjectives',
    reason:
      'Three adjectives in a row ("fast, simple and accessible") is rhythm, not information. Keep the one you can show, and show it.',
    example: 'The new form is fast, simple and accessible.',
    find: (text) =>
      [...text.matchAll(/\b([A-Za-z-]+), ([A-Za-z-]+),? (?:and|or) ([A-Za-z-]+)\b/g)]
        .filter((m) => [m[1]!, m[2]!, m[3]!].every(adjective))
        .map((m) => m[0]),
  },
];

/** The problems in a piece of prose, each paragraph (split on a blank line) checked on its own. */
export function proseProblems(text: string): Problem[] {
  return text.split(/\n\s*\n/).flatMap((paragraph) =>
    RULES.flatMap((rule) =>
      rule.find(paragraph).map((found) => ({
        rule: rule.id,
        detail: `"${found}" in "${paragraph.trim().slice(0, 80)}"`,
      })),
    ),
  );
}

const BLOCKS = new Set(['p', 'li', 'blockquote', 'h2', 'h3', 'h4', 'h5', 'h6']);
const NESTED = new Set([...BLOCKS, 'ul', 'ol', 'pre', 'hr']);

/** A post body as its paragraphs of prose: each block's own text, code left out. */
function paragraphs(nodes: readonly PostNode[], out: string[] = []): string[] {
  for (const node of nodes) {
    if (typeof node === 'string') out.push(node);
    else if (BLOCKS.has(node.tag)) {
      const text: string[] = [];
      inline(node.children, text, out);
      out.push(text.join(''));
    } else if (node.tag !== 'pre') paragraphs(node.children ?? [], out);
  }
  return out.filter((p) => p.trim());
}

function inline(nodes: readonly PostNode[], text: string[], out: string[]) {
  for (const node of nodes) {
    if (typeof node === 'string') text.push(node);
    else if (node.tag === 'code' || node.tag === 'br') text.push(' ');
    else if (NESTED.has(node.tag)) paragraphs([node], out);
    else inline(node.children ?? [], text, out);
  }
}

const textOf = (node: PostNode): string =>
  typeof node === 'string' ? node : node.tag === 'code' ? '' : (node.children ?? []).map(textOf).join('');

const links = (nodes: readonly PostNode[]): { text: string; to: string | undefined; href: string | undefined }[] =>
  nodes.flatMap((n) =>
    typeof n === 'string' ? [] : n.tag === 'a' ? [{ text: textOf(n), to: n.to, href: n.href }] : links(n.children ?? []),
  );

/**
 * The criteria the body's embeds (`::example`, `::lab`, S-08) show. An embed links its criterion
 * page, named by number and name, so it counts as a criterion link here as the parser counts it.
 * It adds no prose: its text is the criterion page's, not the post's.
 */
const embedded = (nodes: readonly PostNode[]): string[] =>
  nodes.flatMap((n) =>
    typeof n === 'string' ? [] : n.tag === 'example' || n.tag === 'lab' ? [n.num ?? ''] : embedded(n.children ?? []),
  );

const NAMES = new Map(EXPECTED.map((c) => [c.num, c.name]));

const allowedSource = (href: string | undefined) => {
  try {
    const { protocol, hostname } = new URL(href ?? '');
    return /^https?:$/.test(protocol) && SOURCE_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`));
  } catch {
    return false;
  }
};

/** The `## Sources` section: every node after its heading, up to the next h2. */
function sources(body: readonly PostNode[]): readonly PostNode[] | undefined {
  const at = body.findIndex((n) => typeof n !== 'string' && n.tag === 'h2' && textOf(n).trim() === 'Sources');
  if (at < 0) return undefined;
  const end = body.findIndex((n, i) => i > at && typeof n !== 'string' && n.tag === 'h2');
  return body.slice(at + 1, end < 0 ? undefined : end);
}

/** A parse error's line as a writing problem: the criterion-link ones, and the rest. */
const parseProblem = (line: string): Problem => ({
  rule: /criteria is empty|never links its page/.test(line)
    ? 'criterion-link'
    : /: line \d+:/.test(line)
      ? 'markdown'
      : 'frontmatter',
  detail: line,
});

/** Every way a post file falls short of docs/WRITING.md. */
export function postProblems(source: string, slug: string): Problem[] {
  let post: Post;
  try {
    post = parsePost(source, slug);
  } catch (e) {
    return (e as Error).message.split('\n').map(parseProblem);
  }

  const problems: Problem[] = [];
  const add = (rule: string, detail: string) => problems.push({ rule, detail });
  const prose = paragraphs(post.body);

  for (const text of [post.title, post.description, ...prose]) problems.push(...proseProblems(text));

  const body = links(post.body);
  const criterionLinks = body.flatMap((l) => {
    const num = /^criteria\/([\d.]+)\/$/.exec(l.to ?? '')?.[1];
    return num ? [{ ...l, num }] : [];
  });
  if (!criterionLinks.length && !embedded(post.body).length) add('criterion-link', 'links no criterion page');
  for (const l of criterionLinks)
    if (!l.text.includes(l.num) && !l.text.includes(NAMES.get(l.num) ?? '\0'))
      add(
        'criterion-name',
        `links /criteria/${l.num}/ as "${l.text}": name it by its number or its name, "${l.num} ${NAMES.get(l.num)}"`,
      );

  const listed = sources(post.body);
  if (!listed) add('sources', 'has no "## Sources" section');
  else {
    const cited = links(listed);
    if (!cited.some((l) => allowedSource(l.href))) add('sources', `lists no source on ${SOURCE_DOMAINS.join(', ')}`);
    for (const l of cited)
      if (!allowedSource(l.href)) add('sources', `source "${l.text}" (${l.href ?? `/${l.to}`}) is not on an allowed domain`);
  }

  const words = prose.join(' ').match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu)?.length ?? 0;
  if (words < WORDS.min || words > WORDS.max) add('length', `is ${words} words: a post is ${WORDS.min}–${WORDS.max}`);

  return problems;
}

/**
 * The prose of a criterion record's test procedure and common questions (CONTEXT.md), in
 * order: every string in its `procedure` and `questions`, whatever shape they take. A React
 * element is read through its children only.
 */
export function recordProse(record: object): string[] {
  const out: string[] = [];
  const walk = (value: unknown): void => {
    if (typeof value === 'string') out.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') {
      if ('$$typeof' in value) walk((value as { props?: { children?: unknown } }).props?.children);
      else Object.values(value).forEach(walk);
    }
  };
  const { procedure, questions } = record as {
    procedure?: unknown;
    questions?: unknown;
  };
  walk(procedure);
  walk(questions);
  return out;
}
