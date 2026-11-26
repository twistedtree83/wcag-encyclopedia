import { Pledge } from '../components/Pledge';
import { FEEDBACK_FORM_URL } from '../site/config';

/**
 * The About page: what the site is, and the accessibility statement (the pledge in full, then
 * how each commitment is checked, then where to report a problem). The footer links to the
 * sections by id: `#accessibility-statement` and `#how-we-test`.
 */
export function AboutPage() {
  return (
    <>
      <section className="ph" aria-labelledby="about-title">
        <p className="eyebrow">About</p>
        <h1 id="about-title">What this site is</h1>
        <p className="lede">
          The WCAG Encyclopedia explains every Level A and AA success criterion of WCAG 2.2 in
          plain language, and shows each one broken and then fixed, so you can see what goes
          wrong before you read why.
        </p>
        <div className="prose">
          <p>
            It is written for the people who build interfaces: developers with an audit finding
            to resolve, designers checking a palette, and anyone who wants to know what a
            criterion asks for without reading the specification first. Each criterion has its
            own page with a stable address you can paste into a ticket.
          </p>
          <p>
            The explanations are our own words, not the W3C's. When a decision matters, read
            the criterion's normative text on w3.org as well. The site documents the
            criteria; it does not audit your pages or certify conformance.
          </p>
        </div>
      </section>

      <section
        className="band"
        id="accessibility-statement"
        aria-labelledby="statement-title"
      >
        <div className="bh">
          <div>
            <h2 id="statement-title">Accessibility statement</h2>
            <p>
              This site aims to meet WCAG 2.2 at Level AA on every page, in the light and the
              dark theme, from 320px wide upwards. It holds itself to the four commitments
              below.
            </p>
          </div>
        </div>

        <Pledge level={3} />

        <div className="checks" id="how-we-test">
          <h3>How we test</h3>
          <p className="checks__intro">
            Every claim above is checked by the same command, <code>npm run verify</code>, which
            runs on every change and again before each release. If any check fails, nothing is
            published.
          </p>
          <ul>
            <li>
              <h4>Checked on every release</h4>
              <p>
                An axe scan visits every built page in both themes and at 320px, against WCAG
                2.0, 2.1 and 2.2 at Levels A and AA plus axe&rsquo;s best-practice rules. It
                allows zero violations, and it also fails a page that scrolls sideways at
                320px.
              </p>
              <p>
                axe cannot measure the contrast of borders, so the token contrast audit covers
                colour: a unit test that measures every pairing of text and surface colours in
                both themes and requires 4.5:1 for text and 3:1 for control borders, focus
                rings and graphics.
              </p>
            </li>
            <li>
              <h4>Keyboard first</h4>
              <p>
                On every page the scan moves focus to each link and button and fails if any of
                them shows no focus outline. A test also checks that &ldquo;Skip to
                content&rdquo; is the first thing the Tab key reaches and that it moves to the
                main content.
              </p>
            </li>
            <li>
              <h4>Broken examples are labelled</h4>
              <p>
                Elements that show a failure on purpose are the only things the axe scan
                leaves out, and a test fails if any of them sits outside a Broken example. The
                colours they use are audited the other way round: if one ever started to pass,
                the build would break. Failing sample text is hidden from screen readers and
                described in words instead.
              </p>
            </li>
            <li>
              <h4>Motion is optional</h4>
              <p>
                When your system asks for reduced motion, transitions and smooth scrolling are
                switched off, and animated demos wait for you to press Play. A browser test
                checks that the demos do not start on their own under that setting.
              </p>
            </li>
          </ul>
          <p className="checks__intro">
            Automated checks find a lot, but not everything. If something on the site is hard
            to use, please tell us through the feedback form.
          </p>
          <p>
            <a className="btn o" href={FEEDBACK_FORM_URL}>
              Report a problem with this site
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
