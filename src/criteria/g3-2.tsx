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
  },

  {
    num: '3.2.6',
    name: 'Consistent Help',
    level: 'A',
    since: '2.2',
    guideline: '3.2',
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
  },
];
