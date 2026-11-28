/**
 * Guideline 3.2 — Predictable.
 *
 * The shared idea: the interface may not change under you. Something you did not ask for, or a
 * thing that moves between pages, costs a sighted mouse user a moment of confusion and costs a
 * screen magnifier or screen reader user their entire orientation.
 */

import { useEffect, useId, useRef, useState } from 'react';
import { ADDRESS, COUNTRIES, OI_NAME, type Country } from '../labs/on-input/onInput';
import type { CriterionRecord, LiveExample } from './types';
import { MockSite } from '../live/SiteWindow';
import { SHUFFLED_SITE, STEADY_SITE } from '../labs/consistent-navigation/consistentNav';
import { FICKLE_SEARCH_SITE, STEADY_SEARCH_SITE } from '../labs/consistent-identification/consistentId';
import { ROAMING_HELP_SITE, STEADY_HELP_SITE } from '../labs/consistent-help/consistentHelp';

type HelpPage = 'help' | 'delivery' | 'returns';
type Section = Exclude<HelpPage, 'help'>;

const SECTION: Readonly<Record<Section, { readonly title: string; readonly text: string }>> = {
  delivery: { title: 'Delivery', text: 'Orders arrive in two to three working days.' },
  returns: { title: 'Returns', text: 'Send anything back within 30 days, free.' },
};

/**
 * 3.2.1's live examples (#47): a mock help page with its own address bar (`data-context`, read by
 * the stage's "Where the example is" instrument). Its "Jump to section" select either changes
 * the mock's page the moment it gets focus (broken) or waits for Go (fixed). The change of page
 * happens inside the mock only; on the fixed stage focus then moves to the new page's button.
 */
function JumpToSection({ onFocusJumps }: { onFocusJumps: boolean }) {
  const id = useId();
  const [page, setPage] = useState<HelpPage>('help');
  const [section, setSection] = useState<Section>('delivery');
  const go = useRef<HTMLButtonElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const moved = useRef(false);
  useEffect(() => {
    if (!moved.current) return;
    (page === 'help' ? go : back).current?.focus();
  }, [page]);
  const open = (to: HelpPage) => {
    moved.current = true;
    setPage(to);
  };

  return (
    <div className="ctx">
      <p className="ctx__bar">
        <span data-context>{page === 'help' ? 'shop.example/help' : `shop.example/help/${page}`}</span>
      </p>
      {page === 'help' ? (
        <div className="ctx__page">
          <div className="ctx__row">
            <label className="ctx__field" htmlFor={`${id}-jump`}>
              Jump to section
            </label>
            <select
              id={`${id}-jump`}
              value={section}
              onChange={(e) => setSection(e.target.value as Section)}
              onFocus={onFocusJumps ? () => open(section) : undefined}
            >
              <option value="delivery">Delivery</option>
              <option value="returns">Returns</option>
            </select>
            {onFocusJumps ? null : (
              <button ref={go} type="button" className="btn o sm" onClick={() => open(section)}>
                Go
              </button>
            )}
          </div>
          <label className="ctx__field">
            Search help
            <input type="search" />
          </label>
        </div>
      ) : (
        <div className="ctx__page">
          <p className="ctx__title">{SECTION[page].title}</p>
          <p className="ctx__text">{SECTION[page].text}</p>
          <button ref={back} type="button" className="btn o sm" onClick={() => open('help')}>
            Back to help
          </button>
        </div>
      )}
    </div>
  );
}

const JUMP_KEYS: LiveExample['keys'] = ['tab', 'shift-tab', 'enter'];
const JUMP_INSTRUMENTS: LiveExample['instruments'] = ['context', 'focus-tracker'];

/*
 * 3.2.2's live examples (#59). A checkout form with a name already typed and a country choice.
 * In the broken one, choosing a country reloads the page for that country (inside the example):
 * the address changes and the name is gone. In the fixed one, choosing only chooses; the button
 * updates the address format in place, and nothing typed is lost.
 */

function CountryChoice({
  id,
  chosen,
  onChoose,
}: {
  readonly id: string;
  readonly chosen: Country;
  readonly onChoose: (c: Country) => void;
}) {
  return (
    <fieldset className="lform__set">
      <legend className="lform__label">Country</legend>
      {COUNTRIES.map((c) => (
        <label key={c.value}>
          <input
            type="radio"
            name={`${id}-country`}
            value={c.value}
            checked={chosen === c.value}
            onChange={() => onChoose(c.value)}
          />{' '}
          {c.label}
        </label>
      ))}
    </fieldset>
  );
}

