import { createElement, Fragment, type ReactNode } from 'react';
import { criterion } from '../criteria/corpus';
import { ExamplePair } from '../components/ExamplePair';
import { labById } from '../labs/registry';
import { LabSlot } from '../labs/shared/LabSlot';
import { useRoute } from '../site/RouteContext';
import { criterionPath } from '../site/routes';
import type { PostElement, PostNode } from './post';

/**
 * Draws a post body, the tree `parse.ts` made at build time, as React elements. No Markdown is
 * read here: the browser gets the tree as data and this walks it. A link to a page of the site
 * (`to`) becomes a relative href from the page it is on.
 *
 * An embed (S-08) draws what its criterion page draws, from the same components: `example` the
 * record's fail and pass examples, `lab` the registered lab. The parser checked the criterion;
 * the lab is checked here, as the registry is only known to the app, so a lab id no lab answers
 * to fails the prerender, and so the build.
 */
export function PostBody({ slug, nodes }: { slug: string; nodes: readonly PostNode[] }) {
  const { href } = useRoute();
  const draw = (list: readonly PostNode[]): ReactNode[] =>
    list.map((node, i) => {
      if (typeof node === 'string') return <Fragment key={i}>{node}</Fragment>;
      const { tag, children, to, start } = node;
      if (tag === 'example' || tag === 'lab') return <Embed key={i} slug={slug} node={node} />;
      const props = {
        key: i,
        ...(tag === 'a' ? { href: to !== undefined ? href(to) : node.href } : {}),
        ...(start !== undefined ? { start } : {}),
      };
      return tag === 'br' || tag === 'hr' ? createElement(tag, props) : createElement(tag, props, ...draw(children));
    });
  return <>{draw(nodes)}</>;
}

function Embed({ slug, node }: { slug: string; node: PostElement }) {
  const { href } = useRoute();
  const num = node.num ?? '';
  const record = criterion(num);
  if (!record) throw new Error(`post ${slug}: ::${node.tag} ${num} has no criterion record`);
  const page = (
    <a href={href(criterionPath(num))}>
      {num} {record.name}
    </a>
  );

  if (node.tag === 'example') {
    return (
      <div className="embed embed--example">
        <p className="embed__lead">
          <b>Broken, then fixed</b>, from {page}: the same interface twice, first with the mistake,
          then with the smallest change that fixes it.
        </p>
        <ExamplePair fail={record.fail} pass={record.pass} />
      </div>
    );
  }

  const id = node.lab ?? '';
  const lab = labById(id);
  if (!lab) throw new Error(`post ${slug}: ::lab ${id} is no lab (the ids are in src/labs/INDEX.md)`);
  if (!lab.criteria.includes(num))
    throw new Error(`post ${slug}: ::lab ${id} does not judge ${num}: it is on ${lab.criteria.join(', ')}`);
  return (
    <div className="embed embed--lab">
      <LabSlot lab={lab} criterion={num} />
      <p className="embed__from">
        A lab from {page}: a small working piece of interface that you change yourself. The
        verdict line at its foot says whether {num} passes or fails as you go, and Reset puts it
        back.
      </p>
    </div>
  );
}
