import { useEffect, useState } from 'react';
import type { CriterionRecord, Example } from '../criteria/types';
import { LiveStage } from '../live/LiveStage';
import { principleFor } from '../criteria/structure';
import { demoById } from '../demo/registry';
import { labById } from '../labs/registry';
import { LabStepsProvider } from '../labs/shared/LabShell';
import { Breadcrumb } from '../components/Breadcrumb';
import { Facts } from '../components/Facts';
import { FailIcon, PassIcon } from '../components/Icons';
import { IndexCard } from '../components/IndexCard';
import { MarkupDiff } from '../components/MarkupDiff';
import { Pager } from '../components/Pager';
import { LevelTag, Marker, NewTag } from '../components/Tags';
import { neighbours, related } from '../site/criterionNav';
import { trailFor } from '../site/breadcrumbs';
import { criterionPath } from '../site/routes';

/**
 * A criterion page, in the PRD's order: breadcrumb, head and facts, Broken then fixed, the
 * diff, the demos, the labs, "Also in", and the pager. The diff, demo and lab sections appear
 * only when the record has one. Everything except the demos' and labs' controls is readable
 * in the static HTML, before any script runs.
 */
export function CriterionPage({ record }: { record: CriterionRecord }) {
  const principle = principleFor(record.guideline);
  if (!principle) throw new Error(`${record.num}: no principle for guideline ${record.guideline}`);

  const demos = (record.demos ?? []).map((id) => {
    const demo = demoById(id);
    if (!demo) throw new Error(`${record.num}: no demo ${id}`);
    return demo;
  });
  const labs = (record.labs ?? []).map((id) => {
    const lab = labById(id);
    if (!lab) throw new Error(`${record.num}: no lab ${id}`);
    return lab;
  });
  const also = related(record);
  const { prev, next } = neighbours(record.num);
  const route = { path: criterionPath(record.num), page: 'criterion', num: record.num } as const;

  return (
    <>
      <Breadcrumb trail={trailFor(route, `${record.num} ${record.name}`)} />

      <section className="ch" aria-labelledby="criterion-title">
        <div>
          <p className="meta">
            <Marker principle={principle.num} />
            {record.num} · {principle.name}
            <LevelTag level={record.level} />
            {record.since === '2.2' ? <NewTag /> : null}
          </p>
          <h1 id="criterion-title">{record.name}</h1>
          <p className="plain">{record.plain}</p>
        </div>
        <Facts record={record} principle={principle} />
      </section>

      <section className="band" aria-labelledby="examples-title">
        <div className="bh">
          <div>
            <h2 id="examples-title">Broken, then fixed</h2>
            <p>
              The same interface twice: first with the mistake, then with the smallest change that
              fixes it.
            </p>
          </div>
        </div>
        <Examples fail={record.fail} pass={record.pass} />
      </section>

      {record.diff ? (
        <section className="band" aria-labelledby="diff-title">
          <div className="bh">
            <div>
              <h2 id="diff-title">What changed in the code</h2>
              <p>
                The fix as a diff: removed lines are marked with a minus, added lines with a plus.
              </p>
            </div>
          </div>
          <MarkupDiff diff={record.diff} />
        </section>
      ) : null}

      {demos.length > 0 ? (
        <section className="band" aria-labelledby="demo-title">
          <div className="bh">
            <div>
              <h2 id="demo-title">Watch it happen</h2>
              <p>
                {demos.length > 1 ? 'These demos play' : 'This demo plays'} the failure out over
                time. {demos.length > 1 ? 'They are' : 'It is'} silent and captioned, and you can
                pause or scrub at any point.
              </p>
            </div>
          </div>
          <div className="demos">
            {demos.map((demo) => (
              <demo.Player key={demo.id} />
            ))}
          </div>
        </section>
      ) : null}

      {labs.length > 0 ? (
        <section className="band" aria-labelledby="lab-title">
          <div className="bh">
            <div>
              <h2 id="lab-title">Try it yourself</h2>
              <p>
                A lab is a small working piece of interface that you change yourself. Read its
                steps, use the controls under it, and watch the verdict line at the bottom: it
                says whether the criterion passes or fails as you go. Reset puts it back.
              </p>
            </div>
          </div>
          {labs.map(({ id, title, steps, Lab }) => (
            <div className="lab-slot" key={id}>
              <h3>{title}</h3>
              <LabStepsProvider steps={steps}>
                <Lab criterion={record.num} />
              </LabStepsProvider>
            </div>
          ))}
        </section>
      ) : null}

      <section className="band" aria-labelledby="also-title">
        <div className="bh">
          <div>
            <h2 id="also-title">{also.heading}</h2>
            <p>
              {also.byGuideline
                ? 'Criteria in the same guideline often fail together.'
                : 'This guideline has no other Level A or AA criteria, so here are more under the same principle.'}
            </p>
          </div>
        </div>
        <ul className="grid">
          {also.records.map((r) => (
            <IndexCard key={r.num} record={r} />
          ))}
        </ul>
      </section>

      <Pager {...(prev ? { prev } : {})} {...(next ? { next } : {})} />
    </>
  );
}

/**
 * Broken then Fixed, side by side. A record whose examples have live versions pre-renders the
 * static ones, then swaps the live ones in after hydration (#43); the rest never change.
 */
function Examples({ fail, pass }: { fail: Example; pass: Example }) {
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
