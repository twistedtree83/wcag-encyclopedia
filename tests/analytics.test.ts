import { describe, it, expect, vi } from 'vitest';

/**
 * Cloudflare Web Analytics (docs/PRD-seo.md, S-06). The beacon is off while
 * `CF_ANALYTICS_TOKEN` in src/site/config.ts is unset; set, every page loads it once, `defer`,
 * with that token. The beacon sets no cookie, so the site adds no consent banner.
 *
 * The committed config leaves the token unset, so the set case mocks the config. The unset
 * case on the built pages is checked by e2e/analytics.spec.ts.
 */

const TOKEN = 'a1b2c3d4e5f6';

vi.mock('../src/site/config', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/site/config')>()),
  CF_ANALYTICS_TOKEN: 'a1b2c3d4e5f6',
}));

const { render, ROUTES } = await import('../src/entry-server');
const { analyticsBeacon } = await import('../src/site/analytics');

const BEACON =
  /<script defer src="https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js" data-cf-beacon="\{&quot;token&quot;:&quot;([^&"]+)&quot;\}"><\/script>/g;

describe('the analytics beacon', () => {
  it('is nothing while the token is unset', () => {
    expect(analyticsBeacon(undefined)).toBe('');
  });

  it(
    'is one deferred beacon tag carrying the token on every page when the token is set',
    () => {
      for (const route of ROUTES) {
        const { beacon, html, head } = render(route);
        const tags = [...beacon.matchAll(BEACON)];
        expect(tags.map((m) => m[1]), `/${route.path}`).toEqual([TOKEN]);
        expect(beacon.match(/<script/g), `/${route.path}`).toHaveLength(1);
        expect(html + head, `/${route.path}`).not.toContain('cloudflareinsights');
      }
    },
    30_000,
  );

  it('escapes a token so it cannot break out of the attribute', () => {
    expect(analyticsBeacon('x"><script>')).not.toContain('"><script>');
  });
});