function ReloadingCountry() {
  const id = useId();
  const [page, setPage] = useState<Country>('uk');
  return (
    <form className="lform" noValidate onSubmit={(e) => e.preventDefault()}>
      <p className="addrbar">{ADDRESS[page]}</p>
      <label className="lform__label" htmlFor={`${id}-name`}>
        Name
      </label>
      {/* A reload builds a new form: what was typed is gone. */}
      <input
        key={page}
        id={`${id}-name`}
        autoComplete="name"
        defaultValue={page === 'uk' ? OI_NAME : ''}
        className="lform__field"
      />
      <CountryChoice id={id} chosen={page} onChoose={setPage} />
    </form>
  );
}

function CountryWithButton() {
  const id = useId();
  const [chosen, setChosen] = useState<Country>('uk');
  const [format, setFormat] = useState<Country>('uk');
  return (
    <form className="lform" noValidate onSubmit={(e) => e.preventDefault()}>
      <p className="addrbar">{ADDRESS.uk}</p>
      <label className="lform__label" htmlFor={`${id}-name`}>
        Name
      </label>
      <input id={`${id}-name`} autoComplete="name" defaultValue={OI_NAME} className="lform__field" />
      <CountryChoice id={id} chosen={chosen} onChoose={setChosen} />
      <button type="button" className="btn o sm" onClick={() => setFormat(chosen)}>
        Update address format
      </button>
      <label className="lform__label" htmlFor={`${id}-post`}>
        {format === 'uk' ? 'Postcode' : 'Code postal, 5 digits'}
      </label>
      <input id={`${id}-post`} autoComplete="postal-code" className="lform__field" />
    </form>
  );
}

const ON_INPUT_KEYS: LiveExample['keys'] = ['tab', 'shift-tab', 'space', 'enter', 'read'];

/*
 * 3.2.3's live examples (#63): a four-page shop as a mock site. Broken: the menu is in another
 * order on every page but Home. Fixed: one order everywhere. Moving between pages counts the Tab
 * presses to "Support" again; the menu order instrument compares each page with the first.
 */

const ShuffledShop = () => <MockSite site={SHUFFLED_SITE} />;
const SteadyShop = () => <MockSite site={STEADY_SITE} />;

const SHOP_KEYS: LiveExample['keys'] = ['tab', 'shift-tab', 'enter'];
const SHOP_INSTRUMENTS: LiveExample['instruments'] = ['menu-order', 'announcement-log'];

/*
 * 3.2.4's and 3.2.6's live examples (#64), on the same mock shop. 3.2.4: the search button is
 * "Search" on Home, "Find" on Products and "Go" on Support (broken), or "Search" on every page.
 * 3.2.6: the help link sits in the header, the footer or the page, page by page (broken), or
 * in the header on every page. Each instrument judges every page visited against the first.
 */

const FickleSearch = () => <MockSite site={FICKLE_SEARCH_SITE} />;
const SteadySearch = () => <MockSite site={STEADY_SEARCH_SITE} />;
const RoamingHelp = () => <MockSite site={ROAMING_HELP_SITE} />;
const SteadyHelp = () => <MockSite site={STEADY_HELP_SITE} />;

const ID_INSTRUMENTS: LiveExample['instruments'] = ['search-name', 'announcement-log'];
const HELP_INSTRUMENTS: LiveExample['instruments'] = ['help-place', 'announcement-log'];

