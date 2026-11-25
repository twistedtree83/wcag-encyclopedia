import { useMemo, useState } from 'react';
import { LabShell, type Said } from './LabShell';
import { SiteWindow } from '../live/SiteWindow';
import { pageOf } from '../live/mockSite';
import {
  WAYS,
  WAYS_START,
  tryWay,
  waysSaid,
  waysSite,
  waysVerdict,
  withWay,
  type WaysLab,
} from './multipleWays';

/**
 * The 2.4.5 lab (#63): the reader adds or removes the support site's menu, search and site map,
 * then tries each way to the buried VAT invoices page. The mock site is drawn inert from the
 * lab's state (`SiteWindow`), so trying a way never navigates the real page or moves focus.
 */

type Model = { readonly lab: WaysLab; readonly heard: number };

const START: Model = { lab: WAYS_START, heard: 0 };

const TRY_LABEL = { menu: 'Try the menu', search: 'Try search', sitemap: 'Try the site map' };

export function MultipleWaysLab() {
  const [{ lab, heard }, setModel] = useState<Model>(START);
  const said = useMemo<Said | null>(() => (heard > 0 ? { text: waysSaid(lab) } : null), [heard, lab]);
  const update = (next: (l: WaysLab) => WaysLab) =>
    setModel((m) => ({ lab: next(m.lab), heard: m.heard + 1 }));
  const site = waysSite(lab);
  const page = pageOf(site, { id: lab.route ? 'vat' : site.home, query: '' });

  return (
    <LabShell
      className="lab ways-lab"
      verdict={waysVerdict(lab)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div className="lab__mock msite msite--lab" data-lab-mock aria-hidden="true" inert>
        <SiteWindow site={site} page={page} via={null} />
      </div>

      <div className="lab-controls">
        <fieldset className="sem-choice">
          <legend>This site offers</legend>
          {WAYS.map(({ way, label }) => (
            <label key={way}>
              <input
                type="checkbox"
                checked={lab.ways[way]}
                onChange={(e) => update((l) => withWay(l, way, e.target.checked))}
              />
              {label}
            </label>
          ))}
        </fieldset>
        <fieldset className="sem-choice tt-acts">
          <legend>Reach VAT invoices from Home</legend>
          {WAYS.map(({ way }) => (
            <button
              key={way}
              type="button"
              className="btn o sm"
              onClick={() => update((l) => tryWay(l, way))}
            >
              {TRY_LABEL[way]}
            </button>
          ))}
        </fieldset>
      </div>

      <output className="lab-code tt-now" aria-live="off">
        {lab.tried
          ? lab.route
            ? `Route: ${lab.route.join(' › ')}`
            : 'That way is not on this site.'
          : 'On Home. Nothing tried yet.'}
      </output>
    </LabShell>
  );
}
