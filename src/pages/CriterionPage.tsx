import type { CriterionRecord, Example } from '../criteria/types';
import { principleFor } from '../criteria/structure';
import { FailIcon, PassIcon } from '../components/Icons';

/**
 * A criterion page. R-01 ships the head and the Broken / Fixed stages; R-03 adds the rest of
 * the anatomy (breadcrumb, facts, diff, demos, labs, siblings, pager).
 */
export function CriterionPage({ record }: { record: CriterionRecord }) {
  const principle = principleFor(record.guideline);
  if (!principle) throw new Error(`${record.num}: no principle for guideline ${record.guideline}`);

  return (
    <>
      <section className="ch" aria-labelledby="criterion-title">
        <div>
          <p className="meta">
            <span className={`mk p${principle.num}`} aria-hidden="true" />
            {record.num} · {principle.name}
            <span className={record.level === 'AA' ? 'lv aa' : 'lv'}>
              <span className="sr">Level </span>
              {record.level}
            </span>
          </p>
          <h1 id="criterion-title">{record.name}</h1>
          <p className="plain">{record.plain}</p>
        </div>
      </section>

      <section className="band" aria-labelledby="examples-title">
        <div className="bh">
          <h2 id="examples-title">Broken, then fixed</h2>
          <p>The same interface twice: first with the mistake, then with the smallest change that fixes it.</p>
        </div>
        <div className="ex">
          <Stage kind="bad" example={record.fail} />
          <Stage kind="good" example={record.pass} />
        </div>
      </section>
    </>
  );
}

function Stage({ kind, example }: { kind: 'bad' | 'good'; example: Example }) {
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
      <div className="stage__example">{example.render()}</div>
    </figure>
  );
}
