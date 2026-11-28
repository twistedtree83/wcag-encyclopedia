/**
 * Guideline 1.3 — Adaptable.
 *
 * The through-line: structure has to survive losing the presentation. If the only thing making
 * a heading a heading is that it is big and bold, then it is not a heading — it is large text,
 * and nothing but a sighted reader will ever know it was meant as one.
 */

import { useId } from 'react';
import type { CriterionRecord, LiveExample } from './types';
import { OrderPage } from '../labs/orientation/OrientationLab';
import { PHONE } from '../labs/orientation/orientation';

/** 1.3.4's live examples (#55): an order page on a phone in the zoom frame, locked or adapting. */
function LockedOrder() {
  return <OrderPage lock="portrait" />;
}
function AdaptingOrder() {
  return <OrderPage lock="adapts" />;
}
const ORIENT_LIVE = { keys: ['rotate'], instruments: ['orientation-meter'], zoomFrame: PHONE } as const;

/*
 * 1.3.1's live examples (#48): the static examples' shipping note, live. Read aloud, the styled
 * spans run together as one line of text; the real elements say a heading and a list of two.
 */

function StyledDoc() {
  return (
    <div className="fauxdoc">
      <span className="fauxdoc__fake-h">Shipping and returns</span>
      <span className="fauxdoc__line">— Orders leave the warehouse within two days</span>
      <span className="fauxdoc__line">— Returns are free within thirty days</span>
    </div>
  );
}

function RealDoc() {
  return (
    <div className="fauxdoc">
      <h3 className="fauxdoc__real-h">Shipping and returns</h3>
      <ul className="fauxdoc__list">
        <li>Orders leave the warehouse within two days</li>
        <li>Returns are free within thirty days</li>
      </ul>
    </div>
  );
}

const DOC_KEYS: LiveExample['keys'] = ['read'];

/*
 * 1.3.2's live examples (#49): checkout steps as buttons. The broken row is sorted on screen by
 * CSS `order`; Tab and a read-aloud follow the source, Confirm first. The fixed row's source is
 * in the order it shows.
 */

function ReorderedSteps() {
  return (
    <div className="seq seq--reordered live-seq">
      <button type="button" className="seq__step">
        <b>3.</b> Confirm
      </button>
      <button type="button" className="seq__step">
        <b>1.</b> Basket
      </button>
      <button type="button" className="seq__step">
        <b>2.</b> Address
      </button>
    </div>
  );
}

function OrderedSteps() {
  return (
    <div className="seq live-seq">
      <button type="button" className="seq__step">
        <b>1.</b> Basket
      </button>
      <button type="button" className="seq__step">
        <b>2.</b> Address
      </button>
      <button type="button" className="seq__step">
        <b>3.</b> Confirm
      </button>
    </div>
  );
}

const STEP_KEYS: LiveExample['keys'] = ['tab', 'shift-tab', 'read'];

/*
 * 1.3.5's live examples (#49): the diff's contact fields, labelled in both. "Autofill" fills only
 * the fields whose autocomplete names a purpose, so only the fixed fields fill.
 */

function ContactFields({ purposes }: { purposes: boolean }) {
  const id = useId();
  return (
    <div className="live-form">
      <label htmlFor={`${id}-name`}>Full name</label>
      <input id={`${id}-name`} type="text" autoComplete={purposes ? 'name' : undefined} />
      <label htmlFor={`${id}-email`}>Email</label>
      <input id={`${id}-email`} type="email" autoComplete={purposes ? 'email' : undefined} />
    </div>
  );
}

const UntaggedFields = () => <ContactFields purposes={false} />;
const TaggedFields = () => <ContactFields purposes />;

const FIELD_KEYS: LiveExample['keys'] = ['tab', 'shift-tab', 'autofill', 'read'];

/*
 * 1.3.3's live examples (#56): the same checkout step under two instructions. The broken one
 * points by place, shape and colour; through "Vision filter" the green button is lost, and read
 * aloud nothing is round or green. The fixed one names the button, which survives both.
 */

