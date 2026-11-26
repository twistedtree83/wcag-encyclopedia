import { useState, type ReactNode } from 'react';
import { EMPTY_QUERY, filterCriteria, isFiltering, type Query } from '../catalog/filter';
import { searchFromQuery } from '../catalog/urlQuery';
import { AA_BODY, AA_LARGE, AA_UI, AAA_BODY } from '../color/contrast';
import { Filters } from '../components/Filters';
import { CriteriaResults } from '../components/CriteriaResults';
import { PairCard } from '../components/PairCard';
import { Pledge } from '../components/Pledge';
import { CORPUS, criteriaInPrinciple, criterion } from '../criteria/corpus';
import { PRINCIPLES, principleFor } from '../criteria/structure';
import { ColourCheck, useColourPair } from '../labs/colour-check/ColourCheck';
import { FadeLab } from '../labs/fade-text/FadeLab';
import { PAIRS, type ColourPair } from '../labs/colour-check/pairs';
import { useRoute } from '../site/RouteContext';
import { PATHS, criterionPath } from '../site/routes';

/** The hero's colour check, and its text-colour hex field (`hc-fg`). */
const CHECK_ID = 'hc';

/** How many index cards Home shows before any filter is set. */
const INDEX_PREVIEW = 6;

/** The criterion the lab section is about. */
const LAB_CRITERION = '1.4.3';

const TOTAL = CORPUS.length;
const LEVEL_A = CORPUS.filter((c) => c.level === 'A').length;
const LEVEL_AA = CORPUS.filter((c) => c.level === 'AA').length;
const NEW_IN_22 = CORPUS.filter((c) => c.since === '2.2');

/**
 * Home (design guide §9.1): eight sections in order. The hero with the colour check, done
 * well and done badly, the four principles, the index, the fade lab, the three contrast
 * thresholds, new in 2.2 and the pledge. Every count is taken from the corpus.
 */
export function HomePage() {
  const check = useColourPair();
  const { set } = check;

  const tryPair = ({ fg, bg }: ColourPair) => {
    set(fg, bg);
    document.getElementById(CHECK_ID)?.scrollIntoView({ block: 'start' });
    document.getElementById(`${CHECK_ID}-fg`)?.focus({ preventScroll: true });
  };

  return (
    <>
      <Hero>
        <ColourCheck state={check} id={CHECK_ID} title="Check a colour pair" />
      </Hero>
      <Pairs onTry={tryPair} />
      <Principles />
      <Index />
      <Lab />
      <Thresholds />
      <NewIn22 />
      <section className="band" id="pledge" aria-labelledby="pledge-title">
        <Pledge level={2} id="pledge-title" />
      </section>
    </>
  );
}

