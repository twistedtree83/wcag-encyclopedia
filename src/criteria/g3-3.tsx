/**
 * Guideline 3.3 — Input Assistance.
 *
 * Forms are where accessibility failures stop being inconvenient and start costing people
 * money, appointments, and benefits. Everything here is about the moments around a mistake:
 * before it (labels), during it (identification), after it (suggestions), and instead of it
 * (prevention).
 */

import { useId, useRef, useState, type FormEvent } from 'react';
import type { CriterionRecord, LiveExample } from './types';

/*
 * 3.3.1's live examples (#52). Both forms have already been submitted once and rejected the email.
 * The broken one says so with a red border and a banner that names nothing; the fixed one names
 * the field in a summary that links to it, and ties the message to the field. Submitting the fixed
 * form again checks the email, and moves focus to it while it is still wrong.
 */

const REJECTED = 'ada@example';
const WHY = 'Enter an address that includes a domain';

function RejectedForm() {
  const id = useId();
  return (
    <form className="lform" noValidate onSubmit={(e) => e.preventDefault()}>
      <p className="lform__banner lform__banner--bad">Invalid input</p>
      <label className="lform__label" htmlFor={`${id}-email`}>
        Email
      </label>
      <input
        id={`${id}-email`}
        type="email"
        autoComplete="email"
        defaultValue={REJECTED}
        className="lform__field lform__field--bad"
      />
      <label className="lform__label" htmlFor={`${id}-post`}>
        Postcode
      </label>
      <input id={`${id}-post`} autoComplete="postal-code" defaultValue="SW1A 1AA" className="lform__field" />
      <button type="submit" className="btn p sm">
        Continue
      </button>
    </form>
  );
}

function ExplainedForm() {
  const id = useId();
  const field = useRef<HTMLInputElement>(null);
  const [bad, setBad] = useState(true);
  const toField = (e: { preventDefault(): void }) => {
    e.preventDefault();
    field.current?.focus();
  };
  const submit = (e: FormEvent) => {
    const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(field.current?.value ?? '');
    setBad(!ok);
    if (ok) e.preventDefault();
    else toField(e);
  };
  return (
    <form className="lform" noValidate onSubmit={submit}>
      {bad ? (
        <p className="lform__banner">
          1 problem:{' '}
          <a href={`#${id}-email`} onClick={toField}>
            Email — {WHY.toLowerCase()}
          </a>
        </p>
      ) : null}
      <label className="lform__label" htmlFor={`${id}-email`}>
        Email
      </label>
      <input
        ref={field}
        id={`${id}-email`}
        type="email"
        autoComplete="email"
        defaultValue={REJECTED}
        className={bad ? 'lform__field lform__field--bad' : 'lform__field'}
        {...(bad ? { 'aria-invalid': true, 'aria-describedby': `${id}-err` } : {})}
      />
      {bad ? (
        <p className="lform__err" id={`${id}-err`}>
          <span aria-hidden="true">✕ </span>
          {WHY}
        </p>
      ) : null}
      <label className="lform__label" htmlFor={`${id}-post`}>
        Postcode
      </label>
      <input id={`${id}-post`} autoComplete="postal-code" defaultValue="SW1A 1AA" className="lform__field" />
      <button type="submit" className="btn p sm">
        Continue
      </button>
    </form>
  );
}

const ERROR_KEYS: LiveExample['keys'] = ['tab', 'shift-tab', 'enter', 'read'];

/*
 * 3.3.2's live examples (#52). The broken fields are labelled by placeholders alone, and the date
 * has been typed into, so its label has already gone. The fixed fields keep visible labels, with
 * each format stated before typing and tied to its field.
 */

function PlaceholderFields() {
  return (
    <div className="lform">
      <input type="text" autoComplete="bday" placeholder="Date" defaultValue="03/27/95" className="lform__field" />
      <input type="password" autoComplete="new-password" placeholder="Password" className="lform__field" />
    </div>
  );
}

function LabelledFields() {
  const id = useId();
  return (
    <div className="lform">
      <label className="lform__label" htmlFor={`${id}-dob`}>
        Date of birth
      </label>
      <p className="lform__hint" id={`${id}-dob-hint`}>
        For example, 27 3 1995
      </p>
      <input
        id={`${id}-dob`}
        type="text"
        autoComplete="bday"
        aria-describedby={`${id}-dob-hint`}
        className="lform__field"
      />
      <label className="lform__label" htmlFor={`${id}-pw`}>
        Password
      </label>
      <p className="lform__hint" id={`${id}-pw-hint`}>
        At least 12 characters
      </p>
      <input
        id={`${id}-pw`}
        type="password"
        autoComplete="new-password"
        aria-describedby={`${id}-pw-hint`}
        className="lform__field"
      />
    </div>
  );
}

const LABEL_KEYS: LiveExample['keys'] = ['tab', 'shift-tab', 'read'];

