import { describe, it, expect } from 'vitest';
import {
  ORDER_START,
  focusOrder,
  orderSaid,
  orderVerdict,
  type Order,
} from '../src/labs/focusOrder';
import { orderFromSearch, searchFromOrder } from '../src/labs/orderQuery';

/**
 * The 2.4.3 flagship lab's model (#46): a five-part form laid out in a fixed grid (Name and Email,
 * then Phone and Postcode, then Send). The reader picks the source order and whether one part
 * gets a positive tabindex. Expected orders are worked out by hand from the HTML focus navigation
 * rule: positive tabindex first, then source order.
 */

const order = (patch: Partial<Order>): Order => ({ ...ORDER_START, ...patch });

describe('the focus order lab', () => {
  it('starts with the source matching the layout and no tabindex, and passes', () => {
    expect(ORDER_START).toEqual({ source: 'layout', lift: 'none' });
    expect(focusOrder(ORDER_START)).toEqual(['name', 'email', 'phone', 'postcode', 'send']);
    expect(orderVerdict(ORDER_START)).toEqual({ criterion: '2.4.3', passes: true });
  });

  it('a source written column by column goes down before it goes across', () => {
    expect(focusOrder(order({ source: 'columns' }))).toEqual([
      'name',
      'phone',
      'email',
      'postcode',
      'send',
    ]);
    expect(orderVerdict(order({ source: 'columns' })).passes).toBe(false);
  });

  it('tabindex="1" on Send pulls it ahead of everything', () => {
    expect(focusOrder(order({ lift: 'send' }))).toEqual([
      'send',
      'name',
      'email',
      'phone',
      'postcode',
    ]);
    expect(orderVerdict(order({ lift: 'send' })).passes).toBe(false);
  });

  it('a positive tabindex does not repair a scrambled source', () => {
    expect(focusOrder(order({ source: 'send-first', lift: 'postcode' }))).toEqual([
      'postcode',
      'send',
      'name',
      'email',
      'phone',
    ]);
    expect(orderVerdict(order({ source: 'send-first', lift: 'postcode' })).passes).toBe(false);
  });

  it('says the focus order and whether it follows the layout', () => {
    expect(orderSaid(ORDER_START)).toBe(
      'Focus goes Name, Email, Phone, Postcode, Send. It follows the layout.',
    );
    expect(orderSaid(order({ source: 'columns' }))).toBe(
      'Focus goes Name, Phone, Email, Postcode, Send. It leaves the layout at stop 2.',
    );
  });
});

describe('the focus order lab in the URL', () => {
  it('writes nothing for the start, and both values otherwise', () => {
    expect(searchFromOrder(ORDER_START)).toBe('');
    expect(searchFromOrder(order({ lift: 'send' }))).toBe('?src=layout&ti=send');
    expect(searchFromOrder(order({ source: 'columns' }))).toBe('?src=columns&ti=none');
  });

  it('reads back what it wrote, and ignores what it does not know', () => {
    expect(orderFromSearch('?src=send-first&ti=postcode')).toEqual({
      source: 'send-first',
      lift: 'postcode',
    });
    expect(orderFromSearch('?ti=send')).toEqual({ source: 'layout', lift: 'send' });
    expect(orderFromSearch('?src=sideways&ti=9')).toBeNull();
    expect(orderFromSearch('')).toBeNull();
  });
});
