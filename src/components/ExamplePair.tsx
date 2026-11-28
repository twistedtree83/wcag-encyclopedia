import { useEffect, useState } from 'react';
import type { Example } from '../criteria/types';
import { LiveStage } from '../live/LiveStage';
import { FailIcon, PassIcon } from './Icons';

/**
 * A record's fail and pass examples, Broken then Fixed, side by side: on its criterion page, and
 * wherever a post embeds them (`::example`, S-08). A record whose examples have live versions pre-renders the
 * static ones, then swaps the live ones in after hydration (#43); the rest never change.
 */
export function ExamplePair({ fail, pass }: { fail: Example; pass: Example }) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const live = hydrated && !!fail.live && !!pass.live;
  return (
    <div className={live ? 'ex ex--live' : 'ex'}>
      <Stage kind="bad" example={fail} live={live} />
      <Stage kind="good" example={pass} live={live} />
    </div>
  );
}

function Stage({ kind, example, live }: { kind: 'bad' | 'good'; example: Example; live: boolean }) {
  const broken = kind === 'bad';
  return (
    <figure className={`stage ${kind}`}>
      <figcaption>
        <span className="lbl">
          {broken ? <FailIcon /> : <PassIcon />}
          {broken ? 'Broken' : 'Fixed'}
        </span>
        <span className="sr">: </span>
        <q>{example.caption}</q>
      </figcaption>
      {live && example.live ? (
        <LiveStage kind={kind} live={example.live} />
      ) : (
        <div className="stage__example">{example.render()}</div>
      )}
    </figure>
  );
}