function Hero({ children }: { children: ReactNode }) {
  const { href } = useRoute();
  const stats = [
    [TOTAL, 'criteria'],
    [LEVEL_A, 'at Level A'],
    [LEVEL_AA, 'at Level AA'],
    [NEW_IN_22.length, 'new in 2.2'],
  ] as const;
  return (
    <section className="hero" aria-labelledby="home-title">
      <svg className="loop" viewBox="0 0 1168 900" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M640 860 C 700 800, 660 720, 560 740" />
        <path d="M560 20 C 600 80, 520 140, 600 180" />
      </svg>
      <div className="txt">
        <p className="eyebrow">The WCAG 2.2 encyclopedia</p>
        <h1 id="home-title">
          Every WCAG criterion, <em>shown.</em>
        </h1>
        <p className="lede">
          {`The Web Content Accessibility Guidelines are the standard most accessibility laws and audits point to. This encyclopedia covers all ${TOTAL} Level A and AA success criteria: each one restated in plain language, shown failing and then passing, and filed under the principle it belongs to.`}
        </p>
        <div className="cta">
          <a className="btn p" href={href(PATHS.criteria)}>
            {`Browse all ${TOTAL} criteria `}
            <span aria-hidden="true">→</span>
          </a>
          <a className="btn o" href="#principles">
            Start with the four principles
          </a>
        </div>
        <ul className="mini" aria-label="The encyclopedia in numbers">
          {stats.map(([n, label]) => (
            <li key={label}>
              <b>{n}</b>
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </div>
      {children}
    </section>
  );
}

function Pairs({ onTry }: { onTry: (pair: ColourPair) => void }) {
  const { href } = useRoute();
  return (
    <section className="band" id="pairs" aria-labelledby="pairs-title">
      <div className="bh">
        <div>
          <h2 id="pairs-title">Done well, done badly</h2>
          <p>
            Colour contrast is one of the failures audits find most often, so it gets the
            checker above. Each pair shows the same message twice: the usual mistake on the
            left, the fix on the right. Load any pair into the checker to try your own fix.
          </p>
        </div>
        <a className="btn o" href={href(PATHS.colourCheck)}>
          Open the full colour check
        </a>
      </div>
      <ul className="pairs">
        {PAIRS.map((p) => (
          <PairCard key={p.title} pair={p} onTry={onTry} />
        ))}
      </ul>
    </section>
  );
}

function Principles() {
  const { href } = useRoute();
  return (
    <section className="band" id="principles" aria-labelledby="principles-title">
      <div className="bh">
        <div>
          <h2 id="principles-title">Four principles</h2>
          <p>
            WCAG groups every success criterion under four principles: content has to be
            perceivable, operable, understandable and robust. Each principle has a colour and a
            shape here, so the grouping survives greyscale.
          </p>
        </div>
      </div>
      <ul className="princ">
        {PRINCIPLES.map((p) => {
          const count = criteriaInPrinciple(p.num).length;
          return (
            <li key={p.num}>
              <a href={href(`${PATHS.criteria}?p=${p.num}`)} className={`pc p${p.num}`}>
                <span className="n">{p.num}</span>
                <div className="pc__body">
                  <span className="shape" aria-hidden="true" />
                  <h3>{p.name}</h3>
                  <p>{p.tagline}</p>
                  <span className="ct">{`${count} criteria`}</span>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * The index: the filter panel and the first six cards. Any filter shows every match, the same
 * way the All criteria page does; the state stays on this page.
 */
function Index() {
  const { href } = useRoute();
  const [query, setQuery] = useState<Query>(EMPTY_QUERY);
  const matches = filterCriteria(CORPUS, query);
  const shown = isFiltering(query) ? matches : matches.slice(0, INDEX_PREVIEW);
  return (
    <section className="band index" id="index" aria-labelledby="index-title">
      <div className="bh">
        <div>
          <h2 id="index-title">The index</h2>
          <p>
            Every Level A and AA success criterion in WCAG 2.2. Search by number, name, or the
            way it usually goes wrong.
          </p>
        </div>
      </div>
      <Filters id="home" query={query} onChange={(over) => setQuery({ ...query, ...over })} />
      <CriteriaResults records={shown} counts={{ shown: shown.length, total: TOTAL }} />
      <p className="more">
        <a className="btn o" href={href(PATHS.criteria + searchFromQuery(query))}>
          {`See all ${TOTAL} criteria`}
        </a>
      </p>
    </section>
  );
}

function Lab() {
  const { href } = useRoute();
  const record = criterion(LAB_CRITERION);
  const principle = record ? principleFor(record.guideline) : undefined;
  if (!record || !principle) throw new Error(`Home lab: no record for ${LAB_CRITERION}`);
  return (
    <section className="band" id="lab" aria-labelledby="lab-title">
      <div className="bh">
        <div>
          <h2 id="lab-title">Try it: fade the text</h2>
          <p>
            Each criterion page has a live exhibit you can break yourself. This one is about grey
            text.
          </p>
        </div>
        <a className="btn o" href={href(criterionPath(record.num))}>
          {`Read ${record.num} in full`}
        </a>
      </div>
      <div className="spot">
        <div className="info">
          <p className="k">{`${record.num} · Level ${record.level} · ${principle.name}`}</p>
          <h3>{record.name}</h3>
          <p>{record.plain}</p>
        </div>
        <FadeLab />
      </div>
    </section>
  );
}

const THRESHOLDS = [
  {
    ref: '1.4.3 · Level AA',
    name: 'Text',
    ratio: AA_BODY,
    fill: 'a1',
    body: `Body text against its background. Large text, 24px or 18.66px bold, needs ${AA_LARGE} : 1.`,
  },
  {
    ref: '1.4.6 · Level AAA, not in the index',
    name: 'Enhanced text',
    ratio: AAA_BODY,
    fill: 'a2',
    body: 'The stricter version, for people with moderately low vision who don’t use magnification.',
  },
  {
    ref: '1.4.11 · Level AA',
    name: 'Controls and graphics',
    ratio: AA_UI,
    fill: 'a3',
    body: 'Field borders, focus rings, icons and chart lines against whatever is next to them.',
  },
] as const;

function Thresholds() {
  return (
    <section className="band" aria-labelledby="thresholds-title">
      <div className="bh">
        <div>
          <h2 id="thresholds-title">Three contrast thresholds</h2>
          <p>
            People often treat contrast as one number. WCAG has three thresholds, and they
            measure different things.
          </p>
        </div>
      </div>
      <ul className="thresholds">
        {THRESHOLDS.map((t) => (
          <li key={t.name}>
            <p className="k">{t.ref}</p>
            <h3>{t.name}</h3>
            <p className="big">{`${t.ratio} : 1`}</p>
            <div className="bar" aria-hidden="true">
              <i style={{ width: `${(t.ratio / 21) * 100}%`, background: `var(--${t.fill})` }} />
            </div>
            <p>{t.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function NewIn22() {
  const { href } = useRoute();
  return (
    <section className="band" aria-labelledby="new-title">
      <div className="bh">
        <div>
          <h2 id="new-title">New in 2.2</h2>
          <p>
            {`WCAG 2.2 added ${NEW_IN_22.length} criteria at Levels A and AA. Most are about focus, pointers and forms that ask too much.`}
          </p>
        </div>
      </div>
      <ul className="news">
        {NEW_IN_22.map((record) => (
          <li key={record.num}>
            <a href={href(criterionPath(record.num))}>
              <span className="num">{record.num}</span>
              <h3>{record.name}</h3>
              <p>{`Level ${record.level}. ${record.pass.caption}`}</p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
