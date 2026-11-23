import { useEffect, useState, type HTMLAttributes, type ReactNode } from 'react';
import { FailIcon, PassIcon } from '../components/Icons';

/**
 * The lab shell: the one layout every lab shares, as the demo player is for demos (#41).
 *
 *   children     the lab's mock, then its controls row and any readouts, in the lab's layout
 *   verdict      exactly one line, "1.4.3 fails", with a glyph as well as colour
 *   Reset        returns the lab to its starting state; the lab does the work in `onReset`
 *   live region  one polite `.sr` region, set 500 ms after the reader's last change
 *
 * The lab owns its state and tells the shell two things: the verdict for what is on screen,
 * and `said`, what to announce. Pass a new `said` object for every change the reader makes,
 * and `null` (or the same object) for changes they didn't make: the starting state, a URL
 * preload, Reset. Only a new object is spoken, so nothing else ever is.
 *
 * SSR-safe: nothing here reads the browser during render. A verdict flip replays a short
 * settle (`.settle`, motion tokens in swatch.css); the first render never animates.
 */

export type Verdict = {
  /** The criterion judged, by number: "1.4.3". */
  readonly criterion: string;
  readonly passes: boolean;
};

/** One thing to announce. A new object for each change the reader makes. */
export type Said = { readonly text: string };

/** How long the live region waits after the reader's last change, so a drag is spoken once. */
export const ANNOUNCE_DELAY_MS = 500;

export function verdictText({ criterion, passes }: Verdict): string {
  return `${criterion} ${passes ? 'passes' : 'fails'}`;
}

type Props = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  /** The root element. The colour check is a form; most labs are a div. */
  readonly as?: 'div' | 'form';
  readonly verdict: Verdict;
  readonly said: Said | null;
  readonly onReset: () => void;
  readonly children: ReactNode;
};

export function LabShell({
  as: Root = 'div',
  verdict,
  said,
  onReset,
  children,
  ...root
}: Props) {
  const live = useAnnouncement(said);
  const flips = useFlips(verdict.passes);
  const form = Root === 'form' ? { onSubmit: (e: { preventDefault(): void }) => e.preventDefault() } : {};

  return (
    <Root {...root} {...form}>
      {children}
      <div className="lab-foot">
        <p className={verdict.passes ? 'lab-verdict ok' : 'lab-verdict bad'}>
          {/* Keyed on the flip count, so each flip replays the settle from the start. */}
          <span key={flips} className={flips > 0 ? 'settle' : undefined}>
            {verdict.passes ? <PassIcon /> : <FailIcon />}
            {verdictText(verdict)}
          </span>
        </p>
        <button type="button" className="btn o sm" onClick={onReset}>
          Reset
        </button>
      </div>
      <p className="sr" aria-live="polite">
        {live}
      </p>
    </Root>
  );
}

/** The live region's text: `said`, once the reader has rested for `ANNOUNCE_DELAY_MS`. */
function useAnnouncement(said: Said | null): string {
  const [live, setLive] = useState('');
  useEffect(() => {
    if (!said) return;
    const timer = window.setTimeout(() => setLive(said.text), ANNOUNCE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [said]);
  return live;
}

/** How many times the verdict has flipped since the lab first rendered. */
function useFlips(passes: boolean): number {
  const [seen, setSeen] = useState(passes);
  const [flips, setFlips] = useState(0);
  if (seen !== passes) {
    setSeen(passes);
    setFlips(flips + 1);
  }
  return flips;
}
