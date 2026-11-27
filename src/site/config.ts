/**
 * Site-wide settings that are not routes.
 */

/**
 * Where readers report a problem with the site. The About page's accessibility statement and
 * the footer link here, as "Report a problem with this site".
 *
 * Unset until the form exists: while it is undefined, neither link is shown. Set it to the
 * form's full https:// address and both links appear.
 */
export const FEEDBACK_FORM_URL: string | undefined = undefined;

/**
 * The production origin: bare domain, HTTPS, no trailing slash (ADR 0006). The only absolute
 * address in the source. The canonical tag, robots.txt and sitemap.xml join it to a route's
 * path (`src/site/crawl.ts`); every link between pages stays relative.
 */
export const SITE_ORIGIN = 'https://wcagencyclopedia.com';

/**
 * The site's Cloudflare Web Analytics token (Cloudflare → Analytics & Logs → Web Analytics).
 * The beacon is cookieless, so the site shows no consent banner.
 *
 * Unset until the site is created there: while it is undefined, no page loads the beacon. Set
 * it and every page loads it once, `defer`, at the end of `<body>` (src/site/analytics.ts).
 */
export const CF_ANALYTICS_TOKEN: string | undefined = undefined;
