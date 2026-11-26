/**
 * The site's Worker on Cloudflare. Static pages come from dist/ (the assets binding); the only
 * code is the redirect from www to the bare domain, so every page has one address.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === 'www.wcagencyclopedia.com') {
      url.hostname = 'wcagencyclopedia.com';
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