function CheckoutStep({ named }: { named: boolean }) {
  return (
    <div className="vis-step">
      <p className="vis-step__say">
        {named ? (
          <>
            Fill in <b>Delivery details</b>, then press <b>Continue to payment</b>.
          </>
        ) : (
          'Fill in the panel on the left, then press the round green button below it to continue.'
        )}
      </p>
      <div className="vis-step__panel">
        <b>Delivery details</b>
        <span>12 Acacia Avenue, Leeds</span>
      </div>
      <div className="vis-step__buttons">
        <button type="button" className="vis-btn vis-btn--stop" data-cue-peer="the red button">
          Save for later
        </button>
        <button
          type="button"
          className="vis-btn vis-btn--go"
          data-cue="the green button"
          data-cue-part="fill"
          data-cue-vs="peer"
          {...(named ? { 'data-cue-also': 'named in the instruction' } : {})}
        >
          Continue to payment
        </button>
      </div>
    </div>
  );
}

const STEP_SENSE_KEYS: LiveExample['keys'] = ['vision', 'read', 'tab', 'shift-tab'];

export const G1_3: readonly CriterionRecord[] = [
  {
    num: '1.3.1',
    name: 'Info and Relationships',
    level: 'A',
    since: '2.0',
    guideline: '1.3',
    labs: ['structure'],
    plain:
      'Structure you can see has to exist in the markup too. Headings marked up as headings, ' +
      'lists as lists, table headers as table headers, labels tied to their fields. Strip the ' +
      'stylesheet: if the relationships vanish, they were never really there.',
    fail: {
      caption: 'Styling stands in for structure.',
      live: { Example: StyledDoc, keys: DOC_KEYS, instruments: ['announcement-log'] },
      render: () => (
        <>
          <div className="fauxdoc">
            <span className="fauxdoc__fake-h">Shipping and returns</span>
            <span className="fauxdoc__line">— Orders leave the warehouse within two days</span>
            <span className="fauxdoc__line">— Returns are free within thirty days</span>
          </div>
          <p className="example-note">
            A <span className="alt-code">span</span> in bold 20px, and two more with dashes
            typed in front. To a screen reader this is three sentences in a row: no heading to
            jump to, no list to count, no way to skim.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'The same appearance, built from real elements.',
      live: { Example: RealDoc, keys: DOC_KEYS, instruments: ['announcement-log'] },
      render: () => (
        <>
          <div className="fauxdoc">
            <h3 className="fauxdoc__real-h">Shipping and returns</h3>
            <ul className="fauxdoc__list">
              <li>Orders leave the warehouse within two days</li>
              <li>Returns are free within thirty days</li>
            </ul>
          </div>
          <p className="example-note">
            Identical on screen. Now it is announced as "heading level 3" and "list, 2 items",
            and it survives a stylesheet that fails to load.
          </p>
        </>
      ),
    },
    diff: {
      title: 'shipping.html',
      lines: [
        { kind: 'del', text: '<span class="h">Shipping and returns</span>' },
        { kind: 'del', text: '<span class="li">— Orders leave within two days</span>' },
        { kind: 'add', text: '<h2>Shipping and returns</h2>' },
        { kind: 'add', text: '<ul><li>Orders leave within two days</li></ul>' },
      ],
      note:
        'The CSS does not need to change. Restyle the real elements to look how the fake ones ' +
        'looked, and nothing is lost visually while everything is gained structurally.',
    },
    procedure: [
      'Open the page with styles turned off (in Firefox, View > Page Style > No Style). Check headings, lists, tables and form fields still read as what they are.',
      'List the headings with the accessibility inspector or a free extension such as WAVE or HeadingsMap. Check every piece of text that looks like a heading is marked up as one, and nothing else is.',
      'Inspect each list and check it uses ul, ol or dl elements, not lines of text with dashes or line breaks.',
      'Inspect each data table. Check it is built from table elements, not a grid of div elements, and that its header cells are th elements.',
      'Select each form field in the accessibility inspector and check its name comes from its visible label. Check each group of radio buttons or checkboxes sits in a fieldset with a legend, or in a group with a name.',
      'Look for meaning carried only by styling, such as bold for required fields or a shaded row for the selected item, and check the same information is in the markup or the text.',
    ],
    questions: [
      {
        question: 'Does skipping a heading level fail 1.3.1?',
        answer:
          'No. 1.3.1 asks that headings are marked up as headings. W3C’s guidance does not make skipping a level, such as h2 to h4, a failure, though an outline in order is easier to move through.',
      },
      {
        question: 'Does text that looks like a heading have to be a heading element?',
        answer:
          'Yes. If bold or large text works as a heading on screen, a screen reader user needs it marked up as one, with h1 to h6 or role="heading". Styling alone is a listed failure of 1.3.1.',
      },
      {
        question: 'Do layout tables fail 1.3.1?',
        answer:
          'Only when they claim structure they do not have, such as th elements for cells that are not headers. A layout table of plain cells does not fail 1.3.1, though CSS layout is the better choice.',
      },
    ],
  },

  {
    num: '1.3.2',
    name: 'Meaningful Sequence',
    level: 'A',
    since: '2.0',
    guideline: '1.3',
    labs: ['meaningful-sequence'],
    plain:
      'When the order of the content matters, the reading order in the markup has to match. ' +
      'CSS can move things around the screen; it does not move them in the document, and the ' +
      'document is what a screen reader and a keyboard follow.',
    fail: {
      caption: 'The visual order and the document order disagree.',
      live: { Example: ReorderedSteps, keys: STEP_KEYS, instruments: ['announcement-log'] },
      render: () => (
        <>
          <div className="seq seq--reordered">
            <span className="seq__step">
              <b>3.</b> Confirm
            </span>
            <span className="seq__step">
              <b>1.</b> Basket
            </span>
            <span className="seq__step">
              <b>2.</b> Address
            </span>
          </div>
          <p className="example-note">
            Laid out correctly with <span className="alt-code">order:</span> in flexbox. Read
            aloud, and tabbed through, it is Confirm → Basket → Address.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'Document order matches what is on screen.',
      live: { Example: OrderedSteps, keys: STEP_KEYS, instruments: ['announcement-log'] },
      render: () => (
        <>
          <div className="seq">
            <span className="seq__step">
              <b>1.</b> Basket
            </span>
            <span className="seq__step">
              <b>2.</b> Address
            </span>
            <span className="seq__step">
              <b>3.</b> Confirm
            </span>
          </div>
          <p className="example-note">
            The source is in the order the reader experiences. Flex and grid stay for layout,
            not for sequence — reordering properties are a presentation tool, not a content one.
          </p>
        </>
      ),
    },
    procedure: [
      'Read the page and note where order carries meaning: the steps of a set of instructions, a question and its answer, a price and what it is for.',
      'Turn styles off (in Firefox, View > Page Style > No Style) and read the page from top to bottom. Check each sequence you noted still reads in an order that makes sense.',
      'Inspect the CSS for content moved on screen: the order property in flexbox, grid placement, absolute positioning or floats. Check each moved item still makes sense where it sits in the source.',
      'Turn on a screen reader (NVDA on Windows, VoiceOver on a Mac) and let it read the page through. Check it never reads an item out of place, such as a label after its field or step 3 before step 2.',
      'Look for layout made with spaces or tabs, such as columns lined up with space characters. With styles off, text arranged that way reads as one jumbled line.',
    ],
    questions: [
      {
        question: 'Does 1.3.2 need the source order to match the visual order?',
        answer:
          'Only where the order changes the meaning. A sidebar can come before or after the main content in the source, but the steps of a recipe have to come in the order they are done.',
      },
      {
        question: 'Does CSS reordering with flexbox fail 1.3.2?',
        answer:
          'Only when it changes the meaning. Moving a picture beside its text is fine. Moving the second paragraph of an argument above the first is not, because a screen reader reads the source order.',
      },
      {
        question: 'Is 1.3.2 the same as focus order?',
        answer:
          'No. 1.3.2 covers the order in which all content is read. 2.4.3 Focus Order covers the order in which keyboard focus moves between controls.',
      },
    ],
  },

  {
    num: '1.3.3',
    name: 'Sensory Characteristics',
    level: 'A',
    since: '2.0',
    guideline: '1.3',
    labs: ['sensory-instruction'],
    plain:
      'Instructions cannot depend on shape, size, position, or sound alone. "The button on the ' +
      'right" means nothing to someone listening to the page, and nothing on a phone where it ' +
      'is now underneath.',
    fail: {
      caption: 'The instruction relies on where things happen to sit.',
      live: {
        Example: () => <CheckoutStep named={false} />,
        keys: STEP_SENSE_KEYS,
        instruments: ['vision-filter', 'announcement-log'],
      },
      render: () => (
        <>
          <p className="example-prose">
            Fill in the panel on the left, then press the round green button below it to
            continue.
          </p>
          <p className="example-note">
            Three sensory references and no name. On a narrow screen there is no "left"; to a
            screen reader there is no "round"; in greyscale there is no "green".
          </p>
        </>
      ),
    },
    pass: {
      caption: 'The instruction names the thing.',
      live: {
        Example: () => <CheckoutStep named />,
        keys: STEP_SENSE_KEYS,
        instruments: ['vision-filter', 'announcement-log'],
      },
      render: () => (
        <>
          <p className="example-prose">
            Fill in <b>Delivery details</b>, then press <b>Continue to payment</b>.
          </p>
          <p className="example-note">
            Position and colour can still help — "the green Continue to payment button on the
            left" is fine. What must not happen is position and colour being the *only* way to
            identify it.
          </p>
        </>
      ),
    },
    procedure: [
      'Find every instruction on the page: form help, error messages, onboarding hints, tutorial text.',
      'Mark each instruction that relies on how something looks, where it sits or how it sounds: "the round button", "the menu on the left", "the large box", "when you hear the beep".',
      'For each one, check it also names the thing by text a person can find without seeing or hearing it, such as the button label "Next".',
      'Turn on a screen reader (NVDA on Windows, VoiceOver on a Mac), follow each instruction without looking at the screen, and check you can find what it points to.',
      'Check that words such as "above" or "below" point to content just before or after in reading order, so the reference still works in a screen reader.',
    ],
    questions: [
      {
        question: 'Can instructions say "select the round arrow"?',
        answer:
          'Only when they also give the control’s label, such as "select Next, the round arrow". Shape and position help people who can see them, but cannot be the only way to find the control.',
      },
      {
        question: 'Can I write "see the links below"?',
        answer:
          'Yes, when the links come right after the sentence in reading order. "Below" then matches what a screen reader reaches next, so the reference does not depend on seeing the layout.',
      },
      {
        question: 'Does 1.3.3 cover instructions that rely on colour?',
        answer:
          'No. Colour is covered by 1.4.1 Use of Color. 1.3.3 covers shape, size, position, orientation and sound.',
      },
    ],
  },

  {
    num: '1.3.4',
    name: 'Orientation',
    level: 'AA',
    since: '2.1',
    guideline: '1.3',
    labs: ['orientation'],
    gist: 'Do not lock the screen to portrait or landscape unless that orientation is essential.',
    plain:
      'Do not lock the screen to portrait or landscape unless the orientation is essential — a ' +
      'piano keyboard, a cheque scanner. Someone whose wheelchair mount holds their phone ' +
      'sideways cannot simply turn it.',
    fail: {
      caption: 'The app refuses to work sideways.',
      live: { Example: LockedOrder, ...ORIENT_LIVE },
      render: () => (
        <>
          <div className="orient">
            <span className="orient__device orient__device--land">
              <span className="orient__msg">Please rotate your device</span>
            </span>
          </div>
          <p className="example-note">
            A content page with nothing orientation-specific about it, blocking half its
            readers on a preference.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'The same content reflows to whatever shape it is given.',
      live: { Example: AdaptingOrder, ...ORIENT_LIVE },
      render: () => (
        <>
          <div className="orient">
            <span className="orient__device orient__device--port">
              <span className="orient__bar" />
              <span className="orient__bar" />
            </span>
            <span className="orient__device orient__device--land">
              <span className="orient__bar" />
              <span className="orient__bar" />
            </span>
          </div>
          <p className="example-note">
            Both orientations work. This is the same discipline as 1.4.10 Reflow — if the
            layout responds to its container, orientation stops being a special case.
          </p>
        </>
      ),
    },
    procedure: [
      'Open the page on a phone or tablet with rotation lock off, or use the device toolbar in Chrome or Firefox DevTools, which has a rotate button.',
      'Load the page in portrait, then rotate to landscape. Check the content turns with the screen and nothing asks you to rotate back.',
      'Load the page in landscape, then rotate to portrait, and check the same.',
      'In each orientation, use the page: open the menus, fill in a form field, play a video. Check everything works.',
      'Search the CSS and scripts for orientation locks, such as screen.orientation.lock() or a media query that hides the content in one orientation, and check each has a reason that is essential.',
    ],
    questions: [
      {
        question: 'Does a "please rotate your device" message fail 1.3.4?',
        answer:
          'Yes. W3C lists it as a failure. A person whose tablet is fixed to a wheelchair may not be able to rotate it.',
      },
      {
        question: 'Do I have to design a separate layout for each orientation?',
        answer:
          'No. 1.3.4 asks only that the content is not locked to one orientation. The layout can change with the screen, as long as it shows and works either way.',
      },
      {
        question: 'When is locking the orientation allowed?',
        answer:
          'Only when one orientation is essential, such as a piano keyboard app, a banking app that photographs a cheque, or slides made for a projector.',
      },
    ],
  },

  {
    num: '1.3.5',
    name: 'Identify Input Purpose',
    level: 'AA',
    since: '2.1',
    guideline: '1.3',
    labs: ['input-purpose'],
    gist: 'Fields asking for the user’s own details must say in the markup what each one is for.',
    plain:
      'Fields collecting the user’s own information — name, email, address, phone — need to ' +
      'say which is which in the markup, via autocomplete. That is what lets a browser fill ' +
      'them, and what lets assistive tools show familiar icons or wording instead of yours.',
    fail: {
      caption: 'Nothing tells the browser what these fields are for.',
      live: {
        Example: UntaggedFields,
        keys: FIELD_KEYS,
        instruments: ['autofill', 'announcement-log'],
      },
      render: () => (
        <>
          <p className="swatch-label">Contact</p>
          <div aria-hidden="true" className="swatch-field border--strong">
            Full name
          </div>
          <div aria-hidden="true" className="swatch-field border--strong" style={{ marginTop: '0.5rem' }}>
            Email
          </div>
          <p className="example-note">
            Correctly labelled, and still unfillable. Someone with a motor or memory impairment
            retypes their details on every site, every time.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'Each field declares its purpose from the standard list.',
      live: {
        Example: TaggedFields,
        keys: FIELD_KEYS,
        instruments: ['autofill', 'announcement-log'],
      },
      render: () => (
        <>
          <p className="swatch-label">Contact</p>
          <div aria-hidden="true" className="swatch-field border--strong">
            Full name
          </div>
          <div aria-hidden="true" className="swatch-field border--strong" style={{ marginTop: '0.5rem' }}>
            Email
          </div>
          <p className="example-note">
            <span className="alt-code">autocomplete="name"</span> and{' '}
            <span className="alt-code">autocomplete="email"</span>. The tokens are a fixed
            vocabulary, not free text — inventing one silently does nothing.
          </p>
        </>
      ),
    },
    diff: {
      title: 'contact.html',
      lines: [
        { kind: 'del', text: '<input id="name" type="text">' },
        { kind: 'add', text: '<input id="name" type="text" autocomplete="name">' },
        { kind: 'del', text: '<input id="email" type="text">' },
        { kind: 'add', text: '<input id="email" type="email" autocomplete="email">' },
      ],
      note:
        'The input type matters too: type="email" gets the right keyboard on a phone and the ' +
        'right validation everywhere.',
    },
    procedure: [
      'List every form field that asks for information about the person filling it in: name, email, phone, address, date of birth, card details, username.',
      'Inspect each field and read its autocomplete attribute. Check it is there and has the value that matches the field, such as autocomplete="email" or autocomplete="postal-code".',
      'Check each value against the list of input purposes in WCAG, which uses the HTML autofill names. A misspelt or made-up value does nothing, and fails.',
      'Fill the form in with your browser’s autofill. Check each field gets the right information.',
    ],
    questions: [
      {
        question: 'Does 1.3.5 apply to fields about someone else?',
        answer:
          'No. It covers fields that ask about the person using the form. A field for a friend’s email address in a referral form does not need to identify its purpose.',
      },
      {
        question: 'Does every form field need an autocomplete attribute?',
        answer:
          'No. Only fields whose purpose is on the WCAG list of input purposes. A search box or a comment field has no matching purpose, so it needs none.',
      },
      {
        question: 'Is a visible label enough to pass 1.3.5?',
        answer:
          'No. A label tells people what the field is for. 1.3.5 asks that software can tell too, through the autocomplete attribute, so a browser can fill the field in for people who find typing hard.',
      },
    ],
  },
];
