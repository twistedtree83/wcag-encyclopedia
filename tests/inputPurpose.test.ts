import { describe, it, expect } from 'vitest';
import { autofillValue, ipSaid, ipVerdict, purposeOf, IP_START } from '../src/labs/input-purpose/inputPurpose';

/**
 * Identify Input Purpose (#49): which autocomplete values name a purpose a browser can fill, and
 * the 1.3.5 lab's verdict. Valid tokens come from the HTML autofill field names that WCAG's
 * "Input Purposes for User Interface Components" list is drawn from; the invented ones are
 * common mistakes, written out by hand.
 */

describe('purposeOf', () => {
  it.each([
    ['name', 'name'],
    ['email', 'email'],
    ['tel', 'tel'],
    ['shipping street-address', 'street-address'],
    ['section-a billing postal-code', 'postal-code'],
    ['work email', 'email'],
    [' EMAIL ', 'email'],
  ])('reads %j as the purpose %j', (attr, purpose) => {
    expect(purposeOf(attr)).toBe(purpose);
  });

  it.each(['', 'full-name', 'e-mail', 'phone', 'on', 'off', 'yes'])(
    'gives no purpose for %j',
    (attr) => {
      expect(purposeOf(attr)).toBeNull();
    },
  );

  it('gives no purpose when the attribute is missing', () => {
    expect(purposeOf(undefined)).toBeNull();
  });
});

describe('the simulated autofill', () => {
  it('fills a field only when its purpose is one it knows', () => {
    expect(autofillValue('name')).toBe('Ada Lovelace');
    expect(autofillValue('email')).toBe('ada@example.com');
    expect(autofillValue('full-name')).toBe('');
    expect(autofillValue(undefined)).toBe('');
  });
});

describe('the 1.3.5 lab', () => {
  it('starts failing, with no purposes', () => {
    expect(ipVerdict(IP_START)).toEqual({ criterion: '1.3.5', passes: false });
  });

  it('fails while any field has an invented token', () => {
    expect(ipVerdict({ name: 'right', email: 'invented', tel: 'right' }).passes).toBe(false);
  });

  it('passes when every field names its purpose from the standard list', () => {
    expect(ipVerdict({ name: 'right', email: 'right', tel: 'right' }).passes).toBe(true);
  });

  it('says how many fields the autofill filled, and which it could not', () => {
    expect(ipSaid({ name: 'right', email: 'invented', tel: 'none' })).toBe(
      'Autofill filled 1 of 3 fields. It could not tell what Email and Phone are for.',
    );
    expect(ipSaid({ name: 'right', email: 'right', tel: 'right' })).toBe(
      'Autofill filled 3 of 3 fields.',
    );
  });
});
