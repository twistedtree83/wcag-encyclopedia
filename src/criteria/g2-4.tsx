/**
 * Guideline 2.4 — Navigable.
 *
 * The largest guideline in the standard at Level A and AA, and the one this site's own chrome
 * leans on hardest: the skip link, the rail, the headings, the focus ring, and the
 * scroll-margin that keeps a deep-linked card clear of the masthead are all 2.4 in practice.
 */

import type { CriterionRecord } from './types';

export const G2_4: readonly CriterionRecord[] = [
  {
    num: '2.4.1',
    name: 'Bypass Blocks',
    level: 'A',
    guideline: '2.4',
    plain:
      'Give people a way past the things that repeat on every page. A skip link is the usual ' +
      'answer; real landmarks and a sane heading structure also count, because screen reader ' +
      'users navigate by those.',
    fail: {
      caption: 'Forty links before the article, on every page.',
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
  },

  {
    num: '2.4.2',
    name: 'Page Titled',
    level: 'A',
    guideline: '2.4',
    plain:
      'Every page needs a title that describes it. It is the first thing a screen reader ' +
      'announces, and the only thing distinguishing twenty open tabs or twenty history entries.',
    fail: {
      caption: 'The same title on every page.',
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
  },

  {
    num: '2.4.3',
    name: 'Focus Order',
    level: 'A',
    guideline: '2.4',
    plain:
      'Focus has to move in an order that preserves meaning. Usually that means source order — ' +
      'and when something opens on top, like a dialog, focus goes into it and comes back out ' +
      'where it started.',
    fail: {
      caption: 'A dialog opens and focus stays behind it.',
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
  },

  {
    num: '2.4.4',
    name: 'Link Purpose (In Context)',
    level: 'A',
    guideline: '2.4',
    plain:
      'What a link does has to be clear from its text, or from the sentence, list item, cell, ' +
      'or paragraph around it. Screen reader users often pull up a list of every link on the ' +
      'page, where that surrounding context is gone.',
    fail: {
      caption: 'Eleven links that all say the same thing.',
      render: () => (
        <>
          <div className="linklist">
            <span>Annual report 2025 — <u>read more</u></span>
            <span>Board minutes, March — <u>read more</u></span>
            <span>Sustainability update — <u>read more</u></span>
          </div>
          <p className="example-note">
            Pulled into a links list they read "read more, read more, read more". The same
            problem afflicts "click here", "download", and a bare URL read out character by
            character.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'The link text names its destination.',
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
        { kind: 'del', text: 'Annual report 2025 — <a href="/r25.pdf">read more</a>' },
        { kind: 'add', text: '<a href="/r25.pdf">Read the annual report 2025</a> (PDF, 2.4 MB)' },
      ],
      note:
        'Hiding the context in aria-label is a second-best fix: it desynchronises what is seen ' +
        'from what is announced, and voice-control users say what they see.',
    },
  },

  {
    num: '2.4.5',
    name: 'Multiple Ways',
    level: 'AA',
    guideline: '2.4',
    plain:
      'Offer more than one route to each page — navigation plus search, or a sitemap, or an ' +
      'index. People navigate differently; some scan structure, others go straight to search. ' +
      'Steps within a process are exempt.',
    fail: {
      caption: 'A deep hierarchy and nothing else.',
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
      render: () => (
        <>
          <div className="crumbs">Home › Support › Billing › Invoices › VAT</div>
          <div className="notice">
            <span className="notice__title">Also reachable by</span>
            <span>Search · A–Z index · "VAT" linked from three related articles</span>
          </div>
          <p className="example-note">
            This page offers the rail, the principle openers, in-page search, and deep links
            per criterion — four routes to the same card.
          </p>
        </>
      ),
    },
  },

  {
    num: '2.4.6',
    name: 'Headings and Labels',
    level: 'AA',
    guideline: '2.4',
    plain:
      'Where headings and labels exist, they have to describe the topic or purpose. This is ' +
      'about being informative, not merely present — 1.3.1 asks whether a heading is marked up ' +
      'as one; this asks whether it says anything.',
    fail: {
      caption: 'Headings that describe nothing.',
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
  },

  {
    num: '2.4.7',
    name: 'Focus Visible',
    level: 'AA',
    guideline: '2.4',
    demos: ['focus-visible-2-4-7', 'focus-lost-2-4-7'],
    plain:
      'Keyboard focus has to be visible. Removing the outline because it is ugly is the single ' +
      'most common accessibility failure on the web, and it makes a site unusable rather than ' +
      'merely awkward.',
    fail: {
      caption: 'The outline was removed and nothing replaced it.',
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
      note: 'The rule this page uses on every interactive element, verbatim.',
    },
  },

  {
    num: '2.4.11',
    name: 'Focus Not Obscured (Minimum)',
    level: 'AA',
    guideline: '2.4',
    demos: ['obscured-2-4-11'],
    plain:
      'When something receives focus, it must not be entirely hidden behind other content. New ' +
      'in WCAG 2.2, and almost always caused by a sticky header swallowing whatever you just ' +
      'tabbed to.',
    fail: {
      caption: 'The sticky header covers the field that just took focus.',
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
            set once on the root. This page does exactly that, which is why a deep link to a
            criterion lands below the masthead rather than under it.
          </p>
        </>
      ),
    },
    diff: {
      title: 'app.css',
      lines: [
        { kind: 'context', text: 'html {' },
        { kind: 'add', text: '  scroll-padding-top: 5.5rem;  /* the sticky masthead */' },
        { kind: 'context', text: '}' },
      ],
      note:
        'One declaration fixes anchor jumps, tab traversal, and programmatic scrolling all at ' +
        'once, because they all honour scroll padding.',
    },
  },
];
