import { useId, useMemo, useState } from 'react';
import { LabChoice } from '../shared/LabChoice';
import { LabShell, type Said } from '../shared/LabShell';
import { SiteWindow } from '../../live/SiteWindow';
import { pageOf, titleOf } from '../../live/mockSite';
import {
  ID_PAGES,
  ID_START,
  NAMES,
  idLine,
  idSaid,
  idSite,
  idVerdict,
  nameOn,
  showIdPage,
  type IdLab,
} from './consistentId';

/**
 * The 3.2.4 lab (#64): the reader moves the mock shop between its three pages and names the
 * search button on each, "Search", "Find" or "Go". It starts with a different name on each page.
 * The mock is drawn inert from the lab's state, so nothing in it touches the real page.
 */

type Model = { readonly lab: IdLab; readonly heard: number };

const START: Model = { lab: ID_START, heard: 0 };

export function ConsistentIdLab() {
  const id = useId();
  const [{ lab, heard }, setModel] = useState<Model>(START);
  const said = useMemo<Said | null>(() => (heard > 0 ? { text: idSaid(lab) } : null), [heard, lab]);
  const update = (next: (l: IdLab) => IdLab) =>
    setModel((m) => ({ lab: next(m.lab), heard: m.heard + 1 }));
  const site = idSite(lab);

  return (
    <LabShell
      className="lab id-lab"
      verdict={idVerdict(lab)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div className="lab__mock msite msite--lab" data-lab-mock aria-hidden="true" inert>
        <SiteWindow site={site} page={pageOf(site, { id: lab.page, query: '' })} via={null} />
      </div>

      <div className="lab-controls">
        <LabChoice
          name={`${id}-page`}
          legend="Show the page"
          options={ID_PAGES}
          value={lab.page}
          onChange={(page) => update((l) => showIdPage(l, page))}
        />
        <LabChoice
          name={`${id}-name`}
          legend={`Name the search button on ${titleOf(site, lab.page)}`}
          options={NAMES}
          value={lab.names[lab.page]}
          onChange={(name) => update((l) => nameOn(l, l.page, name))}
        />
      </div>

      <output className="lab-code tt-now" aria-live="off">
        {idLine(lab)}
      </output>
    </LabShell>
  );
}
