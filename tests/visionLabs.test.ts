import { describe, it, expect } from 'vitest';
import { UC_START, ucState } from '../src/labs/useOfColour';
import { NT_START, ntState } from '../src/labs/nonText';
import { SENSE_START, senseState } from '../src/labs/sensory';

/**
 * The vision-filter labs (#56): 1.4.1 (links and an error marked by hue), 1.4.11 (fading control
 * edges) and 1.3.3 (an instruction that points by sight). Ratios are worked by hand from the WCAG
 * formula; sentences are written out as the design says them.
 */

describe('the 1.4.1 lab', () => {
  it('starts failing: the links and the error differ from their neighbours by hue alone', () => {
    const s = ucState(UC_START);
    expect(s.verdict).toEqual({ criterion: '1.4.1', passes: false });
    expect(s.cues.map((c) => c.found)).toEqual([false, false]);
    expect(s.cues[1]!.line).toBe(
      'The field in error: 1.34 : 1 against the field beside it, needs 3 : 1. Lost.',
    );
  });

  it('passes once the links are underlined and the error carries an icon', () => {
    const s = ucState({ ...UC_START, underline: true, icon: true });
    expect(s.verdict.passes).toBe(true);
    expect(s.cues.map((c) => c.found)).toEqual([true, true]);
  });

  it('still fails with only one of the two fixed', () => {
    expect(ucState({ ...UC_START, underline: true }).verdict.passes).toBe(false);
  });

  it('says the view and each cue', () => {
    const s = ucState({ ...UC_START, filter: 'greyscale', underline: true });
    expect(s.said).toBe(
      'Greyscale. The links: 1.32 : 1 against the text around them, and underlined. Stands out. ' +
        'The field in error: 2.28 : 1 against the field beside it, needs 3 : 1. Lost.',
    );
  });
});

describe('the 1.4.11 lab', () => {
  it('starts with edges at 5.40 : 1 against white, passing', () => {
    const s = ntState(NT_START);
    expect(s.edge).toBe('#6A6A6A');
    expect(s.ratioText).toBe('5.40 : 1');
    expect(s.verdict).toEqual({ criterion: '1.4.11', passes: true });
  });

  it('fails at half faded: #B5B5B5 is 2.05 : 1', () => {
    const s = ntState({ ...NT_START, faded: 50 });
    expect(s.edge).toBe('#B5B5B5');
    expect(s.ratioText).toBe('2.05 : 1');
    expect(s.verdict.passes).toBe(false);
  });

  it('says how faded, the ratio, and the result', () => {
    expect(ntState({ ...NT_START, faded: 100 }).said).toBe(
      '100% faded. The edges are 1.00 : 1 against the background, in full colour. Fails borders and icons AA.',
    );
  });
});

describe('the 1.3.3 lab', () => {
  it('starts failing on an instruction that points by shape, colour and place', () => {
    const s = senseState(SENSE_START);
    expect(s.verdict).toEqual({ criterion: '1.3.3', passes: false });
    expect(s.pointsBy).toBe('shape (round), colour (green), position (on the right)');
  });

  it('passes once the instruction names the button, even if it also says where it is', () => {
    expect(senseState({ ...SENSE_START, instruction: 'named' }).verdict.passes).toBe(true);
    const both = senseState({ ...SENSE_START, instruction: 'both' });
    expect(both.verdict.passes).toBe(true);
    expect(both.pointsBy).toBe('colour (green), position (on the right)');
  });

  it('loses the green button against the red one under greyscale', () => {
    const s = senseState({ ...SENSE_START, filter: 'greyscale' });
    expect(s.cue.found).toBe(false);
  });

  it('says what is read aloud and whether it is enough', () => {
    expect(senseState(SENSE_START).said).toBe(
      'Read aloud: “Press the round green button on the right.” The buttons are Save for later and ' +
        'Continue to payment. Nothing read aloud says which one is round, green or on the right.',
    );
  });
});
