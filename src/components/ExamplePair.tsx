/**
 * The fail/pass pair.
 *
 * Left frame is marked ✕ FAIL, right ✓ PASS. Each carries a border, a glyph in a distinctly
 * shaped container (square for fail, circle for pass), and a word — three redundant signals,
 * so the distinction survives greyscale.
 */

import type { Example } from '../criteria/types';

function Frame({
  tone,
  label,
  example,
  captionLead,
}: {
  tone: 'fail' | 'pass';
  label: string;
  example: Example;
  captionLead: string;
}) {
  return (
    <div className={`frame frame--${tone}`}>
      <p className="frame__label">
        <span aria-hidden="true" className="frame__glyph">
          {tone === 'fail' ? '✕' : '✓'}
        </span>
        {label}
      </p>
      <div className="frame__body">{example.render()}</div>
      <p className="frame__caption">
        <strong>{captionLead}</strong> {example.caption}
      </p>
    </div>
  );
}

export function ExamplePair({
  fail,
  pass,
  failLabel = 'Fail',
  passLabel = 'Pass',
}: {
  fail: Example;
  pass: Example;
  failLabel?: string;
  passLabel?: string;
}) {
  return (
    <div className="example-pair">
      <Frame tone="fail" label={failLabel} example={fail} captionLead="What's wrong:" />
      <Frame tone="pass" label={passLabel} example={pass} captionLead="What changed:" />
    </div>
  );
}
