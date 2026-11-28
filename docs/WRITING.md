# Writing

The standard for every post (`src/blog/posts/<slug>.md`), every test procedure and every common
question (CONTEXT.md). ADR 0007 says why it exists. The copy rules in
`design/new-design/DESIGN-GUIDE.md` §11 apply too: plain language, British spelling, sentence
case, numbers with their unit, and "Name it the first time".

Two checks hold it. The **writing test**, `tests/writing.test.ts` with its rules in
`tests/writing.ts`, runs in `npm run verify` and fails a post for anything below marked
_(tested)_. The owner's **review** of the pull request covers the rest. Nothing publishes
without that review.

Run the test alone while drafting:

```sh
npx vitest run tests/writing.test.ts
```

Each failure names the rule, the post and the text that broke it. The post's own build checks
(frontmatter, links, headings, what a body may hold) are in `docs/CONVENTIONS.md`, "Blog posts";
the writing test reports those too.

## Voice

- Write to one practitioner who has a page in front of them and a criterion to meet. Say what
  goes wrong, then what to do, then how to check it.
- Plain and specific. Every sentence carries a fact, a step or an example. Cut sentences that
  only announce the next one.
- Short sentences, active voice, "you" for the reader. No "we" for the site.
- Claim only what you can show or source. No hype, no promises, no feelings on the reader's
  behalf.
- No byline, and nothing about how the post was written. The site, "WCAG Encyclopedia", is the
  author.
- Restate, never reproduce: no WCAG normative text copied across. Quote a source only where its
  exact words matter (a legal text, say), briefly, in quotation marks, with the source named.

## Banned constructions _(tested)_

Each is matched in any case, in the title, the description and every paragraph of the body,
and in every test procedure and common question. Code is not read.

| Construction | Why |
| --- | --- |
| "delve" | A word almost no one uses in speech. It marks text as generated and says nothing "look at" or "explain" does not. |
| "in today's digital landscape" | An opening that could start any article on any subject (also "in today's world", "age", "era"). Start with the fact the reader came for. |
| "it's important to note" | It announces a point instead of making it (also "it's worth noting", "it is crucial to remember"). If it matters, say it. |
| "not just X, but Y" | A sales construction that inflates the second half (also "not only … but"). Say the thing it does. |
| "it's not X, it's Y" | It argues with a claim nobody made in order to sound decisive (also "this isn't X, it's Y"). State what is true. |
| "navigate the complexities" | Filler that makes a subject sound harder than it is (also "intricacies", "maze"). Name the part that is hard. |
| "unlock" | Marketing for "allow" or "make possible". Say what becomes possible, and for whom. |
| "seamless" | A claim no reader can check. Describe what works and how you know. |
| "robust" (outside principle 4, Robust) | Vague praise, and confusing on a site where Robust is the name of principle 4. Use it only as that name, capitalised, next to "principle" or "4". |
| "game-changer" | Hype. No criterion changes a game; say what changes for the reader. |
| "in conclusion" | A school-essay signpost (also "in summary"). The last section is the conclusion; let its heading say what it holds. |
| "ever-evolving" | Filler that dates nothing (also "ever-changing"). Give the version or the date that changed. |
| "leverage" | Business jargon for "use". |
| "empower" | It promises a feeling instead of naming what a person can now do. |
| "realm" | Grand wording for "area" or "subject", or for nothing at all. |
| "tapestry" | A metaphor that stands in for the actual list of things. |
| "a testament to" | Praise in place of evidence. |
| "plays a crucial role" | It says something matters without saying what it does (also "vital", "key", "pivotal" role). Say what it does. |
| more than one em dash in a paragraph | A run of dashes reads as breathless and hides the structure of the sentence. Use one, or a comma, a colon or a new sentence. |
| three-item lists of adjectives | "Fast, simple and accessible" is rhythm, not information. Keep the one you can show, and show it. A list of nouns ("borders, icons and focus rings") is fine. |

The adjective check is a heuristic: it treats a word as an adjective when it is on a short list
or ends like one (-ive, -ous, -ful, -less, -able, -ible, -ic, -al, -ary, -ish). If it flags a
list that is not adjectives, reword it anyway; a list of three that reads like adjectives reads
like this rule's target to a person too.

A new rule is one entry in `RULES` in `tests/writing.ts`, with its reason and an example sentence
that must fail it, and a row here under the same name. The test checks both. It then runs over
every existing post, so a new rule can fail an old post: fix the post in the same change.

## Substance

A post covers what no single criterion page does: a topic that spans criteria, a change between
WCAG versions, the law, or a way of testing. It never restates a criterion page; it links to it.
Every post carries:

- **The criteria it discusses**, each linked to its page _(tested)_, and listed in `criteria`
  in the frontmatter (the build fails on a mismatch either way). The list also puts the post,
  with its `description`, under "Further reading" on each of those criterion pages.
- **A concrete example**: a criterion's own example or lab shown in the post, or a worked case
  with real values (a colour pair and its ratio, a field and its label). Review.
- **Sources**, in a section headed `## Sources` _(tested)_. See below.
- **Frontmatter** with every required field _(tested)_: `title` (30–65 characters),
  `description` (70–160), `published`, `updated` when it changes, `criteria`.

A test procedure is an ordered list of steps a reader can follow with a browser and, where it
needs one, a named free tool. Each step is one action and what to look for. A common question
is one a reader would type into a search box, and its answer starts with the answer ("Yes, …",
"No, …", "Only when …") before the reason.

## Sources _(tested)_

Primary sources only, each one fetched and read while drafting. A post lists them under
`## Sources`, one link each, written in full (`https://…`), with the publisher after the link:

```md
## Sources

- [Understanding Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), W3C
```

The test fails a post with no `## Sources` section, with no source on an allowed domain, or
with any source off them. The allowed domains are `SOURCE_DOMAINS` in `tests/writing.ts`, and
any subdomain of one:

- **Standards**: W3C (WCAG, Understanding, Techniques, ARIA), WHATWG, ETSI (EN 301 549).
- **Law and regulators**: EU law and the Commission (`europa.eu`), UK legislation and
  guidance (`gov.uk`), the US Department of Justice, Access Board, Section 508, eCFR and
  Federal Register, and Canada's federal law and guidance.
- **Browser and assistive-technology vendors**: Mozilla (MDN), Apple, Microsoft, Chromium and
  Chrome, WebKit, Google's Android and support documentation, NV Access (NVDA), Freedom
  Scientific (JAWS).

A new primary source is one line in `SOURCE_DOMAINS`, reviewed with the post that needs it.
No statistic without a primary source next to it. No blog, vendor marketing page, overlay
company or secondary summary, however good.

## Length _(tested)_

A post is **900 to 2,500 words**, counting its prose and leaving out code. Under 900 rarely
covers a topic no criterion page does; over 2,500 is two posts. Test procedures and common
questions have no word count, but an answer longer than a short paragraph is a post.

## Naming a criterion

- The first time a post names a criterion, give its number and its name, as WCAG writes the
  name, and link it to its page: `[1.4.3 Contrast (Minimum)](/criteria/1.4.3/)`.
- The link text of every criterion link holds its number or its exact name _(tested)_, so the
  reader knows where it goes. "This criterion" or "the contrast rule" is not a link text.
- After the first mention, the number alone ("1.4.3") or the name alone is enough.
- Give the level when it matters to the point: "1.4.3 Contrast (Minimum), Level AA".
- A principle is named by its number and name: "principle 4, Robust". A guideline by its
  number and name: "guideline 1.4, Distinguishable".
- Say "success criterion" only where it is needed to be exact (in a legal context, say);
  "criterion" otherwise.
