import { useId, useState } from 'react';
import { AA_LENGTH, AA_START, METHODS, aaOnScreen, aaVerdict, type AccessibleAuth } from './accessibleAuth';
import { LabShell, type Said } from '../shared/LabShell';
import { Choice } from '../name-role-value/NameRoleValueLab';

/**
 * The 3.3.8 lab (#60): the reader chooses what a mock sign-in asks of them, then tries to fill it
 * from a password manager. Only a password that allows paste is filled; a passkey or emailed link
 * has nothing to fill, and tests nothing.
 *
 * The mock is drawn, with no real field in it: it never asks for a credential.
 */

type Model = { readonly a: AccessibleAuth; readonly said: Said | null };

const START: Model = { a: AA_START, said: null };

/** The sign-in as drawn for the reader's choice, after any fill. */
export function AccessibleAuthMock({ a }: { readonly a: AccessibleAuth }) {
  if (a.method === 'passkey') {
    return (
      <div className="lform">
        <span className="btn p sm">Sign in with a passkey</span>
        <span className="btn o sm">Email me a sign-in link</span>
      </div>
    );
  }
  if (a.method === 'puzzle') {
    return (
      <div className="lform">
        <span className="lform__label">Type the letters in the picture</span>
        <span className="lform__puzzle">
          {['k', 'X', '7', 'q', 'P'].map((c) => (
            <span key={c}>{c}</span>
          ))}
        </span>
        <span className="swatch-field border--strong" />
        <span className="btn p sm">Sign in</span>
      </div>
    );
  }
  const filled = a.filled && a.method === 'paste';
  return (
    <div className="lform">
      <span className="lform__label">Password</span>
      <span className="swatch-field border--strong">{filled ? '•'.repeat(AA_LENGTH) : null}</span>
      {a.method === 'blocked' ? (
        <span className={a.filled ? 'lform__err' : 'lform__hint'}>
          {a.filled ? '✕ Paste blocked' : 'Paste is turned off'}
        </span>
      ) : (
        <span className="lform__hint">Paste and password managers work</span>
      )}
      <span className="btn p sm">Sign in</span>
    </div>
  );
}

export function AccessibleAuthLab() {
  const id = useId();
  const [{ a, said }, setModel] = useState<Model>(START);
  const change = (next: AccessibleAuth) => setModel({ a: next, said: { text: aaOnScreen(next) } });

  return (
    <LabShell className="lab flab auth-lab" verdict={aaVerdict(a)} said={said} onReset={() => setModel(START)}>
      <div className="lab__mock flab__mock" data-lab-mock aria-hidden="true" inert>
        <AccessibleAuthMock a={a} />
      </div>

      <div className="lab-controls">
        <Choice
          name={`${id}-method`}
          legend="Signing in asks for"
          options={METHODS}
          value={a.method}
          onChange={(method) => change({ method, filled: false })}
        />
        <button type="button" className="btn o sm" onClick={() => change({ ...a, filled: true })}>
          Fill from a password manager
        </button>
      </div>

      <div className="lab-out">
        <output className="flab__screen" aria-live="off">
          {aaOnScreen(a)}
        </output>
      </div>
    </LabShell>
  );
}
