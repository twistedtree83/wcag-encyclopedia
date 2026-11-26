# Broken live examples are operated by simulated input, never real focus

Every criterion's fail and pass examples become live examples the reader can operate. The fail example stays inert and hidden from assistive technology, as static Broken stages are today. The reader operates it through simulated input: buttons such as "Press Tab", "Hover" and "Read it aloud" that move a drawn focus ring or cursor and write to the stage's instruments. Only the pass example takes real focus and real pointer events, and it carries the same input bar so touch readers can operate it too. A truly operable broken example would commit its failure against a real keyboard or screen-reader user, and this site obeys every criterion it documents.

## Considered options

- **Both stages genuinely live, the broken one excluded from axe.** Rejected. It would be more authentic, but an unlabelled input or a tooltip you can't dismiss fails the person using it, not just the scanner. Excluding it from axe hides the failure from the gate without removing it from the page.
- **Genuinely live only where the failure isn't a real violation for its user, simulated elsewhere.** Rejected. Almost every broken example *is* such a violation, so the exceptions would be few and hard to judge. Readers would also get two ways of operating examples with no visible reason for the difference.

## Consequences

- `data-depicts-failure` stays limited to static, inert content inside the Broken stage. A live fail example adds nothing to what axe skips.
- Instruments have to accept both simulated and real input events, since the same focus tracker and announcement log sit under both stages.