export const G3_3: readonly CriterionRecord[] = [
  {
    num: '3.3.1',
    name: 'Error Identification',
    level: 'A',
    since: '2.0',
    guideline: '3.3',
    demos: ['errors-3-3-1'],
    labs: ['form-errors'],
    plain:
      'When input is rejected, say so in text, and say which field. A red outline is not an ' +
      'error message — it is invisible to a screen reader and to anyone who cannot distinguish ' +
      'the colour.',
    fail: {
      caption: 'A colour and a generic banner.',
      live: { Example: RejectedForm, keys: ERROR_KEYS, instruments: ['announcement-log'] },
      render: () => (
        <>
          <div className="formdemo">
            <span className="formdemo__banner formdemo__banner--bad">Invalid input</span>
            <span className="formdemo__label">Email</span>
            <span aria-hidden="true" className="swatch-field formdemo__field--bad">
              ada@example
            </span>
            <span className="formdemo__label">Postcode</span>
            <span aria-hidden="true" className="swatch-field border--strong">
              SW1A 1AA
            </span>
          </div>
          <p className="example-note">
            Which field? A screen reader user hears "Invalid input" and nothing else. Someone
            who cannot see the red border has to guess, field by field.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'The error names the field, in text, and links to it.',
      live: { Example: ExplainedForm, keys: ERROR_KEYS, instruments: ['announcement-log'] },
      render: () => (
        <>
          <div className="formdemo">
            <span className="formdemo__banner">
              1 problem: <u>Email — enter an address that includes a domain</u>
            </span>
            <span className="formdemo__label">Email</span>
            <span aria-hidden="true" className="swatch-field formdemo__field--bad">
              ada@example
            </span>
            <span className="formdemo__err">✕ Enter an address that includes a domain</span>
          </div>
          <p className="example-note">
            A summary at the top linking to each field, plus the message beside the field
            itself, tied to the input with{' '}
            <span className="alt-code">aria-describedby</span>. Colour still helps; it is no
            longer doing the work alone.
          </p>
        </>
      ),
    },
    diff: {
      title: 'checkout.html',
      lines: [
        { kind: 'del', text: '<input id="email" class="is-invalid">' },
        { kind: 'add', text: '<input id="email" aria-invalid="true" aria-describedby="email-err">' },
        { kind: 'add', text: '<p id="email-err">Enter an address that includes a domain</p>' },
      ],
      note:
        'aria-invalid states that something is wrong; aria-describedby says what. Neither is ' +
        'sufficient on its own.',
    },
  },

  {
    num: '3.3.2',
    name: 'Labels or Instructions',
    level: 'A',
    since: '2.0',
    guideline: '3.3',
    labs: ['form-labels'],
    plain:
      'Fields need labels, and any format requirement has to be stated before the reader types ' +
      'rather than after they get it wrong. A placeholder is not a label: it disappears the ' +
      'moment focus arrives, exactly when it is needed.',
    fail: {
      caption: 'Placeholders standing in for labels.',
      live: { Example: PlaceholderFields, keys: LABEL_KEYS, instruments: ['announcement-log'] },
      render: () => (
        <>
          <div className="formdemo">
            <span aria-hidden="true" className="swatch-field border--strong formdemo__ph">
              Date
            </span>
            <span aria-hidden="true" className="swatch-field border--strong formdemo__ph">
              Password
            </span>
          </div>
          <p className="example-note">
            Once typing starts the labels are gone, so nobody can check what a half-filled form
            was asking for. The format rules are unstated until the form is rejected.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'Persistent labels, with the rules stated up front.',
      live: { Example: LabelledFields, keys: LABEL_KEYS, instruments: ['announcement-log'] },
      render: () => (
        <>
          <div className="formdemo">
            <span className="formdemo__label">Date of birth</span>
            <span className="formdemo__hint">For example, 27 3 1995</span>
            <span aria-hidden="true" className="swatch-field border--strong" />
            <span className="formdemo__label">Password</span>
            <span className="formdemo__hint">At least 12 characters</span>
            <span aria-hidden="true" className="swatch-field border--strong" />
          </div>
          <p className="example-note">
            The label stays visible while typing, and the requirement is stated before it can
            be broken rather than reported afterwards.
          </p>
        </>
      ),
    },
  },

  {
    num: '3.3.3',
    name: 'Error Suggestion',
    level: 'AA',
    since: '2.0',
    guideline: '3.3',
    plain:
      'When you know what is wrong and you know how to fix it, say so. Naming the problem is ' +
      'Level A; suggesting the correction is this.',
    fail: {
      caption: 'The error names the field and stops there.',
      render: () => (
        <>
          <div className="formdemo">
            <span className="formdemo__label">Date of birth</span>
            <span className="formdemo__err">✕ Invalid date</span>
          </div>
          <p className="example-note">
            Invalid how? Wrong format, impossible day, or too far in the past? The reader is
            left to guess, and each guess costs another submission.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'The error says what to do instead.',
      render: () => (
        <>
          <div className="formdemo">
            <span className="formdemo__label">Date of birth</span>
            <span className="formdemo__err">
              ✕ Enter the date as day, month, year — for example 27 3 1995
            </span>
          </div>
          <p className="example-note">
            Where a value is nearly right, offer it: "Did you mean SW1A 1AA?". Where suggesting
            a correction would leak information — a wrong password — the exemption applies and
            you say nothing more.
          </p>
        </>
      ),
    },
  },

  {
    num: '3.3.4',
    name: 'Error Prevention (Legal, Financial, Data)',
    level: 'AA',
    since: '2.0',
    guideline: '3.3',
    plain:
      'For anything legally binding, financial, or destructive, give the reader a way out: make ' +
      'it reversible, check the input and let them correct it, or offer a confirmation step ' +
      'they must actively take.',
    fail: {
      caption: 'One irreversible click.',
      render: () => (
        <>
          <div className="press">
            <span className="press__btn press__btn--bad">Delete all records</span>
            <span className="press__note">immediate · permanent</span>
          </div>
          <p className="example-note">
            No review, no undo, no confirmation. A mis-tap — the thing 2.5.8 exists to reduce —
            is unrecoverable here.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'Review, confirm, and a window to undo.',
      render: () => (
        <>
          <div className="formdemo">
            <span className="formdemo__banner">Review before deleting — 1,240 records</span>
            <span className="formdemo__hint">Type DELETE to confirm</span>
            <span className="notice">
              <span>Deleted. You can restore these for 30 days.</span>
            </span>
          </div>
          <p className="example-note">
            Any one of the three mechanisms satisfies the criterion. Reversibility is the
            kindest, because it is the only one that still works after the mistake is made.
          </p>
        </>
      ),
    },
  },

  {
    num: '3.3.7',
    name: 'Redundant Entry',
    level: 'A',
    since: '2.2',
    guideline: '3.3',
    plain:
      'Do not ask for the same information twice in one process. Either carry it forward or ' +
      'offer it for selection. New in WCAG 2.2. Re-entry is a memory and dexterity tax, and it ' +
      'is a pure one — the site already has the answer.',
    fail: {
      caption: 'The address is typed twice.',
      render: () => (
        <>
          <div className="formdemo">
            <span className="formdemo__label">Step 2 — Delivery address</span>
            <span aria-hidden="true" className="swatch-field border--strong">
              12 Cotton Row, Leeds
            </span>
            <span className="formdemo__label">Step 4 — Billing address</span>
            <span aria-hidden="true" className="swatch-field border--strong" />
          </div>
          <p className="example-note">
            Two steps apart, so it has to be remembered as well as retyped. Someone using a
            switch may spend several minutes on the second copy.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'It is offered back rather than asked for again.',
      render: () => (
        <>
          <div className="formdemo">
            <span className="formdemo__label">Step 4 — Billing address</span>
            <span className="formdemo__hint">☑ Same as delivery — 12 Cotton Row, Leeds</span>
            <span className="formdemo__hint">Or enter a different address</span>
          </div>
          <p className="example-note">
            Auto-populated, or offered as a choice. The exemptions are narrow: re-entry is
            allowed where it is essential, such as confirming a new password.
          </p>
        </>
      ),
    },
  },

  {
    num: '3.3.8',
    name: 'Accessible Authentication (Minimum)',
    level: 'AA',
    since: '2.2',
    guideline: '3.3',
    plain:
      'Signing in must not depend on a cognitive function test — remembering a password, ' +
      'transcribing a code, solving a puzzle — unless there is an alternative, a mechanism to ' +
      'help, or the test is recognising an object or a photo you provided. New in WCAG 2.2, and ' +
      'this is the one that outlaws blocking paste into password fields.',
    fail: {
      caption: 'A puzzle, and paste disabled.',
      render: () => (
        <>
          <div className="formdemo">
            <span className="formdemo__label">Password</span>
            <span aria-hidden="true" className="swatch-field border--strong formdemo__ph">
              paste disabled
            </span>
            <span className="formdemo__hint">Select every square with a bus</span>
          </div>
          <p className="example-note">
            Blocking paste breaks password managers, which is the mechanism that made the
            memory test survivable. The image puzzle is a second cognitive test on top.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'Paste allowed, and a route that tests nothing.',
      render: () => (
        <>
          <div className="formdemo">
            <span className="formdemo__label">Password</span>
            <span aria-hidden="true" className="swatch-field border--strong" />
            <span className="formdemo__hint">
              Paste and autofill work · or sign in with a passkey · or email me a link
            </span>
          </div>
          <p className="example-note">
            Allowing paste is the single highest-value change and costs one deleted event
            handler. Passkeys and emailed links remove the memory test altogether.
          </p>
        </>
      ),
    },
    diff: {
      title: 'signin.js',
      lines: [
        { kind: 'del', text: "password.addEventListener('paste', (e) => e.preventDefault());" },
        { kind: 'add', text: '// Password managers are the accommodation. Do not block them.' },
      ],
      note:
        'Deleting this line is a net security gain too — blocking paste pushes people towards ' +
        'passwords short enough to type from memory.',
    },
  },
];
