import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { announce, spoken } from '../src/labs/announce';
import {
  ES_START,
  esSaid,
  esVerdict,
  isDayMonthYear,
  type ErrorSuggestion,
} from '../src/labs/errorSuggestion';
import { ErrorSuggestionMock } from '../src/labs/ErrorSuggestionLab';
import { OI_START, oiChoose, oiGo, oiVerdict, oiWhen } from '../src/labs/onInput';
import { EP_START, epBack, epConfirm, epGuard, epPay, epUndo, epVerdict } from '../src/labs/errorPrevention';
import { parseMarkup } from './markup';

/**
 * The 3.2.2, 3.3.3 and 3.3.4 labs (#59). Expected sentences are written out by hand from the
 * design of each lab, and the logged lines from how screen readers voice a form field.
 */

const suggestionLines = (s: ErrorSuggestion) =>
  announce(parseMarkup(renderToStaticMarkup(<ErrorSuggestionMock s={s} id="s" />)));

describe('3.3.3: what the error says', () => {
  it('starts unsubmitted with the vague message chosen, which fails', () => {
    expect(suggestionLines(ES_START).map(spoken)).toEqual(['Date', 'Date, edit text, 05/03/26']);
    expect(esVerdict(ES_START)).toEqual({ criterion: '3.3.3', passes: false });
  });

  it('submitted with the vague message, the field is flagged and nothing says how to fix it', () => {
    const s: ErrorSuggestion = { message: 'vague', submitted: true };
    const lines = suggestionLines(s);
    expect(lines.map(spoken)).toEqual([
      'Date',
      'Date, edit text, invalid entry, 05/03/26, Invalid input',
      'Invalid input',
    ]);
    expect(esSaid(s, lines)).toBe(
      'Screen reader says: Date; Date, edit text, invalid entry, 05/03/26, Invalid input; Invalid input. ' +
        'It says something is wrong, not how to put it right.',
    );
  });

  it('submitted with the suggestion, the field says the format and an example, and passes', () => {
    const s: ErrorSuggestion = { message: 'suggest', submitted: true };
    const lines = suggestionLines(s);
    expect(lines.map(spoken)).toEqual([
      'Date',
      'Date, edit text, invalid entry, 05/03/26, Use DD/MM/YYYY, for example 05/03/2026',
      'Use DD/MM/YYYY, for example 05/03/2026',
    ]);
    expect(esVerdict(s).passes).toBe(true);
    expect(esSaid(s, lines)).toBe(
      'Screen reader says: Date; Date, edit text, invalid entry, 05/03/26, Use DD/MM/YYYY, for example ' +
        '05/03/2026; Use DD/MM/YYYY, for example 05/03/2026. It says how to put it right.',
    );
  });

  it('says nothing about the error before the submit', () => {
    const s: ErrorSuggestion = { message: 'suggest', submitted: false };
    expect(esSaid(s, suggestionLines(s))).toBe(
      'Screen reader says: Date; Date, edit text, 05/03/26. Not submitted yet.',
    );
  });

  it('accepts a date written day, month, year, and nothing else', () => {
    expect(isDayMonthYear('27 3 1995')).toBe(true);
    expect(isDayMonthYear('27/03/1995')).toBe(true);
    expect(isDayMonthYear('05/03/2026')).toBe(true);
    expect(isDayMonthYear('03/27/1995')).toBe(false);
    expect(isDayMonthYear('05/03/26')).toBe(false);
    expect(isDayMonthYear('32/1/2000')).toBe(false);
    expect(isDayMonthYear('')).toBe(false);
  });
});

describe('3.2.2: what changing the country does', () => {
  it('starts going to the new page by itself, which fails', () => {
    expect(OI_START).toEqual({ when: 'auto', chosen: 'uk', page: 'uk', kept: true });
    expect(oiVerdict(OI_START)).toEqual({ criterion: '3.2.2', passes: false });
  });

  it('choosing France goes to its page by itself, and the typed name is lost', () => {
    const { o, said } = oiChoose(OI_START, 'fr');
    expect(o).toEqual({ when: 'auto', chosen: 'fr', page: 'fr', kept: false });
    expect(said).toBe(
      'France chosen. The page changed to shop.example/fr/checkout by itself, and the name you typed is gone.',
    );
  });

  it('waiting for Go, choosing changes nothing else; Go then changes the page and keeps the name', () => {
    const wait = oiWhen(OI_START, 'go');
    expect(wait.said).toBe('Changing the country now waits for the Go button.');
    expect(oiVerdict(wait.o).passes).toBe(true);
    const chosen = oiChoose(wait.o, 'fr');
    expect(chosen.o).toEqual({ when: 'go', chosen: 'fr', page: 'uk', kept: true });
    expect(chosen.said).toBe('France chosen. Nothing else changed. Press Go when you are ready.');
    const gone = oiGo(chosen.o);
    expect(gone.o).toEqual({ when: 'go', chosen: 'fr', page: 'fr', kept: true });
    expect(gone.said).toBe('You pressed Go. The page changed to shop.example/fr/checkout, as you asked.');
  });

  it('says when changing the country goes by itself again', () => {
    expect(oiWhen(oiWhen(OI_START, 'go').o, 'auto').said).toBe(
      'Changing the country now goes to its page by itself.',
    );
  });
});

describe('3.3.4: a payment of £2,500.00 that should have been £250.00', () => {
  it('starts with one click that pays, which fails', () => {
    expect(EP_START).toEqual({ guard: 'none', stage: 'form', amount: 'wrong' });
    expect(epVerdict(EP_START)).toEqual({ criterion: '3.3.4', passes: false });
    const paid = epPay(EP_START);
    expect(paid.e.stage).toBe('paid');
    expect(paid.said).toBe('Paid £2,500.00 to Sam Lee. There is no way to take it back.');
  });

  it('a review step stops before paying, and going back corrects the amount', () => {
    const guarded = epGuard(EP_START, 'review');
    expect(guarded.said).toBe('Paying now shows a review step first, with a way back to correct it.');
    expect(epVerdict(guarded.e).passes).toBe(true);
    const review = epPay(guarded.e);
    expect(review.e.stage).toBe('review');
    expect(review.said).toBe(
      'Check before paying: £2,500.00 to Sam Lee. Go back to correct it, or confirm it.',
    );
    const back = epBack(review.e);
    expect(back.e).toEqual({ guard: 'review', stage: 'form', amount: 'right' });
    expect(back.said).toBe('Back on the form, with the amount corrected to £250.00.');
    const confirmed = epConfirm(epPay(back.e).e);
    expect(confirmed.e.stage).toBe('paid');
    expect(confirmed.said).toBe('Paid £250.00 to Sam Lee.');
  });

  it('an undo takes the payment back after it has gone', () => {
    const guarded = epGuard(EP_START, 'undo');
    expect(guarded.said).toBe('Paying now goes at once, with an undo for 30 minutes.');
    const paid = epPay(guarded.e);
    expect(paid.said).toBe('Paid £2,500.00 to Sam Lee. You can undo it for 30 minutes.');
    const undone = epUndo(paid.e);
    expect(undone.e.stage).toBe('undone');
    expect(undone.said).toBe('Payment undone. The £2,500.00 is back in your account.');
  });

  it('changing the safeguard starts the payment again, keeping the amount', () => {
    const paid = epPay(EP_START).e;
    expect(epGuard(paid, 'none').e).toEqual({ guard: 'none', stage: 'form', amount: 'wrong' });
    expect(epGuard(paid, 'none').said).toBe('Paying now happens in one click, with no way back.');
  });
});
