import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CaptionsLab, LiveCaptionsLab } from '../src/labs/captions/CaptionLabs';
import { MockPlayer } from '../src/live/PlayerWindow';
import { BRIEFING } from '../src/labs/captions/captions';

/** The mock player and the caption labs on the server (#65): paused at 0:00, no media element. */
describe('the mock player, pre-rendered', () => {
  it('starts paused at the start, with no video or audio element', () => {
    const html = renderToStaticMarkup(<MockPlayer clip={BRIEFING} track="accurate" />);
    expect(html).toContain('data-player-state="paused"');
    expect(html).toContain('0:00 / 0:15');
    expect(html).toContain('[Notification chime]');
    expect(html).not.toMatch(/<(video|audio|source|track)\b/);
  });

  it('shows no Captions button for a clip with no captions', () => {
    const html = renderToStaticMarkup(<MockPlayer clip={BRIEFING} track="none" />);
    expect(html).not.toContain('Captions</button>');
  });

  it.each([
    ['1.2.2', CaptionsLab, 'Play', '1.2.2 passes'],
    ['1.2.4', LiveCaptionsLab, 'Go live', '1.2.4 passes'],
  ] as const)('the %s lab starts paused and passing', (_n, Lab, play, verdict) => {
    const html = renderToStaticMarkup(<Lab />);
    expect(html).toContain(`>${play}</button>`);
    expect(html).toContain(verdict);
    expect(html).not.toMatch(/<(video|audio)\b/);
  });
});
