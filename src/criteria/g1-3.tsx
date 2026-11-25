/**
 * Guideline 1.3 — Adaptable.
 *
 * The through-line: structure has to survive losing the presentation. If the only thing making
 * a heading a heading is that it is big and bold, then it is not a heading — it is large text,
 * and nothing but a sighted reader will ever know it was meant as one.
 */

import { useId } from 'react';
import type { CriterionRecord, LiveExample } from './types';
import { OrderPage } from '../labs/OrientationLab';
import { PHONE } from '../labs/orientation';

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
  },

  {
    num: '1.3.4',
    name: 'Orientation',
    level: 'AA',
    since: '2.1',
    guideline: '1.3',
    labs: ['orientation'],
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
  },

  {
    num: '1.3.5',
    name: 'Identify Input Purpose',
    level: 'AA',
    since: '2.1',
    guideline: '1.3',
    labs: ['input-purpose'],
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
  },
];
