/**
 * Guideline 2.4 — Navigable.
 *
 * The largest guideline in the standard at Level A and AA, and the one this site's own chrome
 * leans on hardest: the skip link, the headings, the breadcrumb, the focus ring and the page
 * titles are all 2.4 in practice.
 */

import { useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import type { CriterionRecord, LiveExample } from './types';
import { MockSite } from '../live/SiteWindow';
import { SUPPORT_SITE, SUPPORT_SITE_FOUND } from '../labs/multiple-ways/multipleWays';

/*
 * 2.4.7's live examples (#44): three fields, as in the static examples. The broken row removes
 * the outline (`.fv-row--none`); the stage draws no ring either (`hideRing`), so focus goes
 * somewhere invisible and only the focus tracker says where. The fixed row keeps the site's ring.
 */

function FocusFields({ broken }: { broken: boolean }) {
  return (
    <div className={broken ? 'fv-row fv-row--none' : 'fv-row'}>
      <label>
        Name
        <input type="text" autoComplete="name" />
      </label>
      <label>
        Email
        <input type="email" autoComplete="email" />
      </label>
      <label>
        Card
        <input type="text" inputMode="numeric" autoComplete="cc-number" />
      </label>
    </div>
  );
}

const FIELD_KEYS: LiveExample['keys'] = ['tab', 'shift-tab'];

/*
 * 2.4.2, 2.4.4 and 2.4.6's live examples (#50). Each is the static example made real: the tabs
 * are switched with "Switch tab", the links and headings are pulled into a screen reader's list.
 */

function SameTitles() {
  return (
    <div className="tabs">
      <span className="tabs__tab" data-sim-tab>Acme</span>
      <span className="tabs__tab" data-sim-tab>Acme</span>
      <span className="tabs__tab" data-sim-tab>Acme</span>
    </div>
  );
}

function SpecificTitles() {
  return (
    <div className="tabs">
      <span className="tabs__tab" data-sim-tab>Basket (3) — Acme</span>
      <span className="tabs__tab" data-sim-tab>Delivery — Acme</span>
      <span className="tabs__tab" data-sim-tab>Order confirmed — Acme</span>
    </div>
  );
}

const TITLE_KEYS: LiveExample['keys'] = ['switch-tab'];

/** The documents the example links point at don't exist; following one would leave the page. */
const stay = (e: MouseEvent) => e.preventDefault();

/*
 * 2.4.4 fails here in context too: the titles are their own list, laid beside the links, so each
 * link's list item holds nothing but "read more". Only the eye pairs a title with its link.
 */
function ReadMoreLinks() {
  return (
    <div className="linkrows" onClick={stay}>
      <ul className="linkrows__titles live-links">
        <li>Annual report 2025</li>
        <li>Board minutes, March</li>
        <li>Sustainability update</li>
      </ul>
      <ul className="linkrows__links live-links">
        <li>
          <a href="/reports/annual-2025.pdf">read more</a>
        </li>
        <li>
          <a href="/reports/minutes-march">read more</a>
        </li>
        <li>
          <a href="/reports/sustainability">read more</a>
        </li>
      </ul>
    </div>
  );
}

function NamedLinks() {
  return (
    <ul className="linklist live-links" onClick={stay}>
      <li>
        <a href="/reports/annual-2025.pdf">Read the annual report 2025</a> (PDF, 2.4 MB)
      </li>
      <li>
        <a href="/reports/minutes-march">Read the board minutes for March</a>
      </li>
      <li>
        <a href="/reports/sustainability">Read the sustainability update</a>
      </li>
    </ul>
  );
}

const LINK_KEYS: LiveExample['keys'] = ['tab', 'shift-tab', 'links'];

function VagueHeadings() {
  return (
    <div className="fauxdoc live-doc">
      <h3 className="fauxdoc__real-h">More</h3>
      <h4 className="fauxdoc__line">Information</h4>
      <h4 className="fauxdoc__line">Details</h4>
      <label className="live-doc__field">
        Enter your details here
        <input type="text" />
      </label>
    </div>
  );
}

function DescriptiveHeadings() {
  return (
    <div className="fauxdoc live-doc">
      <h3 className="fauxdoc__real-h">Returns and refunds</h3>
      <h4 className="fauxdoc__line">How long you have</h4>
      <h4 className="fauxdoc__line">What it costs</h4>
      <label className="live-doc__field">
        Order number
        <input type="text" />
      </label>
    </div>
  );
}

const HEADING_KEYS: LiveExample['keys'] = ['tab', 'shift-tab', 'headings'];

/*
 * 2.4.1's, 2.4.3's and 2.4.11's live examples (#46). Links go nowhere: their clicks are
 * prevented, so Enter on the fail stage (a programmatic click) never leaves the page.
 */

const visibly = { focusVisible: true } as FocusOptions;

const MENU = ['Home', 'Women', 'Men', 'Kids', 'Sale', 'Brands', 'Gifts', 'Help'];

/** 2.4.1: a shop page with an eight-link menu, with or without a skip link before it. */
function SkipPage({ skip }: { skip: boolean }) {
  const id = useId();
  const article = useRef<HTMLAnchorElement>(null);
  return (
    <div className="bp-page">
      <div className="bp-page__head">
        {skip ? (
          <a
            className="bp-page__skip"
            href={`#${id}`}
            onClick={(e) => {
              e.preventDefault();
              article.current?.focus(visibly);
            }}
          >
            Skip to content
          </a>
        ) : null}
        {MENU.map((m) => (
          <a key={m} href="#" onClick={stay}>
            {m}
          </a>
        ))}
      </div>
      <div className="bp-page__main" id={id}>
        <p>Winter coats, and how to choose one.</p>
        <a href="#" onClick={stay} ref={article}>
          Read the buying guide
        </a>
      </div>
    </div>
  );
}

/**
 * 2.4.3: a filters dialog over a product list. Broken, the dialog opens and focus stays on the
 * page behind it. Fixed, focus moves into the dialog, the page goes inert, and closing it puts
 * focus back on the button that opened it.
 */
function FilterPage({ broken }: { broken: boolean }) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const apply = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (broken) return;
    if (open) apply.current?.focus(visibly);
    else if (wasOpen.current) opener.current?.focus(visibly);
    wasOpen.current = open;
  }, [open, broken]);
  return (
    <div className="fd-page">
      <div className="fd-page__body" inert={!broken && open}>
        <button type="button" className="btn o sm" ref={opener} onClick={() => setOpen(true)}>
          Show filters
        </button>
        <ul className="fd-page__list">
          {['Boots', 'Trainers', 'Sandals'].map((p) => (
            <li key={p}>
              <a href="#" onClick={stay}>
                {p}
              </a>
            </li>
          ))}
        </ul>
      </div>
      {open ? (
        <div className="fd-dialog" role="dialog" aria-labelledby={titleId}>
          <p className="fd-dialog__title" id={titleId}>
            Filters
          </p>
          <button type="button" className="btn sm" ref={apply} onClick={() => setOpen(false)}>
            Apply
          </button>
          <button type="button" className="btn o sm" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}

const STICKY_FIELDS = [
  { label: 'Name', autoComplete: 'name' },
  { label: 'Email', autoComplete: 'email' },
  { label: 'Street', autoComplete: 'address-line1' },
  { label: 'Town', autoComplete: 'address-level2' },
  { label: 'Postcode', autoComplete: 'postal-code' },
];

/**
 * 2.4.11: a short scrolling checkout with a sticky header. Broken, nothing reserves room for the
 * header, so a field scrolled to the top on the way back up sits under it. Fixed, the box's
 * `scroll-padding-top` keeps every focused field below the header.
 */
function StickyForm({ padded }: { padded: boolean }) {
  return (
    <div className={padded ? 'nob-box nob-box--padded' : 'nob-box'}>
      <p className="nob-box__bar">Acme checkout</p>
      {STICKY_FIELDS.map((f) => (
        <label key={f.label} className="nob-box__field">
          {f.label}
          <input type="text" autoComplete={f.autoComplete} />
        </label>
      ))}
    </div>
  );
}

const PAGE_KEYS: LiveExample['keys'] = ['tab', 'shift-tab', 'enter'];

/*
 * 2.4.5's live examples (#63): the shop's support site as a mock site the reader moves round.
 * Broken: the menu and each page's links are the only way down to VAT invoices. Fixed: search
 * (filled with “VAT”) and a site map lead there too. Neither ever navigates the real page.
 */

const LostSite = () => <MockSite site={SUPPORT_SITE} />;
const FoundSite = () => <MockSite site={SUPPORT_SITE_FOUND} />;

const SITE_KEYS: LiveExample['keys'] = ['tab', 'shift-tab', 'enter'];
const SITE_INSTRUMENTS: LiveExample['instruments'] = ['mock-site', 'announcement-log'];

export const G2_4: readonly CriterionRecord[] = [
  {
    num: '2.4.1',
    name: 'Bypass Blocks',
    level: 'A',
    since: '2.0',
    guideline: '2.4',
    labs: ['skip-link'],
    plain:
      'Give people a way past the things that repeat on every page. A skip link is the usual ' +
      'answer; real landmarks and a sane heading structure also count, because screen reader ' +
      'users navigate by those.',
    fail: {
      caption: 'Every menu link stands between the reader and the article.',
      live: {
        Example: () => <SkipPage skip={false} />,
        keys: PAGE_KEYS,
        instruments: ['focus-tracker'],
      },
      render: () => (
        <>
          <div className="tabstops">
            <span className="tabstops__item">Logo</span>
            <span className="tabstops__item">Search</span>
            <span className="tabstops__item">Nav ×12</span>
            <span className="tabstops__item">Sub-nav ×9</span>
            <span className="tabstops__item">Promo ×4</span>
            <span className="tabstops__item tabstops__item--goal">Article</span>
          </div>
          <p className="example-note">
            A keyboard user presses Tab thirty-odd times to reach the content — and does it
            again on the next page, and the next.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'One link, first in the tab order.',
      live: {
        Example: () => <SkipPage skip />,
        keys: PAGE_KEYS,
        instruments: ['focus-tracker'],
      },
      render: () => (
        <>
          <div className="tabstops">
            <span className="tabstops__item tabstops__item--skip">Skip to content</span>
            <span className="tabstops__item">Logo</span>
            <span className="tabstops__item">Search…</span>
            <span className="tabstops__item tabstops__item--goal">Article</span>
          </div>
          <p className="example-note">
            It may be visually hidden until focused, but it must become visible then — a skip
            link that stays invisible is worse than none, because sighted keyboard users
            trigger it and lose track of where they are. Press Tab on this page to see ours.
          </p>
        </>
      ),
    },
    procedure: [
      'Open two or three pages of the site and note the blocks that repeat on each: the header, the main navigation, a search bar, a sidebar.',
      'Load a page, click in the address bar and press Tab once. Check whether a skip link appears and becomes visible when it receives focus.',
      'Press Enter on the skip link. Press Tab again and check that focus lands on the first item in the main content, not back in the header.',
      'Where there is no skip link, open the accessibility inspector in your browser (the Accessibility pane in Chrome or Edge DevTools, or the Accessibility tab in Firefox) and check for a main landmark, or for a heading at the start of the main content.',
      'Turn on a screen reader (NVDA on Windows, VoiceOver on a Mac) and jump by landmark or by heading. Check that one jump reaches the main content.',
    ],
    questions: [
      {
        question: 'Does 2.4.1 require a skip link?',
        answer:
          'No. A skip link is one way to pass. Landmarks such as a main element, or a heading at the start of each section, also let a person jump past the repeated blocks.',
      },
      {
        question: 'Can a skip link stay hidden until it receives focus?',
        answer:
          'Yes, as long as it becomes visible when it does. 2.4.7 Focus Visible applies to it like any other link, so a sighted keyboard user has to be able to see it.',
      },
      {
        question: 'Does a page with nothing repeated need a way to bypass blocks?',
        answer:
          'No. 2.4.1 is about blocks that repeat across a set of pages, such as the same header on every page. A single page with no repeated blocks has nothing to bypass.',
      },
    ],
  },

  {
    num: '2.4.2',
    name: 'Page Titled',
    level: 'A',
    since: '2.0',
    guideline: '2.4',
    labs: ['page-title'],
    plain:
      'Every page needs a title that describes it. It is the first thing a screen reader ' +
      'announces, and the only thing distinguishing twenty open tabs or twenty history entries.',
    fail: {
      caption: 'The same title on every page.',
      live: { Example: SameTitles, keys: TITLE_KEYS, instruments: ['announcement-log'] },
      render: () => (
        <>
          <div className="tabs">
            <span className="tabs__tab">Acme</span>
            <span className="tabs__tab">Acme</span>
            <span className="tabs__tab">Acme</span>
          </div>
          <p className="example-note">
            Three tabs, indistinguishable. In a single-page app the title often never updates
            at all after the first load, which produces exactly this.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'Specific first, site name last.',
      live: { Example: SpecificTitles, keys: TITLE_KEYS, instruments: ['announcement-log'] },
      render: () => (
        <>
          <div className="tabs">
            <span className="tabs__tab">Basket (3) — Acme</span>
            <span className="tabs__tab">Delivery — Acme</span>
            <span className="tabs__tab">Order confirmed — Acme</span>
          </div>
          <p className="example-note">
            The distinguishing part comes first, because a narrow tab and a screen reader both
            truncate the end.
          </p>
        </>
      ),
    },
    procedure: [
      'Open the page and read the title in the browser tab. Hover over the tab if it is cut off.',
      'Check that the title says what the page is about or what it is for, such as the article headline or the step of a form, and not only the site name.',
      'Open two other pages of the same site and compare their titles. Check that each one tells its page apart from the others.',
      'In a single-page app, move to another view and check that the title in the tab changes with it.',
      'Turn on a screen reader (NVDA on Windows, VoiceOver on a Mac) and load the page. Listen for the title it reads first, and check that it makes sense heard alone.',
    ],
    questions: [
      {
        question: 'Does the h1 count as the page title for 2.4.2?',
        answer:
          'No. 2.4.2 is about the title element, which appears in the browser tab, in bookmarks and in search results, and which a screen reader reads first. A page needs a descriptive h1 for other reasons, but the title element has to describe the page too.',
      },
      {
        question: 'Must every page title be unique?',
        answer:
          'No, the criterion does not say so, but a title that tells a page apart from the others is what it is for. Ten tabs all called "Home" do not help anyone find the page they wanted.',
      },
      {
        question: 'Does a single-page app have to change the title when the view changes?',
        answer:
          'Yes. Each view is a page as far as the person is concerned, so the title has to describe the view they are on. Update document.title each time the route changes.',
      },
    ],
  },

  {
    num: '2.4.3',
    name: 'Focus Order',
    level: 'A',
    since: '2.0',
    guideline: '2.4',
    labs: ['focus-order'],
    plain:
      'Focus has to move in an order that preserves meaning. Usually that means source order — ' +
      'and when something opens on top, like a dialog, focus goes into it and comes back out ' +
      'where it started.',
    fail: {
      caption: 'A dialog opens and focus stays behind it.',
      live: {
        Example: () => <FilterPage broken />,
        keys: PAGE_KEYS,
        instruments: ['focus-tracker'],
      },
      render: () => (
        <>
          <div className="stack">
            <span className="stack__page">Page, still focused</span>
            <span className="stack__modal">Dialog, on top, ignored by the keyboard</span>
          </div>
          <p className="example-note">
            The dialog is visually in front and focus is still on the page behind it. A
            keyboard user tabs through content they cannot see, operating an interface hidden
            under an overlay.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'Focus follows the dialog in and back out.',
      live: {
        Example: () => <FilterPage broken={false} />,
        keys: PAGE_KEYS,
        instruments: ['focus-tracker'],
      },
      render: () => (
        <>
          <div className="stack">
            <span className="stack__page stack__page--inert">Page, inert</span>
            <span className="stack__modal stack__modal--on">Dialog, focused</span>
          </div>
          <p className="example-note">
            On open, focus moves into the dialog. While open, the rest is inert. On close, it
            returns to the control that opened it, so the reader’s place is not lost.
          </p>
        </>
      ),
    },
    procedure: [
      'Click in the address bar and press Tab through the whole page. Note the order in which each control receives focus.',
      'Compare that order with the order in which the page reads, top to bottom and in reading direction. Check that no jump changes what the content means or how it is used, such as a form field reached after its submit button.',
      'Search the page source for tabindex values greater than 0. Check that any order they force still makes sense.',
      'Open each dialog, menu and disclosure. Check that focus moves into it when it opens and goes back to the control that opened it when it closes.',
      'Where content appears after an action, such as an error message or a new set of fields, check that the next Tab press reaches it, not the page footer.',
    ],
    questions: [
      {
        question: 'Must the focus order match the visual order exactly?',
        answer:
          'No. 2.4.3 asks that the order keeps the meaning and the operation of the page intact. Several orders can do that, and only one of them has to be provided.',
      },
      {
        question: 'Does a positive tabindex fail 2.4.3?',
        answer:
          'Only when the order it creates loses meaning or stops the page working. In practice it usually does, because it pulls those elements ahead of everything else on the page. Change the source order instead.',
      },
      {
        question: 'Where should focus go when a dialog closes?',
        answer:
          'Back to the control that opened it, or to the next sensible place if that control has gone. Focus that drops to the top of the page makes the person find their place again.',
      },
    ],
  },

  {
    num: '2.4.4',
    name: 'Link Purpose (In Context)',
    level: 'A',
    since: '2.0',
    guideline: '2.4',
    labs: ['link-purpose'],
    gist: 'A link’s purpose must be clear from its text or the sentence around it.',
    plain:
      'What a link does has to be clear from its text, or from the sentence, list item, cell, ' +
      'or paragraph around it. Screen reader users often pull up a list of every link on the ' +
      'page, where that surrounding context is gone.',
    fail: {
      caption: 'Three “read more” links, with their titles in a separate column.',
      live: { Example: ReadMoreLinks, keys: LINK_KEYS, instruments: ['announcement-log'] },
      render: () => (
        <>
          <div className="linkrows">
            <div className="linkrows__titles">
              <span>Annual report 2025</span>
              <span>Board minutes, March</span>
              <span>Sustainability update</span>
            </div>
            <div className="linkrows__links">
              <u>read more</u>
              <u>read more</u>
              <u>read more</u>
            </div>
          </div>
          <p className="example-note">
            The titles are one list and the links another, lined up only by the layout. A
            link’s own list item says nothing but “read more”, so neither its text nor its
            context names the report, and a links list reads “read more” three times.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'The link text names its destination.',
      live: { Example: NamedLinks, keys: LINK_KEYS, instruments: ['announcement-log'] },
      render: () => (
        <>
          <div className="linklist">
            <span>
              <u>Read the annual report 2025</u> (PDF, 2.4 MB)
            </span>
            <span>
              <u>Read the board minutes for March</u>
            </span>
            <span>
              <u>Read the sustainability update</u>
            </span>
          </div>
          <p className="example-note">
            Each stands alone. Format and size are worth stating too — a link that silently
            starts a large download is its own kind of surprise.
          </p>
        </>
      ),
    },
    diff: {
      title: 'reports.html',
      lines: [
        { kind: 'del', text: '<ul class="titles"><li>Annual report 2025</li> …</ul>' },
        { kind: 'del', text: '<ul class="links"><li><a href="/r25.pdf">read more</a></li> …</ul>' },
        { kind: 'add', text: '<ul>' },
        { kind: 'add', text: '  <li><a href="/r25.pdf">Read the annual report 2025</a> (PDF, 2.4 MB)</li> …' },
        { kind: 'add', text: '</ul>' },
      ],
      note:
        'Hiding the context in aria-label is a second-best fix: it desynchronises what is seen ' +
        'from what is announced, and voice-control users say what they see.',
    },
    procedure: [
      'List every link on the page. A screen reader’s links list does this for you: Insert+F7 in NVDA, or the Links menu of the VoiceOver rotor on a Mac.',
      'Read each link text on its own and note any that does not say where it goes, such as "Read more", "Click here" or "Details".',
      'For each one noted, read the sentence, paragraph, list item or table cell that holds it, and the heading of its table column. Check that the purpose is clear from the link together with that context.',
      'Open the accessibility inspector in your browser (the Accessibility pane in Chrome or Edge DevTools, or the Accessibility tab in Firefox) and check each image link and icon link. Check that its name says where it goes.',
      'Check that links which go to different places do not share the same text in the same context.',
    ],
    questions: [
      {
        question: 'Does a "Read more" link fail 2.4.4?',
        answer:
          'Only when its context does not say what it is about. A "Read more" in the same paragraph or list item as the article title it belongs to passes, because the purpose comes from the two together.',
      },
      {
        question: 'Can I fix vague link text with aria-label or hidden text?',
        answer:
          'Yes, both count. Keep the visible words at the start of the name, though, or a person using voice control cannot say what they see. That is 2.5.3 Label in Name.',
      },
      {
        question: 'Is a link whose purpose nobody can guess allowed?',
        answer:
          'Only when it is unclear to everyone, by design. A game where you choose between "Door 1" and "Door 2" passes, because no reader is meant to know where each leads.',
      },
    ],
  },

  {
    num: '2.4.5',
    name: 'Multiple Ways',
    level: 'AA',
    since: '2.0',
    guideline: '2.4',
    plain:
      'Offer more than one route to each page — navigation plus search, or a sitemap, or an ' +
      'index. People navigate differently; some scan structure, others go straight to search. ' +
      'Steps within a process are exempt.',
    labs: ['multiple-ways'],
    fail: {
      caption: 'A deep hierarchy and nothing else.',
      live: { Example: LostSite, keys: SITE_KEYS, instruments: SITE_INSTRUMENTS },
      render: () => (
        <>
          <div className="crumbs">Home › Support › Billing › Invoices › VAT</div>
          <p className="example-note">
            Five levels down, reachable only by walking the tree from the top. No search, no
            index, no cross-links. Someone with a memory or attention impairment has to hold
            the whole path in their head.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'Two independent routes, at least.',
      live: { Example: FoundSite, keys: SITE_KEYS, instruments: SITE_INSTRUMENTS },
      render: () => (
        <>
          <div className="crumbs">Home › Support › Billing › Invoices › VAT</div>
          <div className="notice">
            <span className="notice__title">Also reachable by</span>
            <span>Search · A–Z index · "VAT" linked from three related articles</span>
          </div>
          <p className="example-note">
            This site offers the main navigation, the All criteria index with search and
            filters, and links between related criteria: three routes to the same page.
          </p>
        </>
      ),
    },
    procedure: [
      'Pick a page deep inside the site, not the home page, and list the ways it can be reached: the main navigation, a search box, a site map, a table of contents, links from related pages.',
      'Check that there are at least two of these.',
      'Follow each way in turn, such as searching for the page’s title or finding it in the site map. Check that each one really leads to the page.',
      'Repeat for a few other pages, including one that sits several levels down.',
      'For any page reachable only one way, check whether it is a step in a process or the result of one, such as the third step of a checkout or a payment confirmation. Those are exempt.',
    ],
    questions: [
      {
        question: 'Do a navigation menu and a search box count as two ways?',
        answer:
          'Yes, when the menu reaches the page and the search finds it. A search box alone is one way; pair it with a site map, a table of contents or links between related pages.',
      },
      {
        question: 'Does a checkout step need two ways to reach it?',
        answer:
          'No. A page that is a step in a process, or that exists only as its result, is exempt. A payment confirmation or a page of search results is only reached by doing the thing before it.',
      },
      {
        question: 'Does a site of three pages need a search box?',
        answer:
          'No. When every page is linked from the home page, those links can act as a site map. On a site that small, they may be enough with the navigation.',
      },
    ],
  },

  {
    num: '2.4.6',
    name: 'Headings and Labels',
    level: 'AA',
    since: '2.0',
    guideline: '2.4',
    labs: ['headings-labels'],
    plain:
      'Where headings and labels exist, they have to describe the topic or purpose. This is ' +
      'about being informative, not merely present — 1.3.1 asks whether a heading is marked up ' +
      'as one; this asks whether it says anything.',
    fail: {
      caption: 'Headings that describe nothing.',
      live: { Example: VagueHeadings, keys: HEADING_KEYS, instruments: ['announcement-log'] },
      render: () => (
        <>
          <div className="fauxdoc">
            <span className="fauxdoc__real-h">More</span>
            <span className="fauxdoc__line">Information</span>
            <span className="fauxdoc__line">Details</span>
          </div>
          <p className="example-note">
            Correctly marked up as headings — 1.3.1 passes. A screen reader user pulling up
            the heading list to find the returns policy gets "More", "Information", "Details".
          </p>
        </>
      ),
    },
    pass: {
      caption: 'Headings that answer "what is under here".',
      live: { Example: DescriptiveHeadings, keys: HEADING_KEYS, instruments: ['announcement-log'] },
      render: () => (
        <>
          <div className="fauxdoc">
            <span className="fauxdoc__real-h">Returns and refunds</span>
            <span className="fauxdoc__line">How long you have</span>
            <span className="fauxdoc__line">What it costs</span>
          </div>
          <p className="example-note">
            The test is whether the heading list alone is a usable table of contents. Same for
            labels: "Name" beats "Enter your details here".
          </p>
        </>
      ),
    },
    procedure: [
      'List the headings on the page. A screen reader’s headings list does this for you: Insert+F7 in NVDA, or the Headings menu of the VoiceOver rotor on a Mac.',
      'Read each heading on its own and check that it says what the section under it is about. "Section 2" or "More" says nothing.',
      'List the labels of every form field and control, as they appear on screen. Check that each one says what to enter or what the control does.',
      'Open the accessibility inspector in your browser (the Accessibility pane in Chrome or Edge DevTools, or the Accessibility tab in Firefox) and check the name of each control. Where it differs from the visible label, check that it is accurate too.',
    ],
    questions: [
      {
        question: 'Does 2.4.6 require a page to have headings?',
        answer:
          'No. 2.4.6 asks only that the headings and labels a page has are descriptive. Whether content needs headings at all is a matter for 1.3.1 Info and Relationships, and whether fields need labels is a matter for 3.3.2 Labels or Instructions.',
      },
      {
        question: 'Do headings and labels have to be long to be descriptive?',
        answer:
          'No. One word can be enough if it tells the person what is there. "Email" is a descriptive label; "Enter the email address you would like us to use" is no clearer.',
      },
      {
        question: 'Must every heading on a page be unique?',
        answer:
          'No, 2.4.6 does not say so. Repeating "Ingredients" and "Method" under each recipe is fine, because each heading still says what its own section holds.',
      },
    ],
  },

  {
    num: '2.4.7',
    name: 'Focus Visible',
    level: 'AA',
    since: '2.0',
    guideline: '2.4',
    demos: ['focus-visible-2-4-7', 'focus-lost-2-4-7'],
    labs: ['focus-ring'],
    plain:
      'Keyboard focus has to be visible. Removing the outline because it is ugly is the single ' +
      'most common accessibility failure on the web, and it makes a site unusable rather than ' +
      'merely awkward.',
    fail: {
      caption: 'The outline was removed and nothing replaced it.',
      live: {
        Example: () => <FocusFields broken />,
        keys: FIELD_KEYS,
        instruments: ['focus-tracker'],
        hideRing: true,
      },
      render: () => (
        <>
          <div className="focusrow">
            <span className="focusdemo focusdemo--none">Name</span>
            <span className="focusdemo focusdemo--none">Email</span>
            <span className="focusdemo focusdemo--none">Card</span>
          </div>
          <p className="example-note">
            <span className="alt-code">outline: none</span> with no substitute. Focus is
            somewhere; the reader cannot see where. Tabbing becomes guesswork and typing goes
            into a field they cannot identify.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'A ring with its own contrast and an offset.',
      live: {
        Example: () => <FocusFields broken={false} />,
        keys: FIELD_KEYS,
        instruments: ['focus-tracker'],
      },
      render: () => (
        <>
          <div className="focusrow">
            <span className="focusdemo">Name</span>
            <span className="focusdemo focusdemo--on">Email</span>
            <span className="focusdemo">Card</span>
          </div>
          <p className="example-note">
            Restyling the ring is fine; removing it is not. Give it 3:1 against its
            surroundings and an <span className="alt-code">outline-offset</span> so it does not
            disappear into a dark control — and use{' '}
            <span className="alt-code">:focus-visible</span> so it appears for keyboards
            without following every mouse click.
          </p>
        </>
      ),
    },
    diff: {
      title: 'buttons.css',
      lines: [
        { kind: 'del', text: 'button:focus { outline: none; }' },
        { kind: 'add', text: 'button:focus-visible {' },
        { kind: 'add', text: '  outline: 3px solid var(--focus);' },
        { kind: 'add', text: '  outline-offset: 2px;' },
        { kind: 'add', text: '}' },
      ],
      note: 'The CSS rule this page uses on every interactive element, verbatim.',
    },
    procedure: [
      'Click in the address bar and press Tab through the whole page. At each stop, check that you can see which element has focus without moving the mouse.',
      'Note any element where focus seems to vanish: nothing changes on screen, or the only change is too faint to spot.',
      'Repeat inside every menu, dialog, tab set and custom widget, using the arrow keys where the widget expects them.',
      'Search the stylesheets for outline: none, outline: 0 and styles on :focus. Check that each one that removes the browser outline puts a visible style in its place.',
      'Repeat the Tab pass in dark mode and with a Windows contrast theme turned on, where a focus style made only of a background colour or a shadow can disappear.',
    ],
    questions: [
      {
        question: 'Does the browser’s default focus outline pass 2.4.7?',
        answer:
          'Yes, in most cases, as long as nothing on the page removes it or hides it. Check it against your own colours, though: a default outline can be hard to see on some backgrounds.',
      },
      {
        question: 'Does 2.4.7 set a minimum size or contrast for the focus indicator?',
        answer:
          'No. 2.4.7 asks only that the indicator is visible. 1.4.11 Non-text Contrast asks that it stands out from its background, and 2.4.13 Focus Appearance, at Level AAA, sets its size.',
      },
      {
        question: 'Can I show the focus ring only to keyboard users with :focus-visible?',
        answer:
          'Yes. 2.4.7 asks for a visible indicator when the page is used from the keyboard, and :focus-visible gives exactly that while hiding the ring after a mouse click.',
      },
    ],
  },

  {
    num: '2.4.11',
    name: 'Focus Not Obscured (Minimum)',
    level: 'AA',
    since: '2.2',
    guideline: '2.4',
    demos: ['obscured-2-4-11'],
    labs: ['sticky-banner'],
    plain:
      'When something receives focus, it must not be entirely hidden behind other content. New ' +
      'in WCAG 2.2, and almost always caused by a sticky header swallowing whatever you just ' +
      'tabbed to.',
    fail: {
      caption: 'The sticky header covers the field that just took focus.',
      live: {
        Example: () => <StickyForm padded={false} />,
        keys: FIELD_KEYS,
        instruments: ['focus-tracker'],
      },
      render: () => (
        <>
          <div className="obscure">
            <span className="obscure__bar">Sticky header</span>
            <span className="obscure__field obscure__field--under">Focused field, underneath</span>
            <span className="obscure__field">Next field</span>
          </div>
          <p className="example-note">
            The browser scrolled the field into view, then the header covered it. The reader
            is typing into something they cannot see.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'Scroll padding reserves room for the header.',
      live: {
        Example: () => <StickyForm padded />,
        keys: FIELD_KEYS,
        instruments: ['focus-tracker'],
      },
      render: () => (
        <>
          <div className="obscure">
            <span className="obscure__bar">Sticky header</span>
            <span className="obscure__spacer" />
            <span className="obscure__field obscure__field--on">Focused field, clear of it</span>
            <span className="obscure__field">Next field</span>
          </div>
          <p className="example-note">
            <span className="alt-code">scroll-padding-top</span> equal to the header height,
            set once on the root.
          </p>
        </>
      ),
    },
    diff: {
      title: 'app.css',
      lines: [
        { kind: 'context', text: 'html {' },
        { kind: 'add', text: '  scroll-padding-top: 5.5rem;  /* the sticky header */' },
        { kind: 'context', text: '}' },
      ],
      note:
        'One declaration fixes anchor jumps, tab traversal, and programmatic scrolling all at ' +
        'once, because they all honour scroll padding.',
    },
    procedure: [
      'List everything the page keeps on screen while it scrolls: sticky headers and footers, cookie banners, chat buttons, toolbars.',
      'Click in the address bar and press Tab through the whole page, then Shift+Tab back. At each stop, check that some part of the focused element is still in view and not covered.',
      'Repeat at a narrow window width, around 320 pixels, and with the page zoomed to 200%, where sticky bars take up more of the screen.',
      'Open any content that stays open as focus moves, such as a chat window or a non-modal dialog. Tab past it and check that it never covers the focused element completely, or that Escape closes it without moving focus.',
    ],
    questions: [
      {
        question: 'Does focus that is partly covered fail 2.4.11?',
        answer:
          'No. At Level AA, the focused element fails only when it is hidden entirely. Hiding none of it is what 2.4.12 Focus Not Obscured (Enhanced), at Level AAA, asks for.',
      },
      {
        question: 'Does a cookie banner that covers the bottom of the page fail 2.4.11?',
        answer:
          'Only when it can hide a focused element completely. It passes if it is modal, so the person deals with it first, or if the page reserves space for it with scroll-padding so focused content scrolls clear of it.',
      },
      {
        question: 'Does a drop-down menu that covers focused content fail 2.4.11?',
        answer:
          'No, when it closes as soon as focus moves away from it. Content that stays open, such as a chat window, fails if it can hide the focused element and the person cannot get it out of the way without moving focus.',
      },
    ],
  },
];
