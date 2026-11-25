import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { announce, spoken } from '../src/labs/announce';
import { FE_START, feSaid, feVerdict, type FormErrors } from '../src/labs/formErrors';
import { FormErrorsMock } from '../src/labs/FormErrorsLab';
import { FL_START, flSaid, flVerdict, onScreen, type FormLabels } from '../src/labs/formLabels';
import { FormLabelsMock } from '../src/labs/FormLabelsLab';
import { parseMarkup } from './markup';

/**
 * The 3.3.1 and 3.3.2 labs (#52). Each mock is read by the announcement log from its own markup;
 * the expected lines are written out by hand from how screen readers voice a form field.
 */

const errorsLog = (f: FormErrors) =>
  announce(parseMarkup(renderToStaticMarkup(<FormErrorsMock f={f} id="e" />))).map(spoken);
const labelsLog = (f: FormLabels) =>
  announce(parseMarkup(renderToStaticMarkup(<FormLabelsMock f={f} id="l" />))).map(spoken);

describe('3.3.1: how the error is shown', () => {
  it('starts unsubmitted, with a red-border-only error that fails', () => {
    expect(errorsLog(FE_START)).toEqual(['Email', 'Email, edit text']);
    expect(feVerdict(FE_START)).toEqual({ criterion: '3.3.1', passes: false });
  });

  it('a red border says nothing more than before the form was submitted', () => {
    const f: FormErrors = { shown: 'border', submitted: true };
    expect(errorsLog(f)).toEqual(['Email', 'Email, edit text']);
    expect(feSaid(f, announce(parseMarkup(renderToStaticMarkup(<FormErrorsMock f={f} id="e" />))))).toBe(
      'Screen reader says: Email; Email, edit text. The field turned red, and nothing says so in text.',
    );
  });

  it('text tied to the field is said with it, and passes', () => {
    const f: FormErrors = { shown: 'text', submitted: true };
    expect(errorsLog(f)).toEqual([
      'Email',
      'Email, edit text, invalid entry, Enter an address that includes a domain',
      'Enter an address that includes a domain',
    ]);
    expect(feVerdict(f).passes).toBe(true);
  });

  it('shows no error text until the form is submitted', () => {
    expect(errorsLog({ shown: 'text', submitted: false })).toEqual(['Email', 'Email, edit text']);
    const f: FormErrors = { shown: 'text', submitted: false };
    const lines = announce(parseMarkup(renderToStaticMarkup(<FormErrorsMock f={f} id="e" />)));
    expect(feSaid(f, lines)).toBe('Screen reader says: Email; Email, edit text. Not submitted yet.');
  });
});

describe('3.3.2: placeholder or label', () => {
  it('starts as a placeholder only, which fails', () => {
    expect(labelsLog(FL_START)).toEqual(['Date of birth, edit text']);
    expect(flVerdict(FL_START)).toEqual({ criterion: '3.3.2', passes: false });
    expect(onScreen(FL_START)).toBe('On screen: “Date of birth”, as a placeholder in the field.');
  });

  it('once typing starts, the placeholder label is gone from the screen', () => {
    const f: FormLabels = { shown: 'placeholder', typed: '3/27' };
    expect(onScreen(f)).toBe('On screen: no label. The placeholder went when typing started.');
  });

  it('a visible label with the format stated passes, and is said with the field', () => {
    const f: FormLabels = { shown: 'label', typed: '27 3 1995' };
    const lines = announce(parseMarkup(renderToStaticMarkup(<FormLabelsMock f={f} id="l" />)));
    expect(lines.map(spoken)).toEqual([
      'Date of birth',
      'For example, 27 3 1995',
      'Date of birth, edit text, For example, 27 3 1995',
    ]);
    expect(flVerdict(f).passes).toBe(true);
    expect(flSaid(f, lines)).toBe(
      'Screen reader says: Date of birth; For example, 27 3 1995; ' +
        'Date of birth, edit text, For example, 27 3 1995. ' +
        'On screen: “Date of birth” and “For example, 27 3 1995”, above the field.',
    );
  });
});
