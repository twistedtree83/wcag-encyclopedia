import { useId, useMemo, useState } from 'react';
import { LabChoice } from '../shared/LabChoice';
import { LabShell, type Said } from '../shared/LabShell';
import { SiteWindow } from '../../live/SiteWindow';
import { pageOf } from '../../live/mockSite';
import {
  NAV_PAGES,
  NAV_START,
  ORDERS,
  navLine,
  navSaid,
  navSite,
  navVerdict,
  showPage,
  withContact,
  withOrder,
  type NavLab,
} from './consistentNav';

/**
 * The 3.2.3 lab (#63): the reader moves the mock shop between its four pages, with the menu in
 * one order or shuffled, and may give Support a page-only "Contact us" link. The mock is drawn
 * inert from the lab's state, so moving between pages never touches the real page.
 */

type Model = { readonly lab: NavLab; readonly heard: number };

const START: Model = { lab: NAV_START, heard: 0 };

export function ConsistentNavLab() {
  const id = useId();
  const [{ lab, heard }, setModel] = useState<Model>(START);
  const said = useMemo<Said | null>(() => (heard > 0 ? { text: navSaid(lab) } : null), [heard, lab]);
  const update = (next: (l: NavLab) => NavLab) =>
    setModel((m) => ({ lab: next(m.lab), heard: m.heard + 1 }));
  const site = navSite(lab);

  return (
    <LabShell
      className="lab nav-lab"
      verdict={navVerdict(lab)}
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
          options={NAV_PAGES}
          value={lab.page}
          onChange={(page) => update((l) => showPage(l, page))}
        />
        <LabChoice
          name={`${id}-order`}
          legend="The menu"
          options={ORDERS}
          value={lab.order}
          onChange={(order) => update((l) => withOrder(l, order))}
        />
        <fieldset className="sem-choice">
          <legend>Page-only links</legend>
          <label>
            <input
              type="checkbox"
              checked={lab.contact}
              onChange={(e) => update((l) => withContact(l, e.target.checked))}
            />
            Support adds “Contact us”
          </label>
        </fieldset>
      </div>

      <output className="lab-code tt-now" aria-live="off">
        {`On Home the menu reads ${navLine(lab, 'home')}.`}
        {lab.page === 'home' ? null : ` Here it reads ${navLine(lab, lab.page)}.`}
      </output>
    </LabShell>
  );
}
