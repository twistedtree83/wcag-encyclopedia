import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { announce, spoken } from '../src/labs/shared/announce';
import {
  PARTS,
  STRUCTURE_START,
  structureExposure,
  structureSaid,
  structureVerdict,
  type Part,
  type Structure,
} from '../src/labs/structure/structure';
import { StructureMock } from '../src/labs/structure/StructureLab';
import { structureFromSearch, searchFromStructure } from '../src/labs/structure/structureQuery';
import { parseMarkup } from './markup';

/**
 * The 1.3.1 flagship lab (#48). The reader switches a mock form or table between styled divs and
 * real headings, lists, labels and table headers; the log reads the mock's own markup. Expected
 * lines are written out by hand from how screen readers voice each structure.
 */

const logOf = (s: Structure) =>
  announce(parseMarkup(renderToStaticMarkup(<StructureMock structure={s} idPrefix="m" />)));
const said = (s: Structure) => logOf(s).map(spoken);

describe('the form', () => {
  it('starts as styled divs: plain lines and unnamed fields, and fails', () => {
    expect(STRUCTURE_START).toEqual({ mock: 'form', real: [] });
    expect(said(STRUCTURE_START)).toEqual([
      'Track your order',
      'You will need:',
      '• Your order number',
      '• The postcode it went to',
      'Order number',
      'edit text',
      'Postcode',
      'edit text',
    ]);
    expect(structureVerdict(STRUCTURE_START)).toEqual({ criterion: '1.3.1', passes: false });
  });

  it('built from real elements, says a heading, a list and named fields, and passes', () => {
    const real: Structure = { mock: 'form', real: ['heading', 'list', 'labels'] };
    expect(said(real)).toEqual([
      'Track your order, heading, level 3',
      'You will need:',
      'list, 2 items',
      'Your order number',
      'The postcode it went to',
      'Order number',
      'Order number, edit text',
      'Postcode',
      'Postcode, edit text',
    ]);
    expect(structureVerdict(real).passes).toBe(true);
  });
});

describe('the table', () => {
  it('as styled divs, reads cell after cell with no table at all', () => {
    expect(said({ mock: 'table', real: [] })).toEqual([
      'Opening hours',
      'Day',
      'Hours',
      'Saturday',
      '9am to 5pm',
      'Sunday',
      'Closed',
    ]);
  });

  it('as a real table, says its size and column headers, and passes with a real heading', () => {
    const real: Structure = { mock: 'table', real: ['heading', 'headers'] };
    expect(said(real)).toEqual([
      'Opening hours, heading, level 3',
      'table, 3 rows, 2 columns',
      'Day, column header',
      'Hours, column header',
      'Saturday',
      '9am to 5pm',
      'Sunday',
      'Closed',
    ]);
    expect(structureVerdict(real).passes).toBe(true);
    expect(structureVerdict({ mock: 'table', real: ['headers', 'labels', 'list'] }).passes).toBe(false);
  });
});

/** Every subset of a mock's parts. */
const subsets = (parts: readonly Part[]): Part[][] =>
  parts.reduce<Part[][]>((acc, p) => [...acc, ...acc.map((s) => [...s, p])], [[]]);

describe('the verdict', () => {
  it('agrees with the log for every combination of real parts', () => {
    for (const mock of ['form', 'table'] as const) {
      for (const real of subsets(PARTS[mock])) {
        const s = { mock, real };
        const e = structureExposure(mock, logOf(s));
        expect(structureVerdict(s).passes, JSON.stringify(s)).toBe(PARTS[mock].every((p) => e[p]));
        for (const p of PARTS[mock]) expect(e[p], `${JSON.stringify(s)} ${p}`).toBe(real.includes(p));
      }
    }
  });
});

describe('what the live region says', () => {
  it('names what the log exposes and what is only styled', () => {
    expect(structureSaid('form', logOf(STRUCTURE_START))).toBe(
      'Only styled: heading, list and labels.',
    );
    expect(structureSaid('form', logOf({ mock: 'form', real: ['heading'] }))).toBe(
      'In the markup: heading. Only styled: list and labels.',
    );
    expect(structureSaid('table', logOf({ mock: 'table', real: ['heading', 'headers'] }))).toBe(
      'In the markup: heading and table headers. Nothing is only styled.',
    );
  });
});

describe('the URL', () => {
  it('writes nothing for the start, and round-trips other states in a fixed order', () => {
    expect(searchFromStructure(STRUCTURE_START)).toBe('');
    expect(searchFromStructure({ mock: 'table', real: ['headers', 'heading'] })).toBe(
      '?mock=table&real=heading,headers',
    );
    expect(searchFromStructure({ mock: 'form', real: ['labels'] })).toBe('?mock=form&real=labels');
    expect(structureFromSearch('?mock=table&real=heading,headers')).toEqual({
      mock: 'table',
      real: ['heading', 'headers'],
    });
    expect(structureFromSearch('?mock=table')).toEqual({ mock: 'table', real: [] });
  });

  it('ignores what it does not know', () => {
    expect(structureFromSearch('')).toBeNull();
    expect(structureFromSearch('?mock=chart')).toBeNull();
    expect(structureFromSearch('?real=heading,footer,heading')).toEqual({
      mock: 'form',
      real: ['heading'],
    });
  });
});
