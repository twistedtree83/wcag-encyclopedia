import { useEffect, useId, useRef, useState } from 'react';
import { LabChoice } from '../shared/LabChoice';
import { LabShell, type Said } from '../shared/LabShell';
import {
  LIFTS,
  ORDER_START,
  PART_LABEL,
  SOURCES,
  VISUAL,
  focusOrder,
  orderSaid,
  orderVerdict,
  sourceOrder,
  tabindexOf,
  type Order,
} from './focusOrder';
import { orderFromSearch, searchFromOrder } from './orderQuery';

/**
 * The 2.4.3 flagship lab (#46): a form laid out in a fixed grid. The reader rewrites its source
 * order or gives one part `tabindex="1"`, and the numbered focus order on the mock drifts away
 * from the order it is seen in. The grid places every part by name, so the picture never moves:
 * only the numbers do, which is the point.
 *
 * The mock is depicted: inert and hidden from assistive technology. The readouts say it in text.
 * State is in the URL (`orderQuery.ts`), applied after mount without announcing it.
 */

type Model = { readonly order: Order; readonly said: Said | null };

const START: Model = { order: ORDER_START, said: null };

const markup = (order: Order, part: (typeof VISUAL)[number]) => {
  const ti = tabindexOf(order, part) > 0 ? ' tabindex="1"' : '';
  return part === 'send' ? `<button${ti}>Send</button>` : `<input name="${part}"${ti}>`;
};

export function FocusOrderLab() {
  const id = useId();
  const [{ order, said }, setModel] = useState<Model>(START);
  const visits = focusOrder(order);

  useEffect(() => {
    const preload = orderFromSearch(window.location.search);
    if (preload) setModel({ order: preload, said: null });
  }, []);

  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const { pathname, hash } = window.location;
    window.history.replaceState(window.history.state, '', pathname + searchFromOrder(order) + hash);
  }, [order]);

  const change = (patch: Partial<Order>) =>
    setModel((m) => {
      const next = { ...m.order, ...patch };
      return { order: next, said: { text: orderSaid(next) } };
    });

  return (
    <LabShell
      className="lab fo-lab"
      verdict={orderVerdict(order)}
      said={said}
      onReset={() => setModel(START)}
    >
      <div className="lab__mock fo-mock" data-lab-mock aria-hidden="true" inert>
        {sourceOrder(order).map((part) => {
          const n = visits.indexOf(part) + 1;
          const off = VISUAL[n - 1] !== part;
          return (
            <div
              key={part}
              className={`fo-part fo-part--${part}${off ? ' is-off' : ''}`}
              data-focus={n}
            >
              <span className="fo-num">{n}</span>
              {PART_LABEL[part]}
            </div>
          );
        })}
      </div>

      <div className="sem-controls">
        <LabChoice
          name={`${id}-src`}
          legend="Source order: the markup"
          options={SOURCES}
          value={order.source}
          onChange={(source) => change({ source })}
        />
        <LabChoice
          name={`${id}-ti`}
          legend="Positive tabindex"
          options={LIFTS}
          value={order.lift}
          onChange={(lift) => change({ lift })}
        />
      </div>

      <div className="lab-out">
        <div className="lab-code">
          <p className="alog__h">Seen on screen</p>
          <code>{VISUAL.map((p) => PART_LABEL[p]).join(' → ')}</code>
          <p className="alog__h">Tab visits</p>
          <output className="fo-visits" aria-live="off">
            {visits.map((p) => PART_LABEL[p]).join(' → ')}
          </output>
        </div>
        <div className="lab-code">
          <p className="alog__h">In the markup</p>
          <ol className="fo-src">
            {sourceOrder(order).map((part) => (
              <li key={part}>
                <code>{markup(order, part)}</code>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </LabShell>
  );
}
