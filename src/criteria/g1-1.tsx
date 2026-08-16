/**
 * Guideline 1.1 — Text Alternatives.
 *
 * One criterion, and the one most often "done" badly: alt text that exists but says nothing.
 * The example contrasts three images that need three different treatments, because the common
 * mistake is applying one rule to all of them.
 */

import type { CriterionRecord } from './types';

/** A small depiction of an image in some other product's page. */
function Thumb({ label }: { label: string }) {
  return (
    <span aria-hidden="true" className="thumb">
      {label}
    </span>
  );
}

export const G1_1: readonly CriterionRecord[] = [
  {
    num: '1.1.1',
    name: 'Non-text Content',
    level: 'A',
    guideline: '1.1',
    plain:
      'Anything that is not text — an image, an icon, a chart, a video thumbnail — needs a ' +
      'text equivalent that serves the same purpose. Decoration needs an empty alt so screen ' +
      'readers skip it. The test is not "is there alt text" but "would someone who cannot see ' +
      'this end up knowing the same thing".',
    fail: {
      caption: 'Alt text exists, and tells the reader nothing.',
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
              <Thumb label="rule" />
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
              <Thumb label="rule" />
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
  },
];
