import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { announce, liveRegionLines, spoken, type AxNode } from '../src/labs/announce';
import { basketMessage, statusSaid, statusVerdict, toggleSaid } from '../src/labs/statusMessage';
import { StatusMock } from '../src/labs/StatusLab';
import { parseMarkup } from './markup';

/**
 * The 4.1.3 lab (#51): a mock "added to basket" message that is a status region or plain text.
 * A screen reader announces a status region's new text without focus moving; plain text that
 * changes is never said. Expected text is written out by hand.
 */

const mock = (inRegion: boolean, count: number, message: string): AxNode =>
  parseMarkup(renderToStaticMarkup(<StatusMock inRegion={inRegion} count={count} message={message} />));

describe('the message', () => {
  it('says how many items are in the basket', () => {
    expect(basketMessage(4)).toBe('Added. 4 items in basket.');
  });

  it('in a status region, is announced', () => {
    expect(liveRegionLines(mock(true, 4, basketMessage(4))).map(spoken)).toEqual([
      'Added. 4 items in basket.',
    ]);
    expect(statusVerdict(true)).toEqual({ criterion: '4.1.3', passes: true });
  });

  it('as plain text, is not announced, though it is on the page', () => {
    const node = mock(false, 4, basketMessage(4));
    expect(liveRegionLines(node)).toEqual([]);
    expect(announce(node).map(spoken)).toContain('Added. 4 items in basket.');
    expect(statusVerdict(false)).toEqual({ criterion: '4.1.3', passes: false });
  });
});

describe('what the live region says', () => {
  it('after an add, what was announced, and that focus stayed put', () => {
    expect(statusSaid(['Added. 4 items in basket.'])).toBe(
      'Screen reader says: Added. 4 items in basket. Focus stayed on Add to basket.',
    );
    expect(statusSaid([])).toBe('Screen reader says nothing. Focus stayed on Add to basket.');
  });

  it('after the message is moved in or out of a status region', () => {
    expect(toggleSaid(true)).toBe('The message is in a status region now.');
    expect(toggleSaid(false)).toBe('The message is plain text now.');
  });
});
