import { useId, useMemo, useState } from 'react';
import { LabChoice } from './LabChoice';
import { LabShell, type Said } from './LabShell';
import { SiteWindow } from '../live/SiteWindow';
import { pageOf, titleOf } from '../live/mockSite';
import {
  HELP_PAGES,
  HELP_START,
  PLACES,
  helpLine,
  helpSaid,
  helpSite,
  helpVerdict,
  placeOn,
  showHelpPage,
  type HelpLab,
} from './consistentHelp';

/**
 * The 3.2.6 lab (#64): the reader moves the mock shop between its three pages and puts the help
 * link in the header, the page or the footer, or leaves it off, page by page. It starts with help
 * in a different place on each page. The mock is drawn inert from the lab's state.
 */

type Model = { readonly lab: HelpLab; readonly heard: number };

const START: Model = { lab: HELP_START, heard: 0 };

export function ConsistentHelpLab() {
  const id = useId();
  const [{ lab, heard }, setModel] = useState<Model>(START);
  const said = useMemo<Said | null>(() => (heard > 0 ? { text: helpSaid(lab) } : null), [heard, lab]);
  const update = (next: (l: HelpLab) => HelpLab) =>
    setModel((m) => ({ lab: next(m.lab), heard: m.heard + 1 }));
  const site = helpSite(lab);

  return (
    <LabShell
      className="lab help-lab"
      verdict={helpVerdict(lab)}
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
          options={HELP_PAGES}
          value={lab.page}
          onChange={(page) => update((l) => showHelpPage(l, page))}
        />
        <LabChoice
          name={`${id}-place`}
          legend={`The help link on ${titleOf(site, lab.page)}`}
          options={PLACES}
          value={lab.places[lab.page]}
          onChange={(place) => update((l) => placeOn(l, l.page, place))}
        />
      </div>

      <output className="lab-code tt-now" aria-live="off">
        {helpLine(lab)}
      </output>
    </LabShell>
  );
}
