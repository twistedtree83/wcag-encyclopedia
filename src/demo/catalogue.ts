/**
 * The nine demos the site plans to ship, whether or not each has been authored yet.
 *
 * `registry.tsx` holds what *exists*; this holds what is *intended*. The library index renders
 * this list and links each entry to its criterion card once the demo is registered, so
 * authoring a demo is one registry entry and the index updates itself — no second list to keep
 * in step.
 */

export type CataloguedDemo = {
  readonly id: string;
  readonly criterion: string;
  readonly description: string;
  /** Seconds. Matches the timeline's duration once authored. */
  readonly duration: number;
};

export const DEMO_CATALOGUE: readonly CataloguedDemo[] = [
  {
    id: 'reflow-1-4-10',
    criterion: '1.4.10',
    description: 'A catalogue page reflowing from 1280px to 320px without horizontal scroll',
    duration: 12,
  },
  {
    id: 'focus-visible-2-4-7',
    criterion: '2.4.7',
    description: 'Keyboard traversal of a checkout form with a visible focus ring',
    duration: 14,
  },
  {
    id: 'focus-lost-2-4-7',
    criterion: '2.4.7',
    description: 'The same traversal with focus styles removed — the cursor vanishes',
    duration: 14,
  },
  {
    id: 'obscured-2-4-11',
    criterion: '2.4.11',
    description: 'A sticky header obscuring the focused element, then scroll-padding fixing it',
    duration: 12,
  },
  {
    id: 'name-4-1-2',
    criterion: '4.1.2',
    description: 'A screen reader on an unlabelled icon button versus a labelled one',
    duration: 18,
  },
  {
    id: 'errors-3-3-1',
    criterion: '3.3.1',
    description: 'Generic "invalid input" versus inline, named, linked errors',
    duration: 16,
  },
  {
    id: 'live-4-1-3',
    criterion: '4.1.3',
    description: 'A live region announcing an asynchronous cart update',
    duration: 10,
  },
  {
    id: 'targets-2-5-8',
    criterion: '2.5.8',
    description: 'Tap targets at 18px versus 24px with a fingertip overlay',
    duration: 9,
  },
  {
    id: 'autoplay-2-2-2',
    criterion: '2.2.2',
    description: 'An autoplaying carousel versus one with a pause control',
    duration: 12,
  },
];