export const G3_2: readonly CriterionRecord[] = [
  {
    num: '3.2.1',
    name: 'On Focus',
    level: 'A',
    since: '2.0',
    guideline: '3.2',
    gist:
      'Moving focus onto something must not change the context: no navigating away, no submitting.',
    plain:
      'Focusing something must not change the context — no navigating away, no opening a ' +
      'dialog, no submitting. Focus happens by accident all the time, because tabbing through ' +
      'a page focuses everything on the way past.',
    labs: ['on-focus'],
    fail: {
      caption: 'Tabbing onto the select navigates immediately.',
      live: {
        Example: () => <JumpToSection onFocusJumps />,
        keys: JUMP_KEYS,
        instruments: JUMP_INSTRUMENTS,
      },
      render: () => (
        <>
          <div className="press">
            <span className="press__btn">Jump to section ▾</span>
            <span className="press__note">navigates on focus</span>
          </div>
          <p className="example-note">
            A keyboard user tabbing toward the search box lands on this and is thrown to
            another page. They cannot get past it — every attempt to move on triggers it again.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'Focus does nothing; an explicit action navigates.',
      live: {
        Example: () => <JumpToSection onFocusJumps={false} />,
        keys: JUMP_KEYS,
        instruments: JUMP_INSTRUMENTS,
      },
      render: () => (
        <>
          <div className="press">
            <span className="press__btn">Jump to section ▾</span>
            <span className="pill">Go</span>
            <span className="press__note">navigates on Go</span>
          </div>
          <p className="example-note">
            Focusing shows the options. Choosing one selects it. Pressing Go acts on it. Three
            separate events, and only the last one is a decision.
          </p>
        </>
      ),
    },
    procedure: [
      'Put the mouse aside, reload the page and press Tab to move through every link, button, form field and other control in turn.',
      'Watch what happens as each one receives focus. Nothing may submit a form, load another page, or open a new window or dialog.',
      'Check that focus stays where Tab put it. A script that sends focus somewhere else as soon as a control receives it fails 3.2.1.',
      'Note anything that appears on focus, such as a tooltip or a menu that expands. That is allowed, as long as focus, the page and the window stay the same.',
      'Repeat the check inside every dialog, menu and later form step that opens when you activate something.',
    ],
    questions: [
      {
        question: 'Is a menu that opens on focus a failure of 3.2.1?',
        answer:
          'No. A menu that expands when it receives focus changes the content, not the context. It fails only if it also moves focus or takes the reader to another page.',
      },
      {
        question: 'Does 3.2.1 apply to mouse hover?',
        answer:
          'No. Hovering does not move focus, so 3.2.1 is about keyboard focus. Content that appears on hover is covered by 1.4.13 Content on Hover or Focus.',
      },
      {
        question: 'Does opening a dialog when a field gets focus fail 3.2.1?',
        answer:
          'Yes. A dialog that opens on focus and pulls focus into it is a change of context, and a keyboard user sets it off just by tabbing past.',
      },
    ],
  },

  {
    num: '3.2.2',
    name: 'On Input',
    level: 'A',
    since: '2.0',
    guideline: '3.2',
    labs: ['on-input'],
    plain:
      'Changing a setting must not change the context either, unless you warned the reader ' +
      'first. Picking an option is not the same as committing to it.',
    fail: {
      caption: 'Choosing a country reloads the page mid-form.',
      live: { Example: ReloadingCountry, keys: ON_INPUT_KEYS, instruments: ['announcement-log'] },
      render: () => (
        <>
          <div className="press">
            <span className="press__btn press__btn--bad">Country: France ▾</span>
            <span className="press__note">reloads on change</span>
          </div>
          <p className="example-note">
            Everything typed above it is gone. A screen reader user hears the page restart and
            has to work out what happened and how much they lost.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'The change is applied by a button, or announced in advance.',
      live: { Example: CountryWithButton, keys: ON_INPUT_KEYS, instruments: ['announcement-log'] },
      render: () => (
        <>
          <div className="press">
            <span className="press__btn">Country: France ▾</span>
            <span className="pill">Update address format</span>
          </div>
          <p className="example-note">
            Updating part of the page in place is fine and does not count as a change of
            context — what fails is navigating, submitting, or moving focus somewhere
            unexpected.
          </p>
        </>
      ),
    },
    procedure: [
      'List every form control that changes a setting: select menus, radio buttons, checkboxes, switches and text fields.',
      'Change each one with the keyboard: the arrow keys in a select menu or a radio group, Space on a checkbox, typing in a text field.',
      'After each change, watch for a change of context: a form that submits, another page that loads, a new window that opens, or focus that jumps to another field.',
      'For each change of context you find, look before the control for text that warns about it, such as "Choosing a country reloads the page". A warning that appears only after the change does not count.',
      'Check that each form is sent only when you activate its submit button, not when you change a value in it.',
    ],
    questions: [
      {
        question: 'Can a select menu submit the form when an option is chosen?',
        answer:
          'No, unless the page says so before the reader uses it. Without a warning, a keyboard user who arrows through the options is sent away on the first one. A separate Go button avoids the problem.',
      },
      {
        question: 'Is showing more fields when a radio button is chosen a failure?',
        answer:
          'No. Revealing fields changes the content while the form and focus stay where they are, so it is not a change of context.',
      },
      {
        question: 'Does moving focus to the next field automatically fail 3.2.2?',
        answer:
          'Only when the reader was not told first. Moving focus is a change of context, so a phone number field that jumps ahead after three digits needs an instruction before it that says so.',
      },
    ],
  },

  {
    num: '3.2.3',
    name: 'Consistent Navigation',
    level: 'AA',
    since: '2.0',
    guideline: '3.2',
    plain:
      'Navigation repeated across pages has to stay in the same relative order. You may add and ' +
      'remove items; you may not shuffle them.',
    labs: ['consistent-navigation'],
    fail: {
      caption: 'The order changes from page to page.',
      live: { Example: ShuffledShop, keys: SHOP_KEYS, instruments: SHOP_INSTRUMENTS },
      render: () => (
        <>
          <div className="navcompare">
            <span className="navcompare__row">Page A · Home · Products · Support · Account</span>
            <span className="navcompare__row">Page B · Support · Home · Account · Products</span>
          </div>
          <p className="example-note">
            Anyone navigating by position — a magnifier user, a switch user counting tab stops,
            or a person relying on motor memory — has to relearn the menu on every page.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'The same order everywhere.',
      live: { Example: SteadyShop, keys: SHOP_KEYS, instruments: SHOP_INSTRUMENTS },
      render: () => (
        <>
          <div className="navcompare">
            <span className="navcompare__row">Page A · Home · Products · Support · Account</span>
            <span className="navcompare__row">Page B · Home · Products · Support · Account</span>
          </div>
          <p className="example-note">
            Adding a page-specific item is fine as long as the shared items keep their relative
            order. Consistency is about sequence, not identical content.
          </p>
        </>
      ),
    },
    procedure: [
      'Pick three or more pages of the site that share navigation, such as the home page, a section page and a page deep inside that section.',
      'On each page, write down the order of the links in the main navigation, the header and any other menu that repeats.',
      'Compare the lists. Links that appear on more than one page have to come in the same order relative to each other; extra links on some pages are allowed.',
      'Press Tab through the navigation on each page and note the order focus takes, so you check the source order as well as the visual order.',
      'Compare the pages at the same window width. A menu that collapses into a button on a narrow screen has to list its links in the same order on every page at that width.',
    ],
    questions: [
      {
        question: 'Can some pages have extra navigation links?',
        answer:
          'Yes. Links can be added or removed on some pages, as long as the links that repeat stay in the same order relative to each other.',
      },
      {
        question: 'Does 3.2.3 apply to a single page?',
        answer:
          'No. It compares a set of pages that share navigation, such as the pages of one site. A page with no other pages around it has nothing to be consistent with.',
      },
      {
        question: 'Can users reorder the navigation themselves?',
        answer:
          'Yes. A change the user asks for, such as pinning favourite links to the top, is allowed. 3.2.3 is about changes the site makes on its own.',
      },
    ],
  },

  {
    num: '3.2.4',
    name: 'Consistent Identification',
    level: 'AA',
    since: '2.0',
    guideline: '3.2',
    plain:
      'The same function needs the same name and icon everywhere. Three words for one action ' +
      'means three things to learn, and no way to be sure they are the same thing.',
    labs: ['consistent-identification'],
    fail: {
      caption: 'One action, three names.',
      live: { Example: FickleSearch, keys: SHOP_KEYS, instruments: ID_INSTRUMENTS },
      render: () => (
        <>
          <div className="navcompare">
            <span className="navcompare__row">Basket page — "Checkout"</span>
            <span className="navcompare__row">Product page — "Buy now"</span>
            <span className="navcompare__row">Mini basket — "Proceed"</span>
          </div>
          <p className="example-note">
            A screen reader user cannot tell whether "Proceed" is the same as "Checkout" or a
            different, riskier thing. Voice-control users have to memorise all three.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'One action, one name.',
      live: { Example: SteadySearch, keys: SHOP_KEYS, instruments: ID_INSTRUMENTS },
      render: () => (
        <>
          <div className="navcompare">
            <span className="navcompare__row">Basket page — "Checkout"</span>
            <span className="navcompare__row">Product page — "Checkout"</span>
            <span className="navcompare__row">Mini basket — "Checkout"</span>
          </div>
          <p className="example-note">
            Same for icons: one glyph per function, and never the same glyph for two different
            functions.
          </p>
        </>
      ),
    },
    procedure: [
      'List the functions that appear on more than one page, such as search, sign in, the basket, print and share.',
      'Visit several pages and note the visible label or icon each function has on each page.',
      'Open the accessibility inspector in your browser (in Chrome, Edge or Firefox DevTools), select each one and note the name a screen reader would announce for it.',
      'Compare your notes. One function needs the same label, icon and name everywhere; Search on one page and Find on another fails.',
      'Check icons the other way round too. An icon used for two different functions, such as a tick for approved and for completed, needs a different text alternative for each.',
    ],
    questions: [
      {
        question: 'Do the labels have to be identical for 3.2.4?',
        answer:
          'No. They have to be consistent. A link that reads "Go to page 4" on one page and "Go to page 5" on the next is the same function named the same way.',
      },
      {
        question: 'Does 3.2.4 apply to icons?',
        answer:
          'Yes. An icon that does the same thing on every page needs the same text alternative everywhere. A save icon named Save on one page and Store on another fails.',
      },
      {
        question: 'Does 3.2.4 apply to two copies of one control on the same page?',
        answer:
          'Yes. The W3C guidance treats a search button in the header and another in the footer like copies on separate pages, so give both the same name.',
      },
    ],
  },

  {
    num: '3.2.6',
    name: 'Consistent Help',
    level: 'A',
    since: '2.2',
    guideline: '3.2',
    gist:
      'Help such as a contact link or chat widget must sit in the same relative place on every page.',
    plain:
      'If help is offered — a contact link, a chat widget, a help page — it has to appear in ' +
      'the same relative place on every page that has it. New in WCAG 2.2. People look for help ' +
      'when they are already stuck, which is the worst moment to have to hunt for it.',
    labs: ['consistent-help'],
    fail: {
      caption: 'Help moves around.',
      live: { Example: RoamingHelp, keys: SHOP_KEYS, instruments: HELP_INSTRUMENTS },
      render: () => (
        <>
          <div className="navcompare">
            <span className="navcompare__row">Home — help link in the footer</span>
            <span className="navcompare__row">Checkout — floating chat bubble, bottom right</span>
            <span className="navcompare__row">Account — buried under a settings menu</span>
          </div>
          <p className="example-note">
            Three mechanisms in three places. Someone who found help once has learned nothing
            transferable.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'Help sits in the same relative position throughout.',
      live: { Example: SteadyHelp, keys: SHOP_KEYS, instruments: HELP_INSTRUMENTS },
      render: () => (
        <>
          <div className="navcompare">
            <span className="navcompare__row">Home — "Help" last in the header</span>
            <span className="navcompare__row">Checkout — "Help" last in the header</span>
            <span className="navcompare__row">Account — "Help" last in the header</span>
          </div>
          <p className="example-note">
            The criterion does not require help on every page — only that where it exists, it
            is in a consistent place relative to the rest of the page.
          </p>
        </>
      ),
    },
    procedure: [
      'List the help the site offers: contact details such as a phone number or email address, a contact form, a help page, and a chat widget or chatbot.',
      'Open three or more pages that offer the same help, all at the same window width.',
      'On each page, note where each help item comes relative to the rest of the page: in the header after the search box, say, or in the footer before the copyright line.',
      'Press Tab through each page, or read it with a screen reader, and check that each help item comes at the same point in that order on every page.',
    ],
    questions: [
      {
        question: 'Does 3.2.6 require a site to offer help?',
        answer:
          'No. It applies only when help is offered on more than one page. Then it has to appear in the same order relative to the rest of the page on each of them.',
      },
      {
        question: 'Does help have to be in exactly the same place on screen?',
        answer:
          'No. 3.2.6 compares the order of the content, not its position in pixels, so help can move as the layout changes, as long as it keeps its place in that order.',
      },
      {
        question: 'Does a chatbot count as help under 3.2.6?',
        answer:
          'Yes. A fully automated contact such as a chatbot is one of the kinds of help it covers, along with contact details, a way to reach a person, and self-help such as a help page.',
      },
    ],
  },
];
