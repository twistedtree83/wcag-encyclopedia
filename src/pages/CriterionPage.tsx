import { longDate, postsAbout, type PostMeta } from '../blog/post';
import type { CriterionRecord } from '../criteria/types';
import { principleFor } from '../criteria/structure';
import { demoById } from '../demo/registry';
import { labById } from '../labs/registry';
import { LabSlot } from '../labs/shared/LabSlot';
import { Breadcrumb } from '../components/Breadcrumb';
import { Facts } from '../components/Facts';
import { ExamplePair } from '../components/ExamplePair';
import { IndexCard } from '../components/IndexCard';
import { MarkupDiff } from '../components/MarkupDiff';
import { Pager } from '../components/Pager';
import { LevelTag, Marker, NewTag } from '../components/Tags';
import { neighbours, related } from '../site/criterionNav';
import { trailFor } from '../site/breadcrumbs';
import { useRoute } from '../site/RouteContext';
import { criterionPath, postPath } from '../site/routes';

/**
 * A criterion page, in the PRD's order: breadcrumb, head and facts, Broken then fixed, the
 * diff, the demos, How to test, Common questions, the labs, "Further reading", "Also in", and
 * the pager. The diff, demo, procedure, question and lab sections appear only when the record
 * has one, and "Further reading" only when a post in `posts` (`POSTS`, every post's
 * frontmatter) discusses the criterion. Everything except the demos' and labs' controls is
 * readable in the static HTML, before any script runs.
 */
export function CriterionPage({ record, posts = [] }: { record: CriterionRecord; posts?: readonly PostMeta[] }) {
  const { href } = useRoute();
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
  const reading = postsAbout(record.num, posts);
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
        <ExamplePair fail={record.fail} pass={record.pass} />
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

      {record.procedure?.length ? (
        <section className="band" aria-labelledby="procedure-title">
          <div className="bh">
            <div>
              <h2 id="procedure-title">How to test</h2>
              <p>Check your own interface against {record.num}, one step at a time.</p>
            </div>
          </div>
          <ol className="procedure">
            {record.procedure.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      ) : null}

      {record.questions?.length ? (
        <section className="band" aria-labelledby="questions-title">
          <div className="bh">
            <div>
              <h2 id="questions-title">Common questions</h2>
            </div>
          </div>
          <div className="questions">
            {record.questions.map(({ question, answer }) => (
              <div className="questions__item" key={question}>
                <h3>{question}</h3>
                <p>{answer}</p>
              </div>
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
          {labs.map((lab) => (
            <LabSlot key={lab.id} lab={lab} criterion={record.num} />
          ))}
        </section>
      ) : null}

      {reading.length > 0 ? (
        <section className="band" aria-labelledby="reading-title">
          <div className="bh">
            <div>
              <h2 id="reading-title">Further reading</h2>
              <p>Posts from the blog that discuss this criterion alongside others, newest first.</p>
            </div>
          </div>
          <ul className="posts posts--reading">
            {reading.map((post) => (
              <li key={post.slug}>
                <h3>
                  <a href={href(postPath(post.slug))}>{post.title}</a>
                </h3>
                <p className="posts__date">
                  <time dateTime={post.published}>{longDate(post.published)}</time>
                </p>
                <p>{post.description}</p>
              </li>
            ))}
          </ul>
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
