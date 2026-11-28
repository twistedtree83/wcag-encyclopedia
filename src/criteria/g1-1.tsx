/**
 * Guideline 1.1 — Text Alternatives.
 *
 * One criterion, and the one most often "done" badly: alt text that exists but says nothing.
 * The example contrasts three images that need three different treatments, because the common
 * mistake is giving all of them one treatment.
 */

import { CHART, DIVIDER, PHOTO } from '../labs/alt-text/pictures';
import type { CriterionRecord, LiveExample } from './types';

/** A small depiction of an image in some other product's page. */
function Thumb({ label }: { label: string }) {
  return (
    <span aria-hidden="true" className="thumb">
      {label}
    </span>
  );
}

/*
 * 1.1.1's live examples (#48): the same three images as the static examples, as real <img>s.
 * Read aloud, the broken set says "image", a file name and a name for decoration; the fixed set
 * says what the photo and the chart are for, and skips the divider.
 */

function AltImages({ alts }: { readonly alts: readonly [string, string, string] }) {
  return (
    <div className="live-alts">
      <img src={PHOTO} alt={alts[0]} width={160} height={120} />
      <img src={CHART} alt={alts[1]} width={160} height={120} />
      <img src={DIVIDER} alt={alts[2]} width={160} height={120} />
    </div>
  );
}

function BrokenAlts() {
  return <AltImages alts={['image', 'chart.png', 'decorative swirl']} />;
}

function FixedAlts() {
  return (
    <AltImages alts={['Wool overshirt in rust, worn open', 'Sales rose 12% in Q3, then flattened', '']} />
  );
}

const ALT_KEYS: LiveExample['keys'] = ['read'];

export const G1_1: readonly CriterionRecord[] = [
  {
    num: '1.1.1',
    name: 'Non-text Content',
    level: 'A',
    since: '2.0',
    guideline: '1.1',
    labs: ['alt-text'],
    gist: 'Images, icons and charts need a text alternative that serves the same purpose.',
    plain:
      'Anything that is not text — an image, an icon, a chart, a video thumbnail — needs a ' +
      'text equivalent that serves the same purpose. Decoration needs an empty alt so screen ' +
      'readers skip it. The test is not "is there alt text" but "would someone who cannot see ' +
      'this end up knowing the same thing".',
    fail: {
      caption: 'Alt text exists, and tells the reader nothing.',
      live: { Example: BrokenAlts, keys: ALT_KEYS, instruments: ['announcement-log'] },
      render: () => (
        <>
          <ul className="alt-list">
            <li>
              <Thumb label="photo" />
              <code className="alt-code">alt="image"</code>
              <span className="example-note">A product photo, described as "image".</span>
            </li>
            <li>
              <Thumb label="chart" />
              <code className="alt-code">alt="chart.png"</code>
              <span className="example-note">A sales chart, described by its filename.</span>
            </li>
            <li>
              <Thumb label="divider" />
              <code className="alt-code">alt="decorative swirl"</code>
              <span className="example-note">
                A divider, announced to every screen reader user who passes it.
              </span>
            </li>
          </ul>
          <p className="example-note">
            All three have alt attributes, so an automated checker reports no error. All three
            are useless: two withhold the information, and the third adds noise.
          </p>
        </>
      ),
    },
    pass: {
      caption: 'Each image is described by what it is for, not by what it is.',
      live: { Example: FixedAlts, keys: ALT_KEYS, instruments: ['announcement-log'] },
      render: () => (
        <>
          <ul className="alt-list">
            <li>
              <Thumb label="photo" />
              <code className="alt-code">alt="Wool overshirt in rust, worn open"</code>
              <span className="example-note">What a shopper needs in order to choose.</span>
            </li>
            <li>
              <Thumb label="chart" />
              <code className="alt-code">alt="Sales rose 12% in Q3, then flattened"</code>
              <span className="example-note">
                The finding the chart exists to convey — with the full table linked beneath it.
              </span>
            </li>
            <li>
              <Thumb label="divider" />
              <code className="alt-code">alt=""</code>
              <span className="example-note">
                Empty, not missing. The image is removed from the accessibility tree entirely.
              </span>
            </li>
          </ul>
          <p className="example-note">
            The same three images. What changed is that each description now answers "why is
            this here", which is a different question from "what is in it".
          </p>
        </>
      ),
    },
    diff: {
      title: 'product.html, three images',
      lines: [
        { kind: 'del', text: '<img src="p-401.jpg" alt="image">' },
        { kind: 'add', text: '<img src="p-401.jpg" alt="Wool overshirt in rust, worn open">' },
        { kind: 'context', text: '' },
        { kind: 'del', text: '<img src="divider.svg" alt="decorative swirl">' },
        { kind: 'add', text: '<img src="divider.svg" alt="">' },
      ],
      note:
        'An empty alt is a decision; a missing alt attribute is not. Without one, many screen ' +
        'readers fall back to reading the filename aloud.',
    },
    procedure: [
      'List every piece of non-text content on the page: photos, icons, SVG graphics, charts, image buttons, images of text, and CSS background images that carry information.',
      'Open the accessibility inspector in your browser (the Accessibility pane in Chrome or Edge DevTools, or the Accessibility tab in Firefox) and select each one. Read the name it shows: for an img element, that is its alt text.',
      'Ask of each name whether it gives the same information, or does the same job, as the image. A product photo needs what matters about the product; an icon button needs what the button does, not what the icon looks like.',
      'Check each decorative image is hidden from assistive technology: alt="" on an img, aria-hidden="true" on an inline SVG, or the image set as a CSS background. An img with no alt attribute at all fails, because a screen reader may read out its file name.',
      'Find each chart, diagram or map and check a longer description sits next to it or is linked from it, such as the data as a table or a paragraph that says what the chart shows.',
      'Turn on a screen reader (NVDA on Windows, VoiceOver on a Mac) and move through the page. Each meaningful image should be read out with its alternative, and no decorative one should be read at all.',
    ],
    questions: [
      {
        question: 'Do decorative images need alt text to pass 1.1.1?',
        answer:
          'No. They need to be hidden from assistive technology instead, and alt="" does that for an img. Leaving the alt attribute off is not the same: a screen reader may then read out the file name.',
      },
      {
        question: 'Does an icon button pass 1.1.1 if the icon is clear?',
        answer:
          'No. The button needs a text name that says what it does, such as "Search" for a magnifying glass: alt on an image button, or aria-label on a button that holds an SVG.',
      },
      {
        question: 'Is a short alt enough for a chart?',
        answer:
          'Only when the chart makes one point that a sentence can carry. Otherwise give a short alternative that names the chart, and a longer description next to it, such as the data as a table or a summary of the trend.',
      },
      {
        question: 'Does a CAPTCHA fail 1.1.1?',
        answer:
          'Only when it has no text saying what it is for, or no other version for a different sense. A visual puzzle can stay if text names it as a test that you are human and an audio version sits beside it.',
      },
    ],
  },
];
