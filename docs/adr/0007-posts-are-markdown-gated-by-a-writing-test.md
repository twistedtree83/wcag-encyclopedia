# 0007: Posts are Markdown, held to a writing standard by a test and by review

Blog posts are Markdown files with frontmatter in `src/blog/posts/<slug>.md`, rendered to
static HTML at build time like every other page (ADR 0001). No Markdown code ships to the
browser. A post can show a criterion's existing examples or labs through a directive that names
the criterion. It can't define new interface: a new interactive piece goes through the lab
workflow (ADR 0004) first.

Posts are drafted in a session, one ticket each, and land as a pull request that the owner
approves before merge. Nothing publishes itself. Two checks hold the quality:

1. **`docs/WRITING.md`**, the standard: voice, the constructions that are banned, the substance
   a post must carry (sources, criteria links, a concrete example), and the length range.
2. **A unit test in the verify gate** that fails a post (and any test procedure or common
   question) for a banned phrase or pattern, for missing or malformed frontmatter, for linking
   no criterion page, for having no primary source, or for falling outside the length range.

Posts carry no byline and say nothing about how they were written. Structured data names the
organisation, "WCAG Encyclopedia", as author and publisher.

## Considered options

- **Posts as TypeScript records, like criterion records.** Rejected. Posts are long prose, and
  prose reads, diffs and reviews best as Markdown.
- **A scheduled routine that writes and merges posts.** Rejected for now. Unreviewed generated
  content at scale is what search spam policies target. It can be revisited once the first posts
  show the standard holds, but the merge stays human.
- **A headless CMS.** Rejected. It adds a runtime dependency and an account, and the site has
  no server-side rendering to feed.

## Consequences

- A slug never changes once a post is published: it is the post's URL.
- The banned-phrase list is data in the test. Adding a phrase is one line, and the test runs
  over every existing post, so a new rule can fail an old post.
