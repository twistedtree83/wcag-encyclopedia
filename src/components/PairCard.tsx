import { contrastRatio, formatScore } from '../color/contrast';
import type { ColourPair, MistakePair } from '../labs/pairs';
import { FailIcon, PassIcon } from './Icons';

/**
 * One "Done well, done badly" card (design guide §8.5): the mistake, the pair drawn badly and
 * well, one sentence of advice, and a button that loads the bad pair into the colour check.
 * Render inside `ul.pairs`.
 */
export function PairCard({ pair, onTry }: { pair: MistakePair; onTry: (bad: ColourPair) => void }) {
  return (
    <li className="surf">
      <h3>{pair.title}</h3>
      <div className="duo">
        <Tile colours={pair.bad} well={false} />
        <Tile colours={pair.good} well />
      </div>
      <p>{pair.why}</p>
      <button type="button" className="btn o sm" onClick={() => onTry(pair.bad)}>
        Try it in the checker<span className="sr">{`: ${pair.title}`}</span>
      </button>
    </li>
  );
}

const SAMPLE = 'Opening hours';

/**
 * A sample in the pair's colours with a badge carrying its measured ratio. The badly tile's
 * text is drawn by a pseudo-element and hidden from assistive technology; its badge says in
 * words which colours it shows.
 */
function Tile({ colours: { fg, bg }, well }: { colours: ColourPair; well: boolean }) {
  // Non-breaking spaces keep the ratio on one line when a narrow badge wraps.
  const score = `${formatScore(contrastRatio(fg, bg))} : 1`;
  return (
    <div className="tile" style={{ background: bg }}>
      {well ? (
        <span className="sm" style={{ color: fg }}>
          {SAMPLE}
        </span>
      ) : (
        <span className="sm" style={{ color: fg }} data-t={SAMPLE} aria-hidden="true"></span>
      )}
      <span className="tag">
        {well ? <PassIcon /> : <FailIcon />}
        {`${well ? 'Well' : 'Badly'} · ${score}`}
        <span className="sr">{`. ${fg} text on ${bg}.`}</span>
      </span>
    </div>
  );
}
