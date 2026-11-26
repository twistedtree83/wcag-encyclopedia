import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { render, ROUTES } from '../src/entry-server';
import { CORPUS } from '../src/criteria/corpus';
import { LABS, type LabEntry } from '../src/labs/registry';
import { LabShell, LabStepsProvider } from '../src/labs/shared/LabShell';

/**
 * "How to use this lab": every registered lab carries four steps (goal, the controls, what to
 * try, what the result means), and the lab shell shows them above the lab on criterion pages.
 */

const STEPS = ['goal', 'controls', 'tryThis', 'result'] as const;
const text = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

describe('the steps every lab registers', () => {
  it('are required by the type', () => {
    // @ts-expect-error A lab without steps does not type-check.
    const missing: LabEntry = { id: 'x', title: 'Try it: x', criteria: ['1.4.3'], Lab: () => null };
    expect(missing.id).toBe('x');
  });

  it.each(LABS.map((l) => [l.id, l] as const))('%s has all four, each in full sentences', (_id, lab) => {
    for (const step of STEPS) {
      const said = lab.steps?.[step] ?? '';
      expect(said.length, `${step} is too short to help`).toBeGreaterThan(20);
      expect(said, `${step} ends without a full stop`).toMatch(/[.!?”’)]$/);
      expect(said, `${step} starts in lower case`).toMatch(/^[A-Z0-9“‘(]/);
    }
  });

  it.each(LABS.map((l) => [l.id, l] as const))(
    '%s names the criterion it judges when it says what the result means',
    (_id, lab) => {
      expect(lab.criteria.some((num) => lab.steps.result.includes(num))).toBe(true);
    },
  );

  it('never calls a criterion or a threshold a "rule"', () => {
    for (const lab of LABS) {
      for (const step of STEPS) expect(lab.steps[step], `${lab.id} ${step}`).not.toMatch(/\brules?\b/i);
    }
  });
});

describe('the steps on the page', () => {
  const steps = { goal: 'Goal one.', controls: 'Controls two.', tryThis: 'Try three.', result: 'Means four.' };
  const shell = (
    <LabShell verdict={{ criterion: '1.4.3', passes: true }} said={null} onReset={() => {}}>
      <div data-lab-mock />
    </LabShell>
  );

  it('are an ordered list of four, above the lab, under "How to use this lab"', () => {
    const html = renderToStaticMarkup(<LabStepsProvider steps={steps}>{shell}</LabStepsProvider>);
    expect(html.indexOf('How to use this lab')).toBeLessThan(html.indexOf('data-lab-mock'));
    const list = html.match(/<ol>(.*?)<\/ol>/)![1]!;
    expect(list.match(/<li>/g)).toHaveLength(4);
    expect(text(list)).toBe(
      'Goal. Goal one. The controls. Controls two. Try this. Try three. What it means. Means four.',
    );
  });

  it('are left out where a lab is shown without them, as on Home', () => {
    expect(renderToStaticMarkup(shell)).not.toContain('How to use this lab');
  });

  // Renders every criterion page, which can pass vitest's 5 s default on a loaded machine.
  it(
    'show once for each lab on every criterion page',
    () => {
      for (const record of CORPUS) {
        const route = ROUTES.find((r) => r.num === record.num)!;
        const html = render(route).html;
        const shown = html.match(/<h4>How to use this lab<\/h4>/g) ?? [];
        expect(shown.length, record.num).toBe(record.labs?.length ?? 0);
        for (const id of record.labs ?? []) {
          const lab = LABS.find((l) => l.id === id)!;
          expect(text(html), `${record.num} ${id}`).toContain(lab.steps.goal);
        }
      }
    },
    30_000,
  );

  it('are explained in the "Try it yourself" intro', () => {
    const html = render(ROUTES.find((r) => r.num === '2.4.5')!).html;
    const intro = text(html.slice(html.indexOf('id="lab-title"'), html.indexOf('class="lab-slot"')));
    expect(intro).toContain('A lab is a small working piece of interface that you change yourself');
    expect(intro).not.toContain('watch where it starts to fail');
  });
});
