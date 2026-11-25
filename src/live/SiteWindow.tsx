import { useLayoutEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import {
  SEARCH_PAGE,
  SITE_MAP_PAGE,
  menuOn,
  pageOf,
  titleOf,
  type ShownPage,
  type Site,
  type SitePlace,
  type SiteSeen,
  type Via,
} from './mockSite';

/**
 * The mock site, drawn (#63). `SiteWindow` draws one page: an address bar, the menu, the search
 * box, the page and a site map link, as the `Site` says. `MockSite` is a site the reader moves
 * round: every link is caught and the next page drawn in place, so the real page's address,
 * title and focus never change. Labs draw `SiteWindow` alone, inert, from their own state.
 *
 * What a stage reads (`siteSeenIn`): the drawn `[data-site]` window, with `data-site-page`
 * (title), `data-site-address` and `data-site-via` (how it was reached, '' at the start); the
 * menu's links in `[data-site-nav]`; and each way round the site as `[data-site-way]`.
 */

const VIAS: readonly Via[] = ['menu', 'search', 'site map', 'link'];

/** A link inside the mock: its href is a hash that is never followed. */
function SiteLinkTo({ to, via, label }: { to: string; via: Via; label: string }) {
  return (
    <a href={`#${to}`} data-to={to} data-via={via}>
      {label}
    </a>
  );
}

export function SiteWindow({
  site,
  page,
  via,
  onSearch,
}: {
  readonly site: Site;
  readonly page: ShownPage;
  readonly via: Via | null;
  /** Called with the query when the search form is sent; omit in an inert drawing. */
  readonly onSearch?: (query: string) => void;
}) {
  const menu = menuOn(site, page.id);
  const search = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch?.(String(new FormData(e.currentTarget).get('q') ?? '').trim());
  };
  return (
    <div
      className="msite__window"
      data-site
      data-site-page={page.title}
      data-site-address={page.address}
      data-site-via={via ?? ''}
    >
      {/* Where a new page starts: focus comes here after a move, as it would on a page load. */}
      <p className="msite__bar" tabIndex={-1}>
        {page.address}
      </p>
      {menu || site.search !== null ? (
        <div className="msite__head">
          {menu ? (
            <ul className="msite__menu" data-site-nav data-site-way="the menu">
              {menu.map((id) => (
                <li key={id}>
                  <SiteLinkTo to={id} via="menu" label={titleOf(site, id)} />
                </li>
              ))}
            </ul>
          ) : null}
          {site.search !== null ? (
            <form className="msite__search" data-site-way="search" noValidate onSubmit={search}>
              <label>
                Search the shop
                <input type="search" name="q" defaultValue={site.search} />
              </label>
              <button type="submit" className="btn o sm">
                Search
              </button>
            </form>
          ) : null}
        </div>
      ) : null}
      <div className="msite__page">
        <p className="msite__title">{page.title}</p>
        <p className="msite__text">{page.text}</p>
        {page.links.length > 0 ? (
          <ul className="msite__links">
            {page.links.map((l) => (
              <li key={l.to}>
                <SiteLinkTo {...l} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {site.siteMap ? (
        <p className="msite__foot" data-site-way="the site map">
          <SiteLinkTo to={SITE_MAP_PAGE} via="site map" label="Site map" />
        </p>
      ) : null}
    </div>
  );
}

type At = SitePlace & { readonly via: Via | null };

export function MockSite({ site }: { readonly site: Site }) {
  const root = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState<At>({ id: site.home, query: '', via: null });
  /** Whether focus was in the site when it moved, so it lands at the top of the new page. */
  const hadFocus = useRef(false);
  const page = pageOf(site, at);

  useLayoutEffect(() => {
    if (!hadFocus.current) return;
    hadFocus.current = false;
    root.current?.querySelector<HTMLElement>('.msite__bar')?.focus();
  }, [page.address]);

  const go = (next: At) => {
    hadFocus.current = root.current?.contains(document.activeElement) ?? false;
    setAt(next);
  };
  // Every link is caught here, on both stages (a simulated Enter clicks it too).
  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const link = (e.target as Element).closest<HTMLElement>('a[data-to]');
    if (!link) return;
    e.preventDefault();
    const via = VIAS.find((v) => v === link.dataset.via) ?? 'link';
    go({ id: link.dataset.to ?? site.home, query: at.query, via });
  };

  return (
    <div className="msite" ref={root} onClick={onClick}>
      {/* A new page is a new page: everything in it is new, and old focus goes with the old. */}
      <SiteWindow
        key={page.address}
        site={site}
        page={page}
        via={at.via}
        onSearch={(query) => go({ id: SEARCH_PAGE, query, via: 'search' })}
      />
    </div>
  );
}

/** What the drawn site shows now, read from the DOM; null when the example has no mock site. */
export function siteSeenIn(root: Element): SiteSeen | null {
  const win = root.querySelector<HTMLElement>('[data-site]');
  if (!win) return null;
  const via = VIAS.find((v) => v === win.dataset.siteVia) ?? null;
  const text = (el: Element) => (el.textContent ?? '').replace(/\s+/g, ' ').trim();
  return {
    title: win.dataset.sitePage ?? '',
    address: win.dataset.siteAddress ?? '',
    via,
    nav: Array.from(win.querySelectorAll('[data-site-nav] a')).map(text),
    ways: Array.from(win.querySelectorAll<HTMLElement>('[data-site-way]')).map(
      (el) => el.dataset.siteWay ?? '',
    ),
  };
}
