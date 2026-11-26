# 0005: Host on Cloudflare Workers, deployed only through the gate

The site moves from GitHub Pages to Cloudflare Workers static assets at wcagencyclopedia.com.
The domain is registered at Cloudflare, so DNS, HTTPS and hosting live in one place: attaching
the custom domains in `wrangler.jsonc` creates their DNS records and certificates.

Deploys still go through `.github/workflows/deploy.yml`: `npm run verify` first, then
`wrangler deploy`. Cloudflare never builds the site itself, so a build whose accessibility scan
fails cannot be published (the same rule the Pages workflow kept). The Worker
(`worker/index.js`) only redirects `www` to the bare domain; every page is a static asset, and
`auto-trailing-slash` serves `/criteria/1.4.3` and `/criteria/1.4.3/` the same page.

The relative base from ADR 0001 is unchanged and works at the domain root.
