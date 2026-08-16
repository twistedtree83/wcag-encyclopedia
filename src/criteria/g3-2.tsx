/**
 * Guideline 3.2 — Predictable.
 *
 * The shared rule: the interface may not change under you. Something you did not ask for, or a
 * thing that moves between pages, costs a sighted mouse user a moment of confusion and costs a
 * screen magnifier or screen reader user their entire orientation.
 */

import type { CriterionRecord } from './types';

export const G3_2: readonly CriterionRecord[] = [
  {
    num: '3.2.1',
    name: 'On Focus',
    level: 'A',
    guideline: '3.2',
    plain:
      'Focusing something must not change the context — no navigating away, no opening a ' +
      'dialog, no submitting. Focus happens by accident all the time, because tabbing through ' +
      'a page focuses everything on the way past.',
    fail: {
      caption: 'Tabbing onto the select navigates immediately.',
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
    guideline: '3.2',
    plain:
      'Changing a setting must not change the context either, unless you warned the reader ' +
      'first. Picking an option is not the same as committing to it.',
    fail: {
      caption: 'Choosing a country reloads the page mid-form.',
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
    guideline: '3.2',
    plain:
      'Navigation repeated across pages has to stay in the same relative order. You may add and ' +
      'remove items; you may not shuffle them.',
    fail: {
      caption: 'The order changes from page to page.',
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
    guideline: '3.2',
    plain:
      'The same function needs the same name and icon everywhere. Three words for one action ' +
      'means three things to learn, and no way to be sure they are the same thing.',
    fail: {
      caption: 'One action, three names.',
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
    guideline: '3.2',
    plain:
      'If help is offered — a contact link, a chat widget, a help page — it has to appear in ' +
      'the same relative place on every page that has it. New in WCAG 2.2. People look for help ' +
      'when they are already stuck, which is the worst moment to have to hunt for it.',
    fail: {
      caption: 'Help moves around.',
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
