import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DescriptionLab, MediaAlternativeLab, MediaOnlyLab } from '../src/labs/media-alternatives/MediaAltLabs';
import { MockPlayer, Transcript } from '../src/live/PlayerWindow';
import { BUDGET, EPISODE, FOLD } from '../src/labs/media-alternatives/mediaAlternatives';

/** Description cues, transcripts and the media alternative labs on the server (#66). */
describe('the mock player with description', () => {
  it('an audio-only clip is badged as audio and says it has no picture', () => {
    const html = renderToStaticMarkup(<MockPlayer clip={EPISODE} track="none" />);
    expect(html).toContain('>Audio</span>');
    expect(html).toContain('No picture: audio only.');
    expect(html).not.toMatch(/<(video|audio|source|track)\b/);
  });

  it('a clip with visual information marks it, and offers a Description toggle only with a track', () => {
    const off = renderToStaticMarkup(<MockPlayer clip={FOLD} track="accurate" />);
    expect(off).toContain('data-player-described="true"');
    expect(off).not.toContain('Description</button>');
    const on = renderToStaticMarkup(<MockPlayer clip={BUDGET} track="accurate" description />);
    expect(on).toContain('aria-pressed="true">Description</button>');
  });

  it('a clip with nothing to describe carries no description marker', () => {
    const html = renderToStaticMarkup(<MockPlayer clip={EPISODE} track="none" />);
    expect(html).not.toContain('data-player-described');
  });
});

describe('Transcript', () => {
  it('lists the clip as text under its heading', () => {
    const html = renderToStaticMarkup(<Transcript clip={EPISODE} kind="heard" label="Transcript" />);
    expect(html).toContain('Transcript');
    expect(html).toContain('<li>Dele: “And that is where the three weeks went.”</li>');
  });
});

describe('the media alternative labs', () => {
  it.each([
    ['1.2.1', MediaOnlyLab, '1.2.1 passes'],
    ['1.2.3', MediaAlternativeLab, '1.2.3 passes'],
    ['1.2.5', DescriptionLab, '1.2.5 passes'],
  ] as const)('the %s lab starts paused and passing, with no media element', (_n, Lab, verdict) => {
    const html = renderToStaticMarkup(<Lab />);
    expect(html).toContain('>Play</button>');
    expect(html).toContain(verdict);
    expect(html).not.toMatch(/<(video|audio)\b/);
  });
});
