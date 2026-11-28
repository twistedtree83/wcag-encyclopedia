import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parsePost } from '../src/blog/parse';
import type { Route } from '../src/site/routes';

/**
 * The fixture post (S-07): one post that exists only in the tests, in tests/fixtures/posts/.
 * The built site has no post until the launch posts land, so the post page is tested on this.
 */

export const FIXTURE_SLUG = 'fixture-contrast-thresholds';
export const FIXTURE = readFileSync(join(__dirname, 'fixtures/posts', `${FIXTURE_SLUG}.md`), 'utf8');
export const fixturePost = () => parsePost(FIXTURE, FIXTURE_SLUG);
export const FIXTURE_ROUTE: Route = { path: `blog/${FIXTURE_SLUG}/`, page: 'post', slug: FIXTURE_SLUG };
