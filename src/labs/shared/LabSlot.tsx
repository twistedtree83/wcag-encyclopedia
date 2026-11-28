import type { LabEntry } from './labEntry';
import { LabStepsProvider } from './LabShell';

/**
 * One registered lab as a page shows it: its title (an h3), the steps the lab shell lists, and
 * the lab judging `criterion`. The same on a criterion page and wherever a post embeds it
 * (`::lab`, S-08). `data-lab` names the lab, so a page showing several can be told apart.
 */
export function LabSlot({ lab: { id, title, steps, Lab }, criterion }: { lab: LabEntry; criterion: string }) {
  return (
    <div className="lab-slot" data-lab={id}>
      <h3>{title}</h3>
      <LabStepsProvider steps={steps}>
        <Lab criterion={criterion} />
      </LabStepsProvider>
    </div>
  );
}
