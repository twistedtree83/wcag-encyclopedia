import { AA_BODY, AA_LARGE, AA_UI, AAA_BODY, formatScore } from '../../color/contrast';
import { RATIO_MARKS, ratioPosition, scaleSentence } from './ratioScale';

/**
 * What a contrast ratio means, shown under the ratio in every contrast lab: the colour check,
 * the fade lab and the 1.4.11 edges lab. A sentence on what the number compares, the 1 to 21
 * scale with the ratio on it, and why the thresholds differ.
 *
 * The drawn scale is hidden from assistive technology; the sentence under it says the same
 * thing in words, so the scale is never the only way to read the ratio. Nothing on it moves
 * unless the reader changes the ratio, and then it moves at once: no transition.
 */
export function RatioExplained({
  ratio,
  open = false,
}: {
  readonly ratio: number;
  /** Show why the thresholds differ without a click, as the Colour check page does. */
  readonly open?: boolean;
}) {
  const now = Math.min(100, Math.max(0, ratioPosition(ratio)));
  return (
    <div className="ratio-x">
      <p className="ratio-x__what">
        The contrast ratio compares how bright the two colours are. 1 : 1 means the colours are
        identical, so text in them is invisible; 21 : 1 is black on white, the most there is.
        The higher the number, the easier it is to read.
      </p>

      <div className="ratio-scale">
        <div className="ratio-scale__bar" aria-hidden="true">
          <span className="ratio-scale__track" />
          {RATIO_MARKS.map((m) => (
            <span className="ratio-scale__mark" key={m} style={{ left: `${ratioPosition(m)}%` }}>
              <span>{m}</span>
            </span>
          ))}
          <span className="ratio-scale__end ratio-scale__end--min">1</span>
          <span className="ratio-scale__end ratio-scale__end--max">21</span>
          <span className="ratio-scale__now" style={{ left: `${now}%` }}>
            <span>{formatScore(ratio)}</span>
          </span>
        </div>
        <p className="ratio-scale__said">{scaleSentence(ratio)}</p>
      </div>

      <details className="ratio-why" open={open}>
        <summary>Why the thresholds differ</summary>
        <ul>
          <li>
            {`Body text needs ${AA_BODY} : 1 (1.4.3, Level AA). That is any text below large size.`}
          </li>
          <li>
            {`Large text needs ${AA_LARGE} : 1 (1.4.3). Large means at least 24px, or 18.66px and bold. Bigger, heavier letters stay readable with less contrast.`}
          </li>
          <li>
            {`At Level AAA, body text needs ${AAA_BODY} : 1 (1.4.6), for people with moderately low vision.`}
          </li>
          <li>
            {`Borders and icons need ${AA_UI} : 1 (1.4.11): the edge of a field or checkbox, a focus ring or an icon, against what is next to it. You have to see that they are there, not read them.`}
          </li>
        </ul>
      </details>
    </div>
  );
}
