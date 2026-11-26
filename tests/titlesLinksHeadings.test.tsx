import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { announce, spoken } from '../src/labs/shared/announce';
import { listOf } from '../src/live/lists';
import { TITLE_START, titleSaid, titleText, titleVerdict } from '../src/labs/page-title/pageTitle';
import { LINK_START, linkSaid, linkVerdict, type Links } from '../src/labs/link-purpose/linkPurpose';
import { LinkMock } from '../src/labs/link-purpose/LinkPurposeLab';
import { DOC_START, docSaid, docVerdict, type Doc } from '../src/labs/headings-labels/headingsLabels';
import { HeadingsMock } from '../src/labs/headings-labels/HeadingsLab';
import { parseMarkup } from './markup';

/**
 * The 2.4.2, 2.4.4 and 2.4.6 labs (#50). Expected lines and verdicts are written out by hand from
 * what a screen reader says and what the criteria ask, not derived from the code.
 */

describe('2.4.2: title the page', () => {
  it('starts on a generic title, which fails', () => {
    expect(TITLE_START).toBe('generic');
    expect(titleText('generic')).toBe('Acme');
    expect(titleVerdict('generic')).toEqual({ criterion: '2.4.2', passes: false });
  });

  it('an empty title is read as the address, and fails', () => {
    expect(titleSaid('empty')).toBe(
      'Screen reader says: acme.example/checkout/delivery. The page has no title, so the address is read instead.',
    );
    expect(titleVerdict('empty').passes).toBe(false);
  });

  it('a descriptive title passes', () => {
    expect(titleText('descriptive')).toBe('Delivery details — Acme');
    expect(titleVerdict('descriptive')).toEqual({ criterion: '2.4.2', passes: true });
    expect(titleSaid('descriptive')).toBe(
      'Screen reader says: Delivery details — Acme. The title says which page this is.',
    );
  });
});

const linksList = (links: Links) =>
  listOf(announce(parseMarkup(renderToStaticMarkup(<LinkMock links={links} />))), 'links');

describe('2.4.4: name the link', () => {
  it('starts on three lone "Read more" links, which fail', () => {
    expect(LINK_START).toEqual({ text: 'read-more', context: 'none' });
    expect(linksList(LINK_START).map(spoken)).toEqual([
      'Read more, link',
      'Read more, link',
      'Read more, link',
    ]);
    expect(linkVerdict(LINK_START)).toEqual({ criterion: '2.4.4', passes: false });
  });

  it('a vague sentence does not rescue a vague link', () => {
    const links: Links = { text: 'click-here', context: 'vague' };
    expect(linkVerdict(links).passes).toBe(false);
    expect(linkSaid(links, linksList(links))).toBe(
      'Links list says: Click here, link; Click here, link; Click here, link. ' +
        'Nothing says where these links go.',
    );
  });

  it('a sentence that names it passes in context, though the links list still cannot tell', () => {
    const links: Links = { text: 'read-more', context: 'names' };
    expect(linksList(links).map(spoken)).toEqual([
      'Read more, link',
      'Read more, link',
      'Read more, link',
    ]);
    expect(linkVerdict(links)).toEqual({ criterion: '2.4.4', passes: true });
    expect(linkSaid(links, linksList(links))).toBe(
      'Links list says: Read more, link; Read more, link; Read more, link. ' +
        'The sentence beside each link names it, so it passes in context. ' +
        'Out of context, the list is still no help.',
    );
  });

  it('link text that names its destination passes on its own', () => {
    const links: Links = { text: 'descriptive', context: 'none' };
    expect(linksList(links).map(spoken)).toEqual([
      'Read the annual report 2025, link',
      'Read the board minutes for March, link',
      'Read the sustainability update, link',
    ]);
    expect(linkVerdict(links).passes).toBe(true);
  });
});

const outline = (doc: Doc) =>
  listOf(announce(parseMarkup(renderToStaticMarkup(<HeadingsMock doc={doc} />))), 'outline');

describe('2.4.6: write the headings and the label', () => {
  it('starts with vague headings and a vague label, which fail', () => {
    expect(DOC_START).toEqual({ headings: 'vague', label: 'vague' });
    expect(outline(DOC_START).map(spoken)).toEqual([
      'More, heading, level 4',
      'Information, heading, level 5',
      'Details, heading, level 5',
      'Enter your details here, edit text',
    ]);
    expect(docVerdict(DOC_START)).toEqual({ criterion: '2.4.6', passes: false });
  });

  it('descriptive headings with a vague label still fail', () => {
    const doc: Doc = { headings: 'descriptive', label: 'vague' };
    expect(docVerdict(doc).passes).toBe(false);
    expect(docSaid(doc, outline(doc))).toBe(
      'Headings and fields list says: Returns and refunds, heading, level 4; ' +
        'How long you have, heading, level 5; What it costs, heading, level 5; ' +
        'Enter your details here, edit text. The label does not say what to type.',
    );
  });

  it('descriptive headings and label pass', () => {
    const doc: Doc = { headings: 'descriptive', label: 'descriptive' };
    expect(outline(doc).map(spoken)).toEqual([
      'Returns and refunds, heading, level 4',
      'How long you have, heading, level 5',
      'What it costs, heading, level 5',
      'Order number, edit text',
    ]);
    expect(docVerdict(doc)).toEqual({ criterion: '2.4.6', passes: true });
  });
});
