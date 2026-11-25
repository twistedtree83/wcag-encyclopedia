import { describe, it, expect } from 'vitest';
import { LIN_START, linName, linSaid, linVerdict, voiceMatches } from '../src/labs/labelInName';

/**
 * Label in Name (#49): does a voice command made of the visible label ("click Send") match the
 * control's accessible name? Matching is by whole words, in order, ignoring case and
 * punctuation, as voice-control software matches. Cases are written out by hand.
 */

describe('voiceMatches', () => {
  it.each([
    ['Send', 'Send', true],
    ['Send', 'Send message to support', true],
    ['send', 'Send!', true],
    ['Send message', 'Send a message', false],
    ['Send', 'Submit form', false],
    ['Send', 'Resend', false],
    ['', 'Send', false],
  ])('%j in %j: %s', (phrase, name, expected) => {
    expect(voiceMatches(phrase, name)).toBe(expected);
  });
});

describe('the 2.5.3 lab', () => {
  it('starts failing: the aria-label replaces the visible text', () => {
    expect(linName(LIN_START)).toBe('Submit form');
    expect(linVerdict(LIN_START)).toEqual({ criterion: '2.5.3', passes: false });
  });

  it('passes when the aria-label is removed, or contains the visible text', () => {
    expect(linName({ visible: 'Send', ariaLabel: '' })).toBe('Send');
    expect(linVerdict({ visible: 'Send', ariaLabel: '' }).passes).toBe(true);
    expect(linVerdict({ visible: 'Send', ariaLabel: 'Send message to support' }).passes).toBe(true);
  });

  it('fails when the button has no visible text to say', () => {
    expect(linVerdict({ visible: ' ', ariaLabel: 'Send' }).passes).toBe(false);
  });

  it('says what the voice command did', () => {
    expect(linSaid(LIN_START)).toBe(
      'You said “click Send”. Nothing happened: the button’s name is “Submit form”.',
    );
    expect(linSaid({ visible: 'Send', ariaLabel: 'Send message to support' })).toBe(
      'You said “click Send”. It clicked “Send message to support”.',
    );
    expect(linSaid({ visible: '', ariaLabel: 'Send' })).toBe(
      'The button shows no text, so there is nothing to say.',
    );
  });
});
